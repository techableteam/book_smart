import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';

export default AnimatedHeader = ({ title }) => {
  const [colorIndex, setColorIndex] = useState(0); // Initial color index
  const [backgroundColor, setBackgroundColor] = useState(new Animated.Value(0)); // Animated value

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % 3); // Cycle through 0, 1, 2
    }, 1000);

    return () => clearInterval(interval); // Clear interval when component unmounts
  }, []);

  useEffect(() => {
    // Animate the background color based on colorIndex
    Animated.timing(backgroundColor, {
      toValue: colorIndex,
      duration: 1000, // Animate over 1 second
      useNativeDriver: false,
    }).start();
  }, [colorIndex]);

  // Interpolate the animated value to get the desired color transitions
  const bgColor = backgroundColor.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['rgb(255,0,0)', 'rgb(128,0,128)', 'rgb(0,0,0)'], // Red -> Purple -> Black
  });

  return (
    <Animated.View style={[styles.backTitle, { backgroundColor: bgColor }]}>
      <Text style={styles.title}>{title}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  backTitle: {
    backgroundColor: 'black',
    width: '100%',
    height: '55',
    marginTop: 10,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
    color: 'black',
    top: 10
  },
  title: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
    backgroundColor: 'transparent',
    paddingVertical: 10
  },
});
