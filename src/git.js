const child_process = require('child_process');
const execOptions = { encoding: 'UTF-8' };

const diffLineRegex = /^diff --git (a\/.*)/;

function addChanges(obj, diff) {
    const lines = diff.split('\n');

    for(let i = 0, key, line; i < lines.length; i += 1) {
        line = lines[i];
        const diffLine = line.match(diffLineRegex);

        if(diffLine) {
            const fileName = diffLine[1];
            key = process.cwd() + '/' + fileName.substr(2, Math.floor((fileName.length - 4) / 2));
        } else if(line.match(/^@@/)) {
            const summary = line.match(/\+([0-9]+)(,([0-9]+))?/);
            const firstLine = parseInt(summary[1], 10);
            const numLines = parseInt(summary[3] || 1, 10);
            obj[key] = obj[key] || [];
            obj[key].push({
                firstLine: firstLine,
                lastLine: firstLine + numLines - 1,
            });
        }
    }

    return obj;
}

module.exports = {
    staged: function(obj) {
        const diff = child_process.execSync('git diff --unified=0 --cached', execOptions);
        return addChanges(obj, diff);
    },
    unstaged: function(obj) {
        const diff = child_process.execSync('git diff --unified=0', execOptions);
        return addChanges(obj, diff);
    },
    untracked: function() {
        return child_process.execSync('git ls-files --others --exclude-standard', execOptions)
            .split('\n')
            .filter(Boolean)
            .map((p) => process.cwd() + '/' + p);
    },
}
