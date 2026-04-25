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

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
