import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { AnimationTokens } from '@/constants/theme';
import {
  animatedIconStyles,
  iconGlowKeyframe,
  iconLogoKeyframe,
  iconScaleKeyframe,
  splashKeyframe,
} from '@/styles';

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const image = (
    <Image style={animatedIconStyles.image} source={require('@/assets/images/expo-logo.png')} />
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(AnimationTokens.SPLASH_DURATION_MS).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={animatedIconStyles.splashOverlay}>
      {image}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={animatedIconStyles.splashOverlay}>
      {image}
    </View>
  );
}

export function AnimatedIcon() {
  return (
    <View style={animatedIconStyles.iconContainer}>
      <Animated.View entering={iconGlowKeyframe.duration(AnimationTokens.GLOW_DURATION_MS)} style={animatedIconStyles.glow}>
        <Image style={animatedIconStyles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={iconScaleKeyframe.duration(AnimationTokens.SPLASH_DURATION_MS)} style={animatedIconStyles.background} />
      <Animated.View style={animatedIconStyles.imageContainer} entering={iconLogoKeyframe.duration(AnimationTokens.SPLASH_DURATION_MS)}>
        <Image style={animatedIconStyles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}
