import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { db } from '../firebaseConfig'; // Firebase Firestore instance
import { getAuth } from 'firebase/auth';
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';

export default function WorkerHome({ navigation }) {
  const [user, setUser] = useState({ firstName: '', lastName: '' });
  const [shifts, setShifts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const auth = getAuth(); // Initialize Firebase Auth
  const currentUser = auth.currentUser; // Get the currently authenticated user

  useEffect(() => {
    if (currentUser) {
      const userId = currentUser.uid; // Retrieve the logged-in user's UID
      fetchUser(userId);
    }
  }, [currentUser]);

  // Fetch user data from Firestore
  const fetchUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUser(userDoc.data());
      } else {
        console.log('User does not exist');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch shifts from Firestore
  const fetchShifts = () => {
    const shiftsRef = collection(db, 'shifts');
    const shiftsQuery = query(shiftsRef); // No specific filter for now

    const unsubscribe = onSnapshot(shiftsQuery, (snapshot) => {
      const allShifts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShifts(allShifts);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchShifts();
    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (currentUser) {
      const userId = currentUser.uid;
      fetchUser(userId);
    }
    fetchShifts();
    setTimeout(() => setRefreshing(false), 1000);
  }, [currentUser]);

  const firstLetter = user.firstName.charAt(0).toUpperCase();

  const handleNavigateToAccount = () => {
    navigation.navigate('WorkerAccountDetails', { user });
  };

  // Cancel a shift
  const handleCancelShift = async (shiftId) => {
    Alert.alert(
      'Shift annuleren',
      'Weet je zeker dat je deze shift wilt annuleren?',
      [
        {
          text: 'Nee',
          style: 'cancel',
        },
        {
          text: 'Ja',
          onPress: async () => {
            try {
              const shiftRef = doc(db, 'shifts', shiftId);
              await updateDoc(shiftRef, { status: 'cancelled' });
              console.log(`Shift met ID ${shiftId} is geannuleerd.`);
            } catch (error) {
              console.error('Fout bij het annuleren van de shift:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Reserve a shift
  const handleReserveShift = async (shiftId) => {
    Alert.alert(
      'Shift reserveren',
      'Wil je deze shift reserveren?',
      [
        {
          text: 'Nee',
          style: 'cancel',
        },
        {
          text: 'Ja',
          onPress: async () => {
            try {
              const shiftRef = doc(db, 'shifts', shiftId);
              await updateDoc(shiftRef, { status: 'reserved', reservedBy: currentUser.uid });
              console.log(`Shift met ID ${shiftId} is gereserveerd.`);
            } catch (error) {
              console.error('Fout bij het reserveren van de shift:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const plannedShiftsCount = shifts.filter(
    (shift) => shift.status === 'reserved' && shift.reservedBy === currentUser?.uid
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <View style={styles.headerAligned}>
          <Text style={styles.greetingText}>Hallo {user.firstName}</Text>
          <TouchableOpacity style={styles.profileIcon} onPress={handleNavigateToAccount}>
            <Text style={styles.profileInitial}>{firstLetter}</Text>
          </TouchableOpacity>
        </View>

        {/* Aantal Shifts Section */}
        <View style={styles.aantalShiftsSection}>
          <Text style={styles.aantalShiftsTitle}>Aantal shifts</Text>
          <Text style={styles.aantalShiftsCount}>{plannedShiftsCount}</Text>
        </View>

        <View style={styles.nextShiftSection}>
          <Text style={styles.nextShiftTitle}>Volgende shift</Text>
          {shifts.length > 0 && (
            <View style={styles.nextShiftBox}>
              <Text style={styles.nextShiftDetails}>Datum: {new Date(shifts[0].date.seconds * 1000).toLocaleDateString('nl-NL')}</Text>
              <Text style={styles.nextShiftDetails}>Start: {new Date(shifts[0].date.seconds * 1000).toLocaleTimeString('nl-NL')}</Text>
            </View>
          )}
        </View>

        {/* Planned Shifts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geplande Shifts</Text>
          {shifts
            .filter((shift) => shift.status === 'reserved' && shift.reservedBy === currentUser.uid)
            .map((shift) => (
              <View key={shift.id} style={styles.plannedShift}>
                <View>
                  <Text style={styles.plannedShiftDay}>{shift.day || 'Geen dag opgegeven'}</Text>
                  <Text style={styles.plannedShiftDate}>{new Date(shift.date.seconds * 1000).toLocaleDateString('nl-NL')}</Text>
                  <Text style={styles.plannedShiftTime}>Start: {new Date(shift.date.seconds * 1000).toLocaleTimeString('nl-NL')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelShift(shift.id)}
                >
                  <Text style={styles.cancelButtonText}>Annuleren</Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>

        {/* Free Shifts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beschikbare Shifts</Text>
          {shifts
            .filter((shift) => shift.status === 'available')
            .map((shift) => (
              <View key={shift.id} style={styles.freeShift}>
                <View>
                  <Text style={styles.freeShiftDay}>{shift.day || 'Geen dag opgegeven'}</Text>
                  <Text style={styles.freeShiftDate}>{new Date(shift.date.seconds * 1000).toLocaleDateString('nl-NL')}</Text>
                  <Text style={styles.freeShiftTime}>Start: {new Date(shift.date.seconds * 1000).toLocaleTimeString('nl-NL')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.reserveButton}
                  onPress={() => handleReserveShift(shift.id)}
                >
                  <Text style={styles.reserveButtonText}>Reserveren</Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
  },
  headerAligned: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  profileIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  aantalShiftsSection: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aantalShiftsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aantalShiftsCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextShiftSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextShiftTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nextShiftBox: {
    marginBottom: 8,
  },
  nextShiftDetails: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  plannedShift: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  freeShift: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F9E9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  reserveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});











