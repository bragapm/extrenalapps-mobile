const fs = require("fs");
const plist = require("plist");
const { execSync } = require("child_process");
// const config = require("./appconfig");
const config = JSON.parse(fs.readFileSync("./app.json", "utf8"));

const {
  name: appFolderName,
  displayName: appName,
  bundleId,
  androidVersionCode,
  iosBuildNumber,
  version,
  appIcon,
} = config;

const iosPath = "./ios";
const oldFolderName =
  fs
    .readdirSync(iosPath)
    .find((dir: any) => fs.existsSync(`${iosPath}/${dir}/Info.plist`)) || null;

// RENAME FOLDER, .xcodeproj, .xcworkspace
if (oldFolderName && oldFolderName !== appFolderName) {
  try {
    fs.renameSync(`${iosPath}/${oldFolderName}`, `${iosPath}/${appFolderName}`);
    console.log(`✔️  Renamed folder: ${oldFolderName} -> ${appFolderName}`);
  } catch (err) {
    console.warn(
      `❌ Failed to rename folder: ${oldFolderName} -> ${appFolderName}`,
      err
    );
  }
  try {
    fs.renameSync(
      `${iosPath}/${oldFolderName}.xcodeproj`,
      `${iosPath}/${appFolderName}.xcodeproj`
    );
    console.log(
      `✔️  Renamed .xcodeproj: ${oldFolderName}.xcodeproj -> ${appFolderName}.xcodeproj`
    );
  } catch (err) {
    console.warn(
      `❌ Failed to rename .xcodeproj: ${oldFolderName}.xcodeproj -> ${appFolderName}.xcodeproj`,
      err
    );
  }
  try {
    fs.renameSync(
      `${iosPath}/${oldFolderName}.xcworkspace`,
      `${iosPath}/${appFolderName}.xcworkspace`
    );
    console.log(
      `✔️  Renamed .xcworkspace: ${oldFolderName}.xcworkspace -> ${appFolderName}.xcworkspace`
    );
  } catch (err) {
    console.warn(
      `❌ Failed to rename .xcworkspace: ${oldFolderName}.xcworkspace -> ${appFolderName}.xcworkspace`,
      err
    );
  }
}

// AUTO REPLACE IN ALL FILES THAT STILL USE OLD NAME
const TEXT_FILES = [
  `${iosPath}/${appFolderName}/AppDelegate.swift`,
  `${iosPath}/${appFolderName}/LaunchScreen.storyboard`,
  `${iosPath}/${appFolderName}.xcodeproj/project.pbxproj`,
  `${iosPath}/${appFolderName}.xcodeproj/xcshareddata/xcschemes/TempPrototype.xcscheme`,
  `${iosPath}/${appFolderName}.xcworkspace/contents.xcworkspacedata`,
  `${iosPath}/${appFolderName}/Info.plist`,
  "./ios/Podfile",
];

const oldProjectName = "TempPrototype"; // Ganti sesuai nama lama project

const replaceAllInFile = (
  filePath: any,
  searchValue: any,
  replaceValue: any
) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes(searchValue)) {
    if (searchValue !== replaceValue) {
      fs.writeFileSync(
        filePath,
        content.split(searchValue).join(replaceValue),
        "utf8"
      );
      console.log(
        `✔️  Replaced ${searchValue} with ${replaceValue} in ${filePath}`
      );
    } else {
      console.log(`➡️  No change in ${filePath}, value already up-to-date`);
    }
  }
};

TEXT_FILES.forEach((file) =>
  replaceAllInFile(file, oldProjectName, appFolderName)
);

// ===== PBXPROJ =====
const pbxprojPath = `${iosPath}/${appFolderName}.xcodeproj/project.pbxproj`;
if (fs.existsSync(pbxprojPath)) {
  let pbxproj = fs.readFileSync(pbxprojPath, "utf8");
  let updated = false;

  // PRODUCT_NAME
  let prodNameMatch = pbxproj.match(/PRODUCT_NAME = "([^"]+)";/);
  if (!prodNameMatch || prodNameMatch[1] !== appFolderName) {
    pbxproj = pbxproj.replace(
      /PRODUCT_NAME = [^;]+;/g,
      `PRODUCT_NAME = "${appFolderName}";`
    );
    updated = true;
    console.log("✔️  PRODUCT_NAME in project.pbxproj updated");
  } else {
    console.log("➡️  PRODUCT_NAME in project.pbxproj already up-to-date");
  }

  // BUNDLE_ID
  let bundleIdMatch = pbxproj.match(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/);
  if (!bundleIdMatch || bundleIdMatch[1] !== bundleId) {
    pbxproj = pbxproj.replace(
      /PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g,
      `PRODUCT_BUNDLE_IDENTIFIER = ${bundleId};`
    );
    updated = true;
    console.log("✔️  PRODUCT_BUNDLE_IDENTIFIER in project.pbxproj updated");
  } else {
    console.log(
      "➡️  PRODUCT_BUNDLE_IDENTIFIER in project.pbxproj already up-to-date"
    );
  }

  if (updated) fs.writeFileSync(pbxprojPath, pbxproj, "utf8");
}

