# babel-plugin-console-prepend
[![build status](https://img.shields.io/travis/Jephuff/babel-plugin-console-prepend/master.svg?style=flat-square)](https://travis-ci.org/Jephuff/babel-plugin-console-prepend)
[![npm version](https://img.shields.io/npm/v/babel-plugin-console-prepend.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-console-prepend)

A simple transform that prepends uncommited console.log calls with a string

## Install

```shell
$ npm i --save-dev babel-plugin-console-prepend babel-cli
```

## Example

Transforms
```js
console.log(val); // this line has been committed
console.log(val); // this line has not been committed
```

to
```js
console.log(val); // this line has been committed
console.log('prefix', val); // this line has not been committed
```

## Usage

###### .babelrc
```json
{
  "plugins": ["console-prepend"],
}
```

Set plugin options using an array of `[pluginName, optionsObject]`.
```json
{
  "plugins": [["console-prepend", { "prefix": "I wrote this" }]],
}
```

###### Babel CLI
```sh
$ babel --plugins console-prepend script.js
```

###### Babel API
```js
require('babel-core').transform('code', {
  'plugins': ['console-prepend'],
});
```
