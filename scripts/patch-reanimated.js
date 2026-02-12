/**
 * Patches react-native-reanimated to skip the React Native version check.
 * This is needed because reanimated is pulled as a transitive dependency
 * by @react-navigation and requires RN 0.78+, but we use RN 0.76.5.
 * We don't use reanimated features directly, so this is safe.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'node_modules', 'react-native-reanimated', 'android', 'build.gradle');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = `    def minimalReactNativeVersion = 78
    onlyIf { REACT_NATIVE_MINOR_VERSION < minimalReactNativeVersion }
    doFirst {
        throw new GradleException("[Reanimated] Unsupported React Native version. Please use $minimalReactNativeVersion. or newer.")
    }`;
  const patched = `    // Patched: skip version check
    // def minimalReactNativeVersion = 78
    // onlyIf { REACT_NATIVE_MINOR_VERSION < minimalReactNativeVersion }
    // doFirst {
    //     throw new GradleException("[Reanimated] Unsupported React Native version.")
    // }`;

  if (content.includes('def minimalReactNativeVersion = 78')) {
    content = content.replace(original, patched);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[patch-reanimated] Successfully patched reanimated version check.');
  } else {
    console.log('[patch-reanimated] Already patched or not found.');
  }
} else {
  console.log('[patch-reanimated] react-native-reanimated not found, skipping.');
}
