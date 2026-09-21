import { StyleSheet } from 'react-native';
import { AnimationTokens, Colors } from '@/constants/theme';

export const animatedIconStyles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: AnimationTokens.GLOW_SIZE,
    height: AnimationTokens.GLOW_SIZE,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: AnimationTokens.ICON_SIZE,
    height: AnimationTokens.ICON_SIZE,
    zIndex: 100,
  },
  webIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: AnimationTokens.ICON_SIZE,
    height: AnimationTokens.ICON_SIZE,
  },
  webContainer: {
    alignItems: 'center',
    width: '100%',
    zIndex: 1000,
    position: 'absolute',
    top: AnimationTokens.WEB_TOP_OFFSET,
  },
  image: {
    width: AnimationTokens.LOGO_WIDTH,
    height: AnimationTokens.LOGO_HEIGHT,
  },
  webImage: {
    position: 'absolute',
    width: AnimationTokens.LOGO_WIDTH,
    height: AnimationTokens.LOGO_HEIGHT,
  },
  background: {
    borderRadius: AnimationTokens.LOGO_BORDER_RADIUS,
    width: AnimationTokens.ICON_SIZE,
    height: AnimationTokens.ICON_SIZE,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
