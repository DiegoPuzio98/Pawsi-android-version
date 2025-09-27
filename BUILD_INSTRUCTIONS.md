# Pawsi Android Build Instructions

## Prerequisites

1. **Android Studio** installed with Android SDK
2. **Java 17** or higher
3. **Node.js** and **npm**
4. **Git** for version control

## Setup Instructions

### 1. Export and Clone Project

1. Export this project to GitHub using the "Export to Github" button
2. Clone your repository:
   ```bash
   git clone YOUR_GITHUB_REPO_URL
   cd your-project-folder
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Web Assets

```bash
npm run build
```

### 4. Initialize Capacitor (if not already done)

```bash
npx cap init
```

### 5. Add Android Platform

```bash
npx cap add android
```

### 6. Configure Google Sign-In

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sign-In API
4. Create OAuth 2.0 credentials:
   - Application type: Android
   - Package name: `app.lovable.pawsi`
   - SHA-1 certificate fingerprint (get from your keystore)

5. Update `capacitor.config.ts` with your Google Client ID:
   ```typescript
   plugins: {
     GoogleAuth: {
       scopes: ['profile', 'email'],
       serverClientId: 'YOUR_ACTUAL_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
       forceCodeForRefreshToken: true,
     },
   }
   ```

### 7. Configure Release Signing

1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias pawsi-key
   ```

2. Copy `android/key.properties.sample` to `android/key.properties`

3. Update `android/key.properties` with your keystore information:
   ```
   PAWSI_UPLOAD_STORE_FILE=../release-keystore.jks
   PAWSI_UPLOAD_STORE_PASSWORD=your_keystore_password
   PAWSI_UPLOAD_KEY_ALIAS=pawsi-key
   PAWSI_UPLOAD_KEY_PASSWORD=your_key_password
   ```

### 8. Update App Icons and Splash Screen

Replace placeholder files with your actual assets:
- `android/app/src/main/res/mipmap-*/ic_launcher.png` (app icons)
- `android/app/src/main/res/drawable/ic_splash.png` (splash screen)

### 9. Sync Capacitor

```bash
npx cap sync android
```

## Building the App

### Debug Build
```bash
cd android
./gradlew assembleDebug
```

### Release Build (APK)
```bash
cd android
./gradlew assembleRelease
```

### Release Build (AAB for Google Play)
```bash
cd android
./gradlew bundleRelease
```

The generated files will be in:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Running on Device/Emulator

### Development with Hot Reload
```bash
npx cap run android
```

### Install APK on Device
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Google Play Store Preparation

1. **Test thoroughly** on multiple devices and Android versions
2. **Upload AAB file** (not APK) to Google Play Console
3. **Complete store listing** with descriptions, screenshots, etc.
4. **Set up app signing** in Google Play Console
5. **Configure content rating** and target audience
6. **Add privacy policy** URL
7. **Test with internal testing** before public release

## Troubleshooting

### Common Issues

1. **Build fails**: Check that all dependencies are installed and Android SDK is properly configured
2. **Google Sign-In not working**: Verify OAuth configuration and package name
3. **Release signing fails**: Check keystore path and passwords in `key.properties`
4. **App crashes on startup**: Check native plugin compatibility and permissions

### Useful Commands

```bash
# Clean build
cd android && ./gradlew clean

# Check for lint issues
cd android && ./gradlew lint

# Generate SHA-1 fingerprint
keytool -list -v -keystore release-keystore.jks -alias pawsi-key

# View connected devices
adb devices

# View app logs
adb logcat | grep Pawsi
```

## Support

For more detailed Capacitor documentation:
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Developer Guide](https://developer.android.com/guide)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)