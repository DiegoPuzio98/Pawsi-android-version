import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4587b22d9e294609825aa9243771d8ef',
  appName: 'Pawsi',
  webDir: 'dist',
  server: {
    url: 'https://4587b22d-9e29-4609-825a-a9243771d8ef.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;