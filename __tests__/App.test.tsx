/**
 * @format
 */

import 'react-native';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// Mock react-native-webview
jest.mock('react-native-webview', () => {
  const MockReact = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: (props: object) => MockReact.createElement(View, props),
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const MockReact = require('react');
  const {View} = require('react-native');
  return {
    SafeAreaProvider: ({children}: {children: MockReact.ReactNode}) =>
      MockReact.createElement(View, {}, children),
    SafeAreaView: ({children, style}: {children: MockReact.ReactNode; style?: object}) =>
      MockReact.createElement(View, {style}, children),
    useSafeAreaInsets: () => ({top: 0, right: 0, bottom: 0, left: 0}),
  };
});

// Mock react-native-biometrics
jest.mock('react-native-biometrics', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      isSensorAvailable: jest.fn().mockResolvedValue({
        available: false,
        biometryType: undefined,
      }),
      simplePrompt: jest.fn().mockResolvedValue({success: true}),
    })),
  };
});

// Mock @react-native-community/push-notification-ios
jest.mock('@react-native-community/push-notification-ios', () => ({
  requestPermissions: jest.fn().mockResolvedValue({alert: true, badge: true, sound: true}),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
    // Allow async biometrics check and state update to complete
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  });
});
