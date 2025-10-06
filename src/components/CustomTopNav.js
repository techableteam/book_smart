import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import images from "../assets/images";

const { height, width: SCREEN_WIDTH } = Dimensions.get("window");

const CustomTopNav = ({ selectedTab, setSelectedTab }) => {
  const [isWrapped, setIsWrapped] = useState(false);
  const tabs = [
    { key: "Home" },
    { key: "Staff" },
    { key: "Shifts" },
  ];

  const onLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    if (width < SCREEN_WIDTH) {
      setIsWrapped(true);  // Set wrapped state if the container's width is less than screen width
    } else {
      setIsWrapped(false);
    }
  };

  return (
    <View style={styles.navContainer}>
      <View style={styles.logoContainer}>
        <Image source={images.logo} resizeMode="contain" style={styles.logoImage} />
        <Text style={styles.title}>Team Scheduler</Text>
      </View>

      <View
        style={[
          styles.tabContainer,
          isWrapped && { marginTop: 10, justifyContent: "flex-end" }, // Apply margin and end positioning if wrapped
        ]}
        onLayout={onLayout} // Use onLayout to detect layout changes
      >
        {tabs.map(({ key }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, selectedTab === key && styles.activeTab]}
            onPress={() => setSelectedTab(key)}
          >
            <Text style={[styles.tabText, selectedTab === key && styles.activeTabText]}>
              {key}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "bold",
  },
  navContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#7A8A91",
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "100%",
    marginTop: height * 0.15,
    flexWrap: "wrap",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  tab: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#6E7E86",
    borderRadius: 8,
    flexDirection: "row",
  },
  tabText: {
    color: "#fff",
    fontWeight: "500",
  },
});

export default CustomTopNav;
