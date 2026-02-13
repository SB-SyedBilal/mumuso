var fs = require('fs');
var path = require('path');
var out = [];

var deps = [
  'react-native-screens',
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-native-safe-area-context',
  '@react-navigation/native',
  '@react-navigation/native-stack',
  '@react-navigation/bottom-tabs'
];

deps.forEach(function(dep) {
  try {
    var pkgPath = path.join(__dirname, 'node_modules', dep, 'package.json');
    var pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    out.push(dep + ': ' + pkg.version);
  } catch(e) {
    out.push(dep + ': NOT INSTALLED');
  }
});

fs.writeFileSync(path.join(__dirname, 'version-check.txt'), out.join('\n'), 'utf8');
console.log('Done');
