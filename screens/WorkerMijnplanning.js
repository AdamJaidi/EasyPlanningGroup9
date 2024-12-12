import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WorkerMijnplanning({ navigation }) {
  const [selectedDay, setSelectedDay] = useState(3); // Example selected day

  const daysOfWeek = ["ma", "di", "wo", "do", "vr", "za", "zo"];
  const daysInMonth = [
    { day: 25, isGray: true }, { day: 26, isGray: true }, { day: 27, isGray: true },
    { day: 28, isGray: true }, { day: 29, isGray: true }, { day: 30, isGray: true },
    { day: 1 }, { day: 2 }, { day: 3, isSelected: true }, { day: 4 }, { day: 5 },
    { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 },
    { day: 12 }, { day: 13 }, { day: 14 }, { day: 15 }, { day: 16 }, { day: 17 },
    { day: 18 }, { day: 19 }, { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 },
    { day: 24 }, { day: 25 }, { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 },
    { day: 30 }, { day: 31 }, { day: 1, isGray: true }, { day: 2, isGray: true },
    { day: 3, isGray: true }, { day: 4, isGray: true }, { day: 5, isGray: true },
  ];

  const handleDayClick = (day) => {
    setSelectedDay(day);
    console.log(`Day ${day} clicked`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2D4535" />
        </TouchableOpacity>
        <Text style={styles.header}>Mijn planning</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeaderContainer}>
          <Ionicons name="chevron-back" size={24} color="#2D4535" />
          <Text style={styles.calendarHeader}>December 2024</Text>
          <Ionicons name="chevron-forward" size={24} color="#2D4535" />
        </View>
        <View style={styles.daysOfWeekContainer}>
          {daysOfWeek.map((day, index) => (
            <Text key={index} style={styles.dayOfWeekText}>{day}</Text>
          ))}
        </View>
        <View style={styles.daysContainer}>
          {daysInMonth.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.day,
                item.isGray && styles.grayDay,
                item.day === selectedDay && styles.selectedDay,
              ]}
              onPress={() => handleDayClick(item.day)}
            >
              <Text
                style={[
                  styles.dayText,
                  item.isGray && styles.grayText,
                  item.day === selectedDay && styles.selectedText,
                ]}
              >
                {item.day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Tab Navigation (Placeholder) */}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5F3F6",
  },
  headerContainer: {
    paddingTop:50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D4535",
  },
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  calendarHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D4535",
  },
  daysOfWeekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  dayOfWeekText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D4535",
    flex: 1,
    textAlign: "center",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  day: {
    width: "13%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D4535",
  },
  grayDay: {
    opacity: 0.3,
  },
  grayText: {
    color: "#757575",
  },
  selectedDay: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },
  selectedText: {
    color: "#FFFFFF",
  },
});
