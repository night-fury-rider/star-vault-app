const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(PROJECT_ROOT, 'src');
const TARGET_DIR = path.join(PROJECT_ROOT, 'build_src');

const SUPPORTED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

function getSourceFiles(directory) {
  const files = [];

  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const sourcePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...getSourceFiles(sourcePath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      continue;
    }

    files.push(sourcePath);
  }

  return files;
}

function findDuplicateFileNames(sourceFiles) {
  const filesByName = new Map();

  for (const sourceFile of sourceFiles) {
    const fileName = path.basename(sourceFile);

    if (!filesByName.has(fileName)) {
      filesByName.set(fileName, []);
    }

    filesByName.get(fileName).push(sourceFile);
  }

  return [...filesByName.entries()].filter(([, files]) => files.length > 1);
}

function copySourceFiles() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Export failed: source directory not found.`);
    console.error(`   ${SOURCE_DIR}`);
    process.exit(1);
  }

  console.log('🔍 Scanning source files...\n');

  const sourceFiles = getSourceFiles(SOURCE_DIR);
  const duplicateFiles = findDuplicateFileNames(sourceFiles);

  if (duplicateFiles.length > 0) {
    console.error('❌ Export failed: duplicate file names found.\n');

    for (const [fileName, files] of duplicateFiles) {
      console.error(`Duplicate: ${fileName}`);

      for (const file of files) {
        console.error(`  → ${path.relative(PROJECT_ROOT, file)}`);
      }

      console.error('');
    }

    process.exit(1);
  }

  // Create a clean build_src directory.
  fs.rmSync(TARGET_DIR, {
    recursive: true,
    force: true,
  });

  fs.mkdirSync(TARGET_DIR, {
    recursive: true,
  });

  console.log(`📄 Found ${sourceFiles.length} source files.\n`);
  console.log('🔄 Copying files...\n');

  for (const sourceFile of sourceFiles) {
    const fileName = path.basename(sourceFile);
    const targetPath = path.join(TARGET_DIR, fileName);

    fs.copyFileSync(sourceFile, targetPath);

    console.log(
      `Copied: ${path.relative(
        SOURCE_DIR,
        sourceFile,
      )} → build_src/${fileName}`,
    );
  }

  console.log('\n✅ Export completed successfully.');
}

copySourceFiles();
