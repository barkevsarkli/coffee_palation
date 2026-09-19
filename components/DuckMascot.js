import React, { memo, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, View } from 'react-native';

const INK = '#2B1410';
const WHITE = '#FFFFFF';
const SHADE = '#E8E4DC';
const ORANGE = '#FFA000';
const native = Platform.OS !== 'web';
const BEATS = [0, 0.2, 0.4, 0.6, 0.8, 1];

// Simple oval wings keep the chosen silhouette; each has its own gesture curve.
// Angles are mirrored at the shoulder so negative angles lift a wing outward.
const POSES = {
  rest: { left: [-8, -8, -8, -8, -8, -8], right: [-8, -8, -8, -8, -8, -8] },
  wave: { left: [-8, -8, -8, -8, -8, -8], right: [-8, -150, -108, -150, -108, -8] },
  shrug: { left: [-8, -70, -52, -70, -40, -8], right: [-8, -62, -45, -62, -35, -8] },
  clap: { left: [30, 65, 30, 65, 30, 30], right: [30, 65, 30, 65, 30, 30] },
  cheer: { left: [-125, -155, -120, -155, -120, -125], right: [-140, -115, -155, -115, -155, -140] },
  scold: { left: [38, 38, 38, 38, 38, 38], right: [-72, -105, -72, -105, -72, -72] },
  rush: { left: [-55, 22, -55, 22, -55, -55], right: [22, -55, 22, -55, 22, 22] },
  yawn: { left: [12, 16, 20, 16, 12, 12], right: [105, 120, 128, 120, 105, 105] },
  panic: { left: [-95, -145, -85, -145, -95, -95], right: [-130, -85, -145, -85, -130, -130] },
  deflate: { left: [14, 8, 0, -8, -12, -12], right: [14, 8, 0, -8, -12, -12] },
};

