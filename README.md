# ⭐ StarVault

A powerful offline-first mobile application for managing and exploring actor-centric media data. Built with React Native CLI and TypeScript, StarVault demonstrates local-first architecture, strong data modeling, and clean separation of concerns.

---

<br />

# 📱 Screenshots
<p>
  <pre><img src="https://github.com/user-attachments/assets/99de77e0-fa14-4731-9f28-16b28e15b009" width="200" height="400" alt=""/> <img src="https://github.com/user-attachments/assets/762c91d7-b6bf-43df-85ae-71550c330cea" width="200" height="400"/> <img src="https://github.com/user-attachments/assets/ce8ce54d-79e3-4f53-8c31-bf718dc1da29" width="200" height="400"/>
  </pre>
</p>
 

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
| Core Technology  | React Native                             | v0.87   |
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
npm run mode:sandbox
```

### Create the prod build

```
npm run mode:prod
```

### Install the app

```
npm run android
```

### Export Source Files to build_src

```
npm run export-src
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

https://github.com/night-fury-rider/react-native-template/wiki/Create-the-release-build
<br/><br/>

# Deploy the App on PlayStore

https://github.com/night-fury-rider/react-native-template/wiki/Deploy-the-App-on-PlayStore
<br/><br/>

# Troubleshooting

https://github.com/night-fury-rider/react-native-template/wiki/Troubleshooting
