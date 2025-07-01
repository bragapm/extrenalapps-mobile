module.exports = {
  appName: "Temp Prototype Apps",
  appFolderName: "ExternalApps",
  bundleId: "com.template.prototypeku",
  androidVersionCode: 1,
  iosBuildNumber: "1",
  version: "1.0.0",
  appIcon: "./src/assets/images/app-icon.png",
};

// BAHASA
// NOTED : untuk IOS ubah nama folder nya manual dulu yaa baru jalankan
// gunakan : mv "ios/TempPrototype" "ios/Temp Prototype Apps"
// mv "ios/TempPrototype.xcodeproj" "ios/Temp Prototype Apps.xcodeproj"
// mv "ios/TempPrototype.xcworkspace" "ios/Temp Prototype Apps.xcworkspace"

// jalankan npm install -g react-native-rename dahulu
// kalo sudah selesai setup config nya jalankan
// npx react-native-rename "appName" -b bundleId

// appName ambil dari appName contoh NamaAppSaya
// bundleId ambil dari bundleId misalnya com.rama.namaappsaya

// lalu jalankan
// npx ts-node sync-version.ts

// ENGLISH
// NOTED: For iOS, manually rename the folder inside the ios/ directory to match your new app name before running the sync script.
// use : mv "ios/TempPrototype" "ios/Temp Prototype Apps"

// First, globally install react-native-rename:
// npm install -g react-native-rename

// After finishing your config setup, run:
// npx react-native-rename "appName" -b bundleId

// Use the value of "appName" from your config, e.g., NamaAppSaya
// Use the value of "bundleId" from your config, e.g., com.rama.namaappsaya