function DuckMascot({ size, mood = 'neutral', gesture = 'rest', trigger }) {
  const breath = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const speech = useRef(new Animated.Value(0)).current;
  const action = useRef(new Animated.Value(1)).current;
  const [reducedMotion, setReducedMotion] = useState(false);
  const sleepy = mood === 'sleepy';
  const dead = mood === 'dead';
  const delighted = mood === 'happy' || mood === 'excited';
  const pose = POSES[gesture] || POSES.rest;
  const wingsInFront = ['clap', 'scold', 'yawn'].includes(gesture);
  const s = value => size * value;
  const timing = (value, toValue, duration) => Animated.timing(value, {
    toValue, duration, useNativeDriver: native, isInteraction: false,
    easing: Easing.inOut(Easing.sin),
  });

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (active) setReducedMotion(value);
    }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { active = false; subscription?.remove(); };
  }, []);

  useEffect(() => {
    breath.setValue(0);
    if (dead || reducedMotion) return undefined;
    const duration = sleepy ? 1500 : 950;
    const loop = Animated.loop(Animated.sequence([
      timing(breath, 1, duration), timing(breath, 0, duration),
    ]));
    loop.start();
    return () => loop.stop();
  }, [breath, dead, sleepy, reducedMotion]);

  useEffect(() => {
    blink.setValue(1);
    if (sleepy || dead || reducedMotion) return undefined;
    let active = true;
    let timer;
    let animation;
    const schedule = () => {
      if (!active) return;
      timer = setTimeout(() => {
        animation = Animated.sequence([timing(blink, 0.08, 75), timing(blink, 1, 110)]);
        animation.start(({ finished }) => { if (finished && active) schedule(); });
      }, 2200 + Math.random() * 2600);
    };
    schedule();
    return () => { active = false; clearTimeout(timer); animation?.stop(); };
  }, [blink, sleepy, dead, reducedMotion]);

  useEffect(() => {
    speech.setValue(0);
    action.setValue(reducedMotion ? 1 : 0);
    if (reducedMotion) return undefined;
    // Speech duration follows the line; gestures have their own slower rhythm.
    const syllables = Math.min(12, Math.max(5, Math.ceil(String(trigger || '').length / 5)));
    const animation = Animated.parallel([
      timing(action, 1, dead ? 850 : 1600),
      Animated.sequence(Array.from({ length: syllables }, (_, i) => [
        timing(speech, i % 3 === 0 ? 0.65 : 1, 85),
        timing(speech, 0, i % 3 === 0 ? 145 : 95),
      ]).flat()),
    ]);
    animation.start();
    return () => animation.stop();
  }, [trigger, mood, gesture, reducedMotion, speech, action, dead]);

  const shape = (x, y, w, h, color, extra = {}) => ({
    position: 'absolute', left: s(x), top: s(y), width: s(w), height: s(h),
    borderRadius: s(Math.min(w, h) / 2), backgroundColor: color, ...extra,
  });
  const bodyTilt = action.interpolate({ inputRange: BEATS, outputRange:
    dead ? ['0deg', '3deg', '8deg', '12deg', '14deg', '14deg'] :
      mood === 'angry' ? ['0deg', '-6deg', '5deg', '-5deg', '3deg', '0deg'] :
        ['0deg', '-3deg', '3deg', '-3deg', '2deg', '0deg'],
  });
  const hop = action.interpolate({ inputRange: BEATS, outputRange:
    gesture === 'cheer' ? [0, -s(0.07), 0, -s(0.07), 0, 0] : [0, 0, 0, 0, 0, 0],
  });

  const wing = (side) => {
    const sign = side === 'left' ? -1 : 1;
    const shoulder = action.interpolate({
      inputRange: BEATS,
      outputRange: pose[side].map(value => `${value * sign}deg`),
    });
    return (
      <Animated.View key={side} style={{
        position: 'absolute', left: s(side === 'left' ? 0.22 : 0.78), top: s(0.49),
        width: 0, height: 0, transform: [{ rotate: shoulder }],
      }}>
        <View style={shape(-0.08, 0, 0.16, 0.36, SHADE)} />
      </Animated.View>
    );
  };

  const eye = (center) => {
    if (dead) return <View key={center} style={shape(center - 0.045, 0.255, 0.09, 0.09, 'transparent')}>
      {[-45, 45].map(angle => <View key={angle} style={shape(0, 0.034, 0.09, 0.022, INK, {
        transform: [{ rotate: `${angle}deg` }],
      })} />)}
    </View>;
    if (sleepy || delighted) return <View key={center} style={shape(center - 0.045, 0.28, 0.09, 0.045, 'transparent', {
      [sleepy ? 'borderBottomWidth' : 'borderTopWidth']: s(0.02),
      [sleepy ? 'borderBottomColor' : 'borderTopColor']: INK,
    })} />;
    const diameter = mood === 'shocked' ? 0.105 : 0.086;
    return <Animated.View key={center} style={shape(center - diameter / 2, 0.30 - diameter / 2, diameter, diameter, INK, {
      transform: [{ scaleY: blink }],
    })} />;
  };

  return (
    <View pointerEvents="none" accessible={false} style={{ width: size, height: size }}>
      <Animated.View style={{ width: size, height: size, transform: [
        { translateY: Animated.add(hop, breath.interpolate({ inputRange: [0, 1], outputRange: [0, -s(0.022)] })) },
        { rotate: bodyTilt },
      ] }}>
        {/* Option 4: two flat feet, one continuous white silhouette and two tufts. */}
        {[0.30, 0.52].map(x => <View key={x} style={shape(x, 0.905, 0.18, 0.09, ORANGE)} />)}
        {/* The wings sit behind the body, just as in the approved neutral drawing. */}
        {!wingsInFront && wing('left')}
        {!wingsInFront && wing('right')}
        <View style={shape(0.24, 0.06, 0.52, 0.78, WHITE, {
          borderTopLeftRadius: s(0.26), borderTopRightRadius: s(0.26),
        })} />
        <View style={shape(0.22, 0.45, 0.56, 0.50, WHITE, {
          borderTopLeftRadius: s(0.20), borderTopRightRadius: s(0.20),
          borderBottomLeftRadius: s(0.25), borderBottomRightRadius: s(0.25),
        })} />
        <View style={shape(0.42, -0.02, 0.10, 0.20, WHITE, { transform: [{ rotate: '-22deg' }] })} />
        <View style={shape(0.51, 0.01, 0.08, 0.14, WHITE, { transform: [{ rotate: '22deg' }] })} />
        {eye(0.37)}
        {eye(0.63)}
        {mood === 'angry' && [0.32, 0.58].map((x, i) => <View key={x} style={shape(x, 0.22, 0.10, 0.022, INK, {
          transform: [{ rotate: i ? '-22deg' : '22deg' }],
        })} />)}
        {/* At rest this is the single orange bill from the chosen preview. */}
        <Animated.View style={shape(0.38, 0.40, 0.24, 0.11, ORANGE, {
          transform: [{ scaleY: speech.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] }) }],
        })} />
        {wingsInFront && wing('left')}
        {wingsInFront && wing('right')}
      </Animated.View>
    </View>
  );
}

export default memo(DuckMascot);
