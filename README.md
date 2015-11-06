# frida-load

Load a Frida script comprised of one or more Node.js modules.

## Example

```js
var frida = require('frida');
var load = require('frida-load');

load(require.resolve('./agent.js'))
.then(function (source) {
  frida.attach('Skype')
  .then(function (session) {
    session.createScript(source)
    .then(...) // and so on
  });
});
```

## Installation

```bash
$ npm install frida-load
```
