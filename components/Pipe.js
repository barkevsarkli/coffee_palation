import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../styles/theme';
import { SCREEN_HEIGHT, GROUND_HEIGHT } from '../utils/constants';

const Pipe = ({ x, width, topHeight, gapSize }) => {
  const bottomHeight = SCREEN_HEIGHT - GROUND_HEIGHT - topHeight - gapSize;
  const bottomY = topHeight + gapSize;

  return (
    <>
      {/* Top Pipe */}
      <View
        style={[
          styles.pipe,
          {
            left: x,
            top: 0,
            width: width,
            height: topHeight,
          },
        ]}
      />
      {/* Bottom Pipe */}
      <View
        style={[
          styles.pipe,
          {
            left: x,
            top: bottomY,
            width: width,
            height: bottomHeight,
          },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  pipe: {
    position: 'absolute',
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: '#5A8F51',
  },
});

export default Pipe;