// === ANDROID ===
const gradlePath = "./android/app/build.gradle";
let gradle = fs.readFileSync(gradlePath, "utf8");
let gradleUpdated = false;

// versionName
const currentVersionName = gradle.match(/versionName "([^"]+)"/)?.[1];
if (currentVersionName !== version) {
  gradle = gradle.replace(/versionName ".*"/, `versionName "${version}"`);
  gradleUpdated = true;
  console.log(`✔️  versionName updated to ${version} in build.gradle`);
} else {
  console.log(`➡️  versionName in build.gradle already up-to-date`);
}

// versionCode
const currentVersionCode = gradle.match(/versionCode (\d+)/)?.[1];
if (Number(currentVersionCode) !== Number(androidVersionCode)) {
  gradle = gradle.replace(
    /versionCode \d+/,
    `versionCode ${androidVersionCode}`
  );
  gradleUpdated = true;
  console.log(
    `✔️  versionCode updated to ${androidVersionCode} in build.gradle`
  );
} else {
  console.log(`➡️  versionCode in build.gradle already up-to-date`);
}

if (gradleUpdated) fs.writeFileSync(gradlePath, gradle, "utf8");

// Android strings.xml (app_name)
const stringsPath = "./android/app/src/main/res/values/strings.xml";
if (fs.existsSync(stringsPath)) {
  let stringsXml = fs.readFileSync(stringsPath, "utf8");
  const appNameMatch = stringsXml.match(
    /<string name="app_name">(.*?)<\/string>/
  );
  if (!appNameMatch || appNameMatch[1] !== appName) {
    stringsXml = stringsXml.replace(
      /<string name="app_name">.*?<\/string>/,
      `<string name="app_name">${appName}</string>`
    );
    fs.writeFileSync(stringsPath, stringsXml, "utf8");
    console.log("✔️  app_name in strings.xml updated");
  } else {
    console.log("➡️  app_name in strings.xml already up-to-date");
  }
} else {
  console.warn(`⚠️  strings.xml not found at ${stringsPath}`);
}

// === iOS Info.plist ===
const iosPlistPath = `./ios/${appFolderName}/Info.plist`;
if (fs.existsSync(iosPlistPath)) {
  let infoPlist = fs.readFileSync(iosPlistPath, "utf8");
  let plistObj = plist.parse(infoPlist);

  let iosPlistUpdated = false;
  if (plistObj.CFBundleShortVersionString !== version) {
    plistObj.CFBundleShortVersionString = version;
    iosPlistUpdated = true;
    console.log("✔️  CFBundleShortVersionString updated");
  }
  if (plistObj.CFBundleVersion !== iosBuildNumber) {
    plistObj.CFBundleVersion = iosBuildNumber;
    iosPlistUpdated = true;
    console.log("✔️  CFBundleVersion updated");
  }
  if (plistObj.CFBundleDisplayName !== appName) {
    plistObj.CFBundleDisplayName = appName;
    iosPlistUpdated = true;
    console.log("✔️  CFBundleDisplayName updated");
  }
  if (plistObj.CFBundleName !== appFolderName) {
    plistObj.CFBundleName = appFolderName;
    iosPlistUpdated = true;
    console.log("✔️  CFBundleName updated");
  }
  if (iosPlistUpdated) {
    fs.writeFileSync(iosPlistPath, plist.build(plistObj));
    console.log("✔️  Info.plist updated");
  } else {
    console.log("➡️  Info.plist already up-to-date");
  }
} else {
  console.warn(
    `⚠️  Info.plist not found at ${iosPlistPath}. Rename project folder dulu!`
  );
}

// === ICON ===
if (appIcon) {
  // Icon biasanya tetap di replace, tapi bisa di cek dulu jika mau lebih advance
  try {
    execSync(`npx setup-icon-ituaja --path ${appIcon}`, {
      stdio: "inherit",
    });
    console.log("✅ App icon set via setup-icon-ituaja!");
  } catch (err) {
    console.error("❌ Failed to set app icon via setup-icon-ituaja:", err);
  }
} else {
  console.warn("⚠️  appIcon path not set in appconfig.js");
}

console.log("===== SYNC RESULT FROM appconfig.js =====");
console.log(`appName           : ${appName}`);
console.log(`appFolderName     : ${appFolderName}`);
console.log(`bundleId          : ${bundleId}`);
console.log(`androidVersionCode: ${androidVersionCode}`);
console.log(`iosBuildNumber    : ${iosBuildNumber}`);
console.log(`version           : ${version}`);
console.log(`source Icon From  : ${appIcon}`);
console.log("========================================");
console.log(
  "✅  Only changed configs/files were updated. If nothing changed, all skipped."
);
