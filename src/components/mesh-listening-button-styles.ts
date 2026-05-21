import { StyleSheet } from 'react-native';

import { BUTTON_HEIGHT, BUTTON_RADIUS, LISTENING_WIDTH } from './mesh-listening-button-constants';

export const styles = StyleSheet.create({
  pressable: {
    height: BUTTON_HEIGHT,
    width: LISTENING_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_RADIUS,
    overflow: 'hidden',
    shadowColor: '#c7ccff',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  canvasClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BUTTON_RADIUS,
    overflow: 'hidden',
  },
});
