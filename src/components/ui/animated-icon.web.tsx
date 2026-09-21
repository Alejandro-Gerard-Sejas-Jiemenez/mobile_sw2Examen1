import { Image } from 'expo-image';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AnimationTokens } from '@/constants/theme';
import {
  animatedIconStyles,
  iconGlowKeyframe,
  webGlowKeyframe,
  webLogoKeyframe,
  webScaleKeyframe,
} from '@/styles';
import classes from './animated-icon.module.css';

export function AnimatedSplashOverlay() {
  return null;
}

export function AnimatedIcon() {
  return (
    <View style={animatedIconStyles.webIconContainer}>
      <Animated.View entering={iconGlowKeyframe.duration(AnimationTokens.GLOW_DURATION_MS)} style={animatedIconStyles.glow}>
        <Image style={animatedIconStyles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View style={animatedIconStyles.background} entering={webScaleKeyframe.duration(AnimationTokens.WEB_DURATION_MS)}>
        <div className={classes.expoLogoBackground} />
      </Animated.View>

      <Animated.View style={animatedIconStyles.imageContainer} entering={webLogoKeyframe.duration(AnimationTokens.WEB_DURATION_MS)}>
        <Image style={animatedIconStyles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}
