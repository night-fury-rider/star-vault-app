# ⭐ StarVault

A powerful offline-first mobile application for managing and exploring actor-centric media data. Built with React Native CLI and TypeScript, StarVault demonstrates local-first architecture, strong data modeling, and clean separation of concerns.

---

<br />

# 📱 Screenshots

> _Coming soon_

---

<br />

# 🚀 Features

- **Star Management** — Create, read, update, and delete stars with rich profile data
- **Movie Association** — Link stars to movies with many-to-many relationships
- **Image Gallery** — Star image gallery stored on the local file system
- **Local Search** — Fast offline search by name and bio via SQLite
- **Import / Export** — Portable ZIP-based data backup and restore
- **Theme Switcher** — Three built-in themes (Sky Blue, Pink, Faint Orange)
- **Offline First** — Fully functional without internet connectivity

---

<br />

# 🧱 Tech Stack

| Layer            | Technology                               | Version |
| ---------------- | ---------------------------------------- | ------- |
| Core Technology  | React Native                             | v0.85   |
| Core Library     | React                                    | v19     |
| Language         | TypeScript                               | v5      |
| Database         | SQLite (`op-sqlite`)                     | v15     |
| State Management | Redux Toolkit                            | v2      |
| Navigation       | React Navigation (Bottom Tabs)           | v7      |
| Image Picker     | `react-native-image-picker`              | v8      |
| Date Picker      | `@react-native-community/datetimepicker` | v9      |
| Document Picker  | `@react-native-documents/picker`         | v12     |
| Icons            | `react-native-vector-icons`              | v10     |
| Theming          | React Context API (custom, no library)   |         |

---

<br />

# 📂 Project Structure

```
StarVault/
├── src/
│   ├── modules/
│   │   ├── stars/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── store/
│   │   ├── movies/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── store/
│   │   └── settings/
│   │       ├── screens/
│   │       └── components/
│   ├── navigation/
│   │   └── TabNavigator.tsx
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── ThemeContext.tsx
│   │   └── index.ts
│   ├── db/
│   ├── store/
│   ├── types/
│   └── App.tsx
├── android/
├── ios/
├── index.js
└── app.json
```

---

<br />

# 🛠 Getting Started

## ⚙️ Prerequisites

| Tool             | Version    |
| ---------------- | ---------- |
| Node.js          | >= 22.13.0 |
| React Native CLI | Latest     |
| Android Studio   | Latest     |
| JDK              | 17         |

---

<br />

### Install dependencies

```bash
npm install
```

### Create the dev build

```
npm run testmode
```

### Create the prod build

```
npm run prodmode
```

### Install the app

```
npm run android
```

### Enable Wireless hot reload on Mobile

- Make sure that mobile with USB debugging enabled
- Make sure that mobile and laptop are on the same wifi.
- Run `adb devices` to get Mobile device name.
- Run `ipconfig getifaddr en0` to get the IP (v4).
- Connect mobile to laptop via USB cable.
- Install the app

```
npm run android
```

- Disconnect mobile from USB. Metro bundler will be disconnected.
- Shake the mobile to open the React Native Dev menu. Select Settings. Open Debug server host & port for device.
- Enter IP v4 (from step 1) and port number (Generally 8081). Ex. `11.22.33.44:8081`
- Shake the mobile to open the React Native Dev menu .
- Select Reload. Now hot reload should work.

  <br/><br/>

---

# 🎨 Theming

StarVault includes a custom theming system built with React Context API — no external libraries.

| Theme                | Preview   |
| -------------------- | --------- |
| 🩵 Sky Blue (default) | `#0288D1` |
| 🌸 Pink              | `#E91E8C` |
| 🍊 Faint Orange      | `#F57C00` |

Switch themes anytime from the **Settings** tab.

---

# Database Inspection

Pull the SQLite database from the Android emulator to your desktop:

```bash
adb shell "run-as com.yuvrajpatil.apps.starvault cat /data/data/com.yuvrajpatil.apps.starvault/databases/starvault.db" > ~/Desktop/starvault.db
```

This will create `starvault.db` on the Desktop.

Open DBeaver. Press Create New Database. Select Database "SQLite". Select the `starvault.db` in the path and press the Finish Button.

Now we can see the current database values using DBeaver.

# Create the release build

- Make sure that `my-upload-key.keystore` file is kept under the `android/app` directory
- Make sure that `gradle.properties` file is kept under the `.gradle` directory. In Windows, `.gradle` directory is under `C:\Users\<username>`.
- Increment `version` in `package.json`.
- Increment `versionMajor` or `versionMinor` or `versionPatch` in `android/app/build.gradle`
- Create the apk build.

```
npm run android-build-apk
```

- Uninstall the app from device (from work profile as well if available). Connect the device using USB.
- Install the apk file onto device

```
adb -s <device_name> install android/app/build/outputs/apk/release/app-release.apk
```

- Download the [Screenshot JSON file](https://gist.githubusercontent.com/night-fury-rider/feb99855cc1fac1320d2dfc430083711/raw/0941fe3697494923b9234363f1e48d5eb4b1a9a9/rare-contacts-screenshot-data.json) and import it using `Tools` Tab's `Import Backup` feature.
- Complete the sanity testing and capture the screenshots.
- Update the screenshots in this README.
- Capture the home screen screenshot on emulator with Nexus_7_API_33.
- Capture the home screen screenshot on emulator with Nexus_10_API_33.
- Create a [release on Github](https://github.com/night-fury-rider/rare-contacts/releases). Use [Github filter](https://github.com/night-fury-rider/rare-contacts/compare/v2.1.0...main) for extracting data for release notes.
- Create the release build (aab build).

```
npm run android-build
```

<br/><br/>

# Deploy the App on PlayStore

1. Login into [Developer Console Account](https://play.google.com/console/developers)
2. Select the app from the App list. It should open the App Dashboard.
3. Select `Production` (which is under `Release`) from the sidebar.
4. Click on `Create new release` which is on the right top. It would open `Create production release`.
5. Upload the build file and follow the instructions.
   <br/><br/>
