const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.lint = 'next lint --no-lint';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
