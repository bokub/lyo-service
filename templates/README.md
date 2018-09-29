# ${publishName}

A browser-compatible version of [${name}](https://www.npmjs.com/package/${name}) built automatically with [Lyo](https://github.com/bokub/lyo).

[![Version](https://badgen.net/npm/v/${publishName})](https://www.npmjs.com/package/${publishName})
[![Build](https://bokub.github.io/lyo/badge.svg)](https://www.npmjs.com/package/${publishName})

## Usage

#### In a browser
```html
<script src="https://cdn.jsdelivr.net/npm/${publishName}"></script>${ usage ? ('\n\n<script>\n' + indent(usage, 2) + '\n</script>') : ''}
```

#### In Node.js

```sh
# Install
npm i ${publishName}
```

```js
const ${exportedName} = require('${publishName}')${ usage ? ('\n\n' + usage) : ''}
```

## Disclaimer

This automated Lyo build may have not been properly tested, and is not guaranteed to work perfectly.

Use at your own risk