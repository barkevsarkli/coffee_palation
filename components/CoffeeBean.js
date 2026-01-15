import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BEAN_SIZE } from '../utils/constants';

const CoffeeBean = ({ x, y }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bean,
        {
          left: x,
          top: y,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Text style={styles.emoji}>🫘</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bean: {
    position: 'absolute',
    width: BEAN_SIZE,
    height: BEAN_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: BEAN_SIZE - 3,
  },
});

export default CoffeeBean;

