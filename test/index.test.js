const fs = require('fs');
const path = require('path');
const babel = require("babel-core");
const child_process = require('child_process');

const plugin = require("../src/index.js");

const execOptions = { encoding: 'UTF-8' };

const BASE = path.join(process.cwd(), 'test/test-project');

const prefix = 'success';
const prefixed = `console.log('${prefix}', 'message');`;
const unprefixed = "console.log('message');";

const writeFile = (name, data) => new Promise((resolve) => fs.writeFile(name, data, resolve));

const exec = command => new Promise((resolve) => child_process.exec(command, resolve));

describe('prefix console.logs', () => {
  const options = {
    babelrc: false,
    plugins: [
      [plugin, { prefix }],
    ],
  };

  it('shouldn\'t prefix commited console.logs', () => {
    const result = babel.transformFileSync(path.join(BASE, 'commited.js'), options);
    expect(result.code).toBe(unprefixed);
  });

  it('should prefix staged console.logs', () => {
    const filePath = path.join(BASE, 'staged.js');
    return writeFile(filePath, unprefixed)
      .then(() => exec(`git add ${filePath} && sleep 0.5`))
      .then(() => {
        const result = babel.transformFileSync(filePath, options);
        return writeFile(filePath, '')
          .then(() => exec(`git add ${filePath}`))
          .then(() => expect(result.code).toBe(prefixed));
      })
  });

  it('should prefix unstaged console.logs', () => {
    const filePath = path.join(BASE, 'unstaged.js');
    return writeFile(filePath, unprefixed)
      .then(() => exec('sleep 0.5'))
      .then(() => {
        const result = babel.transformFileSync(filePath, options);
        return writeFile(filePath, '')
          .then(() => expect(result.code).toBe(prefixed));
      });
  });

  it('should prefix untracked console.logs', () => {
    const filePath = path.join(BASE, 'untracked.js');
    return writeFile(filePath, unprefixed)
      .then(() => exec('sleep 0.5'))
      .then(() => {
        const result = babel.transformFileSync(filePath, options);
        fs.unlinkSync(filePath);
        expect(result.code).toBe(prefixed);
      });
  });
});
