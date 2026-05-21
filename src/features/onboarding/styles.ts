import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f5f4',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  eyebrow: {
    color: '#9e4c3e',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    color: '#141414',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0,
  },
  sampleText: {
    color: '#8d807d',
    textAlign: 'center',
    letterSpacing: 0,
  },
  visualizerWrap: {
    position: 'absolute',
    justifyContent: 'flex-end',
  },
  visualizer: {
    flexGrow: 0,
  },
  voiceDetails: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 4,
    minHeight: 76,
  },
  voiceName: {
    color: '#151515',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: 0,
  },
  voiceTone: {
    color: '#151515',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
  },
  voiceList: {
    position: 'absolute',
    flexGrow: 0,
    width: '100%',
  },
  voiceListContent: {
    alignItems: 'center',
  },
  orbPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#7b6e69',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },
  orbCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  activeOrbGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
  },
  orbInitial: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    color: '#8d807d',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },
  continueButton: {
    position: 'absolute',
    bottom: 34,
    height: 52,
    paddingHorizontal: 32,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
  },
  continueText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
