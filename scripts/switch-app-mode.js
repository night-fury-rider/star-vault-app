/**
 * Usage:
 *   node scripts/switch-app-mode.js sandbox   → Switch to sandbox mode
 *   node scripts/switch-app-mode.js prod      → Revert to production mode
 */

const fs = require('fs');
const path = require('path');

// =====================
// 🔧 CONFIGURATION
// =====================

function getInitials(appName) {
  return appName
    .trim() // remove leading/trailing spaces
    .split(/\s+/) // split by one or more spaces
    .map(word => word[0].toUpperCase()) // take first letter, uppercase
    .join('_'); // join with underscore
}

const appName = 'StarVault';
const applicationId = 'com.yuvrajpatil.apps.starvault';

const testAppName = getInitials(appName);
const testApplicationId = applicationId + 2;

const APP_CONFIG = {
  prod: {
    appName: appName,
    packageId: applicationId,
    iosBundleId: applicationId,
    mainComponentName: appName,
  },
  sandbox: {
    appName: testAppName,
    packageId: testApplicationId,
    iosBundleId: testApplicationId,
    mainComponentName: testAppName,
  },
};

// =====================
// 🧭 MODE SELECTION
// =====================
const mode = process.argv[2]; // 'sandbox' or 'prod'
if (!mode || !['sandbox', 'prod'].includes(mode)) {
  console.error('❌ Usage: node scripts/switchAppMode.js [sandbox|prod]');
  process.exit(1);
}

const target = APP_CONFIG[mode];
console.log(
  `\n🔄 Switching app configuration to: ${mode.toUpperCase()} mode\n`,
);

// =====================
// 📁 PATHS
// =====================
const androidGradle = path.join(
  __dirname,
  '..',
  'android',
  'app',
  'build.gradle',
);
const androidStrings = path.join(
  __dirname,
  '..',
  'android',
  'app',
  'src',
  'main',
  'res',
  'values',
  'strings.xml',
);
const appJson = path.join(__dirname, '..', 'app.json');

// Dynamically build MainActivity path from packageId
// e.g., com.jackjones.apps.contacts → android/app/src/main/java/com/jackjones/apps/contacts/MainActivity.kt
function getMainActivityPath(packageId, ext = 'kt') {
  const parts = packageId.split('.');
  return path.join(
    __dirname,
    '..',
    'android',
    'app',
    'src',
    'main',
    'java',
    ...parts,
    `MainActivity.${ext}`,
  );
}

const kotlinMainActivity = getMainActivityPath(APP_CONFIG.prod.packageId, 'kt');
const javaMainActivity = getMainActivityPath(APP_CONFIG.prod.packageId, 'java');

// =====================
// ⚙️ HELPER FUNCTIONS
// =====================
function replaceInFile(file, replaceFn) {
  if (!fs.existsSync(file)) return false;
  const data = fs.readFileSync(file, 'utf8');
  const newData = replaceFn(data);
  if (newData !== data) {
    fs.writeFileSync(file, newData, 'utf8');
    console.log(`✅ Updated: ${path.relative(process.cwd(), file)}`);
    return true;
  }
  return false;
}

function updateMainComponentNameInSource(content, newName) {
  const funcIndex = content.indexOf('getMainComponentName');
  if (funcIndex === -1) return content;
  const firstQuote = content.indexOf('"', funcIndex);
  if (firstQuote === -1) return content;
  const secondQuote = content.indexOf('"', firstQuote + 1);
  if (secondQuote === -1) return content;
  return (
    content.slice(0, firstQuote + 1) + newName + content.slice(secondQuote)
  );
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// =====================
// 🧱 APPLY CHANGES
// =====================

// 1️⃣ Android build.gradle
if (fs.existsSync(androidGradle)) {
  replaceInFile(androidGradle, data => {
    const regexProd = new RegExp(
      `applicationId\\s+"${escapeRegExp(APP_CONFIG.prod.packageId)}"`,
      'g',
    );
    const regexTest = new RegExp(
      `applicationId\\s+"${escapeRegExp(APP_CONFIG.sandbox.packageId)}"`,
      'g',
    );
    let out = data.replace(regexProd, `applicationId "${target.packageId}"`);
    out = out.replace(regexTest, `applicationId "${target.packageId}"`);
    return out;
  });
}

// 2️⃣ Android strings.xml
if (fs.existsSync(androidStrings)) {
  replaceInFile(androidStrings, data => {
    const regex = /<string name="app_name">.*<\/string>/;
    return data.replace(
      regex,
      `<string name="app_name">${target.appName}</string>`,
    );
  });
}

// 3️⃣ app.json
if (fs.existsSync(appJson)) {
  const appData = JSON.parse(fs.readFileSync(appJson, 'utf8'));
  appData.name = target.appName.replace(/\s+/g, '');
  appData.displayName = target.appName;
  fs.writeFileSync(appJson, JSON.stringify(appData, null, 2));
  console.log(`✅ Updated: app.json`);
}

// 4️⃣ Kotlin MainActivity
replaceInFile(kotlinMainActivity, data =>
  updateMainComponentNameInSource(data, target.mainComponentName),
);

// 5️⃣ Java MainActivity
replaceInFile(javaMainActivity, data =>
  updateMainComponentNameInSource(data, target.mainComponentName),
);

// 6️⃣ iOS Info.plist
const iosInfoPlist = path.join(
  __dirname,
  '..',
  'ios',
  target.appName.replace(/\s+/g, ''),
  'Info.plist',
);
if (fs.existsSync(iosInfoPlist)) {
  replaceInFile(iosInfoPlist, data => {
    const regexProd = new RegExp(
      `<key>CFBundleIdentifier</key>\\s*<string>${escapeRegExp(
        APP_CONFIG.prod.iosBundleId,
      )}</string>`,
    );
    const regexTest = new RegExp(
      `<key>CFBundleIdentifier</key>\\s*<string>${escapeRegExp(
        APP_CONFIG.sandbox.iosBundleId,
      )}</string>`,
    );
    return data
      .replace(
        regexProd,
        `<key>CFBundleIdentifier</key>\n\t<string>${target.iosBundleId}</string>`,
      )
      .replace(
        regexTest,
        `<key>CFBundleIdentifier</key>\n\t<string>${target.iosBundleId}</string>`,
      );
  });
}

console.log(`\n🎉 Successfully switched to ${mode.toUpperCase()} mode!`);
console.log(`   → App Name: ${target.appName}`);
console.log(`   → Package ID: ${target.packageId}`);
console.log(`   → Main Component Name: ${target.mainComponentName}\n`);
