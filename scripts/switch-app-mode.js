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

const appName = 'StarVault';
const applicationId = 'com.yuvrajpatil.apps.starvault';
const sandboxSuffix = '_Sandbox';

function getSandboxAppName(appName) {
  return appName
    .trim() // remove leading/trailing spaces
    .split(/\s+/) // split by one or more spaces
    .map(word => word[0].toUpperCase()) // take first letter, uppercase
    .join('_')
    .concat(sandboxSuffix); // join with underscore
}

const testAppName = getSandboxAppName(appName);
const testApplicationId = applicationId + sandboxSuffix;

const APP_CONFIG = {
  prod: {
    appName: appName,
    packageId: applicationId,
    iosBundleId: applicationId,
  },
  sandbox: {
    appName: testAppName,
    packageId: testApplicationId,
    iosBundleId: testApplicationId,
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
