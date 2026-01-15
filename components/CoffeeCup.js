import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CUP_SIZE } from '../utils/constants';

const CoffeeCup = ({ x, y, velocity }) => {
  // Calculate rotation based on velocity (-30° to +90°)
  const rotation = Math.max(-30, Math.min(90, velocity * 5));

  return (
    <View
      style={[
        styles.cup,
        {
          left: x,
          top: y,
          transform: [{ rotate: `${rotation}deg` }],
        },
      ]}
    >
      <Text style={styles.emoji}>☕</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cup: {
    position: 'absolute',
    width: CUP_SIZE,
    height: CUP_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: CUP_SIZE - 5,
  },
});

export default CoffeeCup;

