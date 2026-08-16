# ⭐ StarVault

A powerful offline-first mobile application for managing and exploring actor-centric media data. Built with React Native CLI and TypeScript, StarVault demonstrates local-first architecture, strong data modeling, and clean separation of concerns.

---

## 📱 Screenshots

> _Coming soon_

---

## 🚀 Features

- **Star Management** — Create, read, update, and delete stars with rich profile data
- **Movie Association** — Link stars to movies with many-to-many relationships
- **Image Gallery** — Star image gallery stored on the local file system
- **Local Search** — Fast offline search by name and bio via SQLite
- **Import / Export** — Portable ZIP-based data backup and restore
- **Theme Switcher** — Three built-in themes (Sky Blue, Pink, Faint Orange)
- **Offline First** — Fully functional without internet connectivity

---

## 🧱 Tech Stack

| Layer            | Technology                             |
| ---------------- | -------------------------------------- |
| Framework        | React Native CLI                       |
| Language         | TypeScript                             |
| Database         | SQLite (`react-native-sqlite-storage`) |
| State Management | Redux Toolkit                          |
| Navigation       | React Navigation (Bottom Tabs)         |
| File System      | `react-native-fs`                      |
| Image Picker     | `react-native-image-picker`            |
| Icons            | `react-native-vector-icons`            |
| Theming          | React Context API (custom, no library) |

---

## 📂 Project Structure

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

## 🗄 Database Schema

```
Person
  id | userId | name | bio | createdAt | updatedAt

StarImage
  id | personId (FK) | imagePath | createdAt

Movie
  id | title | year | createdAt

StarMovie
  id | personId (FK) | movieId (FK) | role
```

---

## ⚙️ Prerequisites

| Tool             | Version          |
| ---------------- | ---------------- |
| Node.js          | >= 22.13.0       |
| React Native CLI | Latest           |
| Xcode            | >= 14 (iOS)      |
| Android Studio   | Latest (Android) |
| CocoaPods        | Latest (iOS)     |
| JDK              | >= 17 (Android)  |

---

## 🛠 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/StarVault.git
cd StarVault
```

### 2. Install dependencies

```bash
npm install
```

### 3. iOS setup

```bash
cd ios && pod install && cd ..
```

### 4. Start Metro bundler

```bash
npx react-native start --reset-cache
```

### 5. Run the app

**iOS:**

```bash
npx react-native run-ios
```

**Android:**

```bash
npm run android
```

---

## 🎨 Theming

StarVault includes a custom theming system built with React Context API — no external libraries.

| Theme                | Preview   |
| -------------------- | --------- |
| 🩵 Sky Blue (default) | `#0288D1` |
| 🌸 Pink              | `#E91E8C` |
| 🍊 Faint Orange      | `#F57C00` |

Switch themes anytime from the **Settings** tab.

---

## 🏗 Architecture Principles

- **Offline First** — All data stored locally via SQLite
- **ACID Compliant** — Reliable local transactions
- **Modular Structure** — Each feature is a self-contained module
- **Repository Pattern** — UI is fully decoupled from data logic
- **Sync Ready** — Schema supports future backend sync with `updatedAt` conflict resolution
- **Multi-user Ready** — `userId` field present in schema for future use

---

## 🔄 Roadmap

- [x] Project setup with TypeScript
- [x] Bottom tab navigation
- [x] Custom theming system
- [ ] SQLite setup and schema
- [ ] Star CRUD (service layer)
- [ ] Star list UI
- [ ] Search
- [ ] Image gallery
- [ ] Movie association
- [ ] Import / Export
- [ ] Backend sync (Spring Boot)
- [ ] Authentication (JWT)

---

## Database Inspection

Pull the SQLite database from the Android emulator to your desktop:

```bash
adb shell "run-as com.yuvrajpatil.apps.starvault cat /data/data/com.yuvrajpatil.apps.starvault/databases/starvault.db" > ~/Desktop/starvault.db
```

This will create `starvault.db` on the Desktop.

Open DBeaver. Press Create New Database. Select Database "SQLite". Select the `starvault.db` in the path and press the Finish Button.

Now we can see the current database values using DBeaver.
