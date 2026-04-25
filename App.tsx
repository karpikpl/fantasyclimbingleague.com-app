/**
 * Fantasy Climbing League
 * https://fantasyclimbingleague.com
 *
 * @format
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import ReactNativeBiometrics from 'react-native-biometrics';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

const APP_URL = 'https://fantasyclimbingleague.com';
const rnBiometrics = new ReactNativeBiometrics();

function registerForPushNotifications(): void {
  if (Platform.OS !== 'ios') {
    return;
  }
  PushNotificationIOS.requestPermissions({
    alert: true,
    badge: true,
    sound: true,
  });
  PushNotificationIOS.addEventListener('register', (token: string) => {
    // Device token received — send this to your notification server
    console.log('APNs device token:', token);
  });
  PushNotificationIOS.addEventListener('registrationError', (err: object) => {
    console.warn('Push notification registration error:', err);
  });
}

function LockScreen({
  onUnlock,
  biometryType,
}: {
  onUnlock: () => void;
  biometryType: string | undefined;
}): React.JSX.Element {
  const label =
    biometryType === 'FaceID'
      ? 'Unlock with Face ID'
      : biometryType === 'TouchID'
      ? 'Unlock with Touch ID'
      : 'Open App';

  return (
    <SafeAreaView style={styles.lockScreen}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.lockEmoji}>🧗</Text>
      <Text style={styles.lockTitle}>Fantasy Climbing</Text>
      <Text style={styles.lockSubtitle}>fantasyclimbingleague.com</Text>
      <TouchableOpacity
        style={styles.unlockButton}
        onPress={onUnlock}
        accessibilityLabel={label}>
        <Text style={styles.unlockText}>{label}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  const webViewRef = useRef<WebView>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometryType, setBiometryType] = useState<string | undefined>(
    undefined,
  );

  const authenticate = useCallback(async () => {
    const {available, biometryType: type} =
      await rnBiometrics.isSensorAvailable();
    setBiometryType(type);

    if (!available) {
      // No biometrics on this device — open the app directly
      setIsAuthenticated(true);
      registerForPushNotifications();
      return;
    }

    try {
      const {success} = await rnBiometrics.simplePrompt({
        promptMessage: `Sign in to Fantasy Climbing`,
        cancelButtonText: 'Cancel',
        fallbackPromptMessage: 'Use Passcode',
      });
      if (success) {
        setIsAuthenticated(true);
        registerForPushNotifications();
      }
    } catch {
      // User cancelled — stay on lock screen
    }
  }, []);

  useEffect(() => {
    authenticate();
    return () => {
      PushNotificationIOS.removeEventListener('register');
      PushNotificationIOS.removeEventListener('registrationError');
    };
  }, [authenticate]);

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <LockScreen onUnlock={authenticate} biometryType={biometryType} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <WebView
          ref={webViewRef}
          source={{uri: APP_URL}}
          style={styles.webview}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator
              style={styles.loading}
              size="large"
              color="#1a73e8"
            />
          )}
          allowsBackForwardNavigationGestures={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lockScreen: {
    flex: 1,
    backgroundColor: '#1a237e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  lockTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 48,
  },
  unlockButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  unlockText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a237e',
  },
});

export default App;
