const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const lines = [];
function log(msg) { lines.push(msg); }

// Check TypeScript errors
try {
  const tscResult = execSync('npx.cmd tsc --noEmit 2>&1', { encoding: 'utf8', maxBuffer: 1024 * 1024 });
  log('TSC_OK: No TypeScript errors');
  log(tscResult);
} catch (e) {
  log('TSC_ERRORS_START');
  log(e.stdout || '');
  log(e.stderr || '');
  log('TSC_ERRORS_END');
}

// Check babel config
const babelConfig = fs.readFileSync('babel.config.js', 'utf8');
log('BABEL_CONFIG: ' + babelConfig);

// Check key dependencies
const deps = [
  'react-native-reanimated',
  'react-native-screens',
  'react-native-gesture-handler',
  'react-native-safe-area-context',
  'react-native-svg',
  'react-native-qrcode-svg',
  'react-native-pager-view',
  'react-native-vector-icons',
  '@react-navigation/native',
  '@react-navigation/native-stack',
  '@react-navigation/bottom-tabs',
  '@react-native-async-storage/async-storage',
];

for (const dep of deps) {
  try {
    const pkgPath = require.resolve(dep + '/package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    log(dep + ': ' + pkg.version);
    if (pkg.peerDependencies) {
      log('  peerDeps: ' + JSON.stringify(pkg.peerDependencies));
    }
  } catch (e) {
    log(dep + ': NOT FOUND - ' + e.message);
  }
}

// Write output
fs.writeFileSync(path.join(__dirname, 'check-output.txt'), lines.join('\n'), 'utf8');
