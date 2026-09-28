# ⭐ Star Vault

A personal, offline-first vault for tracking your favorite stars and movies.

[<img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" height="60">](https://play.google.com/store/apps/details?id=com.yuvrajpatil.apps.starvault)

---

<br />

## 📱 Screenshots

<p>
  <pre><img src="https://github.com/user-attachments/assets/99de77e0-fa14-4731-9f28-16b28e15b009" width="200" height="400"/> <img src="https://github.com/user-attachments/assets/762c91d7-b6bf-43df-85ae-71550c330cea" width="200" height="400"/> <img src="https://github.com/user-attachments/assets/ce8ce54d-79e3-4f53-8c31-bf718dc1da29" width="200" height="400"/>
  </pre>
</p>

---

## About

Star Vault is a personal media companion for tracking stars and movies — completely offline, completely private.

### 🚀 Features

- **Star Management** — Create, read, update, and delete stars with rich profile data
- **Movie Association** — Link stars to movies with many-to-many relationships
- **Image Gallery** — Star image gallery stored on the local file system
- **Local Search** — Fast offline search by name and bio via SQLite
- **Import / Export** — Portable ZIP-based data backup and restore
- **Theme Switcher** — Three built-in themes (Sky Blue, Pink, Faint Orange)
- **Offline First** — Fully functional without internet connectivity

---

## Architecture

A few decisions shaped how this app is built — and why it holds up as the feature set grows.

**Repository → Service → Thunk → Screen**  
Screens don't touch the database. Repositories don't know Redux exists. Each layer can be tested and replaced independently. This boundary discipline is what keeps the codebase from becoming a mess as it scales.

**Database layer behind an interface**  
All database access goes through a `DBAdapter` interface. When `op-sqlite` introduced breaking changes, only one file needed updating — nothing in the business logic moved.

**Single database, dual-space design**  
Rather than maintaining two separate databases for standard and private modes, a single `space` column on each table keeps the data model simple and queries atomic. One database to migrate, back up, and reason about.

**Safe schema migrations**  
Each migration checks `PRAGMA table_info()` before attempting `ALTER TABLE`. Existing installs upgrade cleanly without wiping data — something that matters the moment real users are involved.

**Offline-first by default**  
No backend, no auth, no network dependency. Everything lives on the device. Fast, private, and reliable regardless of connectivity.

### 🎨 Theming

Star Vault includes a custom theming system built with React Context API — no external libraries.

| Theme                | Primary Colour | Preview |
| -------------------- | -------------- | ------- |
| 🩵 Sky Blue (default) | `#0288D1`      |         |
| 🌸 Pink              | `#E91E8C`      |         |
| 🍊 Faint Orange      | `#F57C00`      |         |

Themes are switched from the Settings tab and persist across sessions.

---

---

# 🧱 Tech Stack

| Layer             | Technology                               | Version | Why                                                                        |
| ----------------- | ---------------------------------------- | ------- | -------------------------------------------------------------------------- |
| Core Technology   | React Native CLI                         | 0.87    | Full native control — no Expo constraints                                  |
| Core Library      | React                                    | 19      |
| Language          | TypeScript                               | 5       |
| Database          | SQLite (`op-sqlite`)                     | 15      | Best performance among RN SQLite options; sync API avoids async complexity |
| State Management  | Redux Toolkit                            | 2       |
| Navigation        | React Navigation (Bottom Tabs)           | 7       |
| Key-Value Storage | MMKV                                     | 7       | 10x faster than AsyncStorage; used for preferences and access state        |
| Image Picker      | `react-native-image-picker`              | 8       |
| Date Picker       | `@react-native-community/datetimepicker` | 9       |
| Document Picker   | `@react-native-documents/picker`         | 12      | Handles keepLocalCopy for reliable file access across Android versions     |
| File Management   | react-native-blob-util                   | 0.21    | Internal media storage, file copy, and cache cleanup                       |
| Archive           | react-native-zip-archive                 | 7       | ZIP-based media export and import pipeline                                 |
| Icons             | `react-native-vector-icons`              | 10      |
| Theming           | React Context API (custom, no library)   | -       | Avoids third-party dependency for a simple three-theme system              |

---

<br />

# 📂 Project Structure

```
Star Vault/
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

### Installation

```bash
git clone https://github.com/night-fury-rider/star-vault-app.git
cd star-vault
npm install
```

### Run

```bash
npm run android
```

## Scripts

```bash
# Enter in Sandbox mode
npm run mode:sandbox
```

```bash
# Exit the Sandbox mode
npm run mode:prod
```

```bash
# Export source files
npm run export-src
```

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
