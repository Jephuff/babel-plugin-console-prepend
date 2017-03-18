const git = require('./git.js');

const consoleFunctions = ['log'];
const prefix = 'jeffrey';

const untrackedFiles = git.untracked();
const files = git.staged(git.unstaged({}));

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

        const file = files[filename];

        const inUntracked = untrackedFiles.indexOf(filename) >= 0;
        const prefixIt = inUntracked || (file && file.reduce((isChanged, change) => {
            return isChanged ||
              (firstLine >= change.firstLine && firstLine <= change.lastLine) ||
              (lastLine >= change.firstLine && lastLine <= change.lastLine) ||
              (firstLine < change.firstLine && lastLine > change.lastLine);
        }, false));

        if(prefixIt) {
          const node = types.stringLiteral(prefix);
          path.node.arguments.unshift(node);
        }
      }
    }
  };
}
