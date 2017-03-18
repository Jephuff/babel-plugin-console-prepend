const path = require('path');
const git = require('./git.js');

const consoleFunctions = ['log'];
const prefix = 'jeffrey';

let untrackedFiles = git.untracked();
let files = git.staged(git.unstaged({}));
let lastDiff = 0;
let lastUntracked = 0;

module.exports = function ({ types }) {
  return {
    visitor: {
      CallExpression(path, parent) {
        if (!path.node.callee.object || !path.node.callee.property) return;
        if (path.node.callee.object.name !== 'console') return;
        if (consoleFunctions.indexOf(path.node.callee.property.name) < 0) return;

        const filename = path.hub.file.opts.filename;
        const firstLine = path.node.loc.start.line;
        const lastLine = path.node.loc.end.line;

        const now = new Date();
        if (now - lastUntracked > 300) {
          untrackedFiles = git.untracked();
          lastUntracked = now;
        }

        const inUntracked = untrackedFiles.indexOf(filename) >= 0;
        let prefixIt = false;
        if(inUntracked) {
          prefixIt = true;
        } else {
          if (now - lastDiff > 300) {
            files = git.staged(git.unstaged({}));
            lastDiff = now;
          }

          const file = files[filename];

          prefixIt = file && file.reduce((isChanged, change) => {
              return isChanged ||
                (firstLine >= change.firstLine && firstLine <= change.lastLine) ||
                (lastLine >= change.firstLine && lastLine <= change.lastLine) ||
                (firstLine < change.firstLine && lastLine > change.lastLine);
          }, false);
        }


        if(prefixIt) {
          const node = types.stringLiteral(prefix);
          path.node.arguments.unshift(node);
        }
      }
    }
  };
}
