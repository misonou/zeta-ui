const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const express = require('express');
const server = express();
const basepath = process.cwd();

const includePath = {
    'zeta-dom': '',
    'zeta-editor': '',
    'zeta-ui': ''
};

function resolveRealPath(reqPath) {
    var s = reqPath.replace('/src/', '/').split('/');
    return includePath[s[1]] ? path.join(includePath[s[1]], ...s.slice(2)) : path.join(basepath, reqPath);
}

for (let i in includePath) {
    var realPath = path.resolve(basepath, `../${i}/src`);
    includePath[i] = fs.existsSync(realPath) ? realPath : path.resolve(basepath, `node_modules/${i}`);
}

server.get('**/*.json', function (req, res) {
    var realPath = resolveRealPath(req.path);
    fs.readFile(realPath, function (err, data) {
        if (err) {
            res.sendStatus(404);
        } else {
            res.contentType('application/javascript');
            res.send('const exports = ' + data.toString() + '; export default exports;');
        }
    });
});
server.get('**/include/*', function (req, res) {
    var realPath = resolveRealPath(req.path);
    fs.readFile(realPath, function (err, data) {
        console.log('GET', req.path, '->', realPath);
        if (err) {
            res.sendStatus(404);
        } else {
            res.contentType(mime.lookup(realPath) || 'application/octet-stream');
            res.send(data.toString().replace(/from "([\w-]+)\/(\w+)"/g, 'from "/$1/src/$2.js"').replace(/module\.exports\s*=\s*/g, 'export default '));
        }
    });
});
for (let i in includePath) {
    let distPath = path.join(includePath[i], 'dist');
    if (!fs.existsSync(distPath)) {
        distPath = path.join(includePath[i], '../dist');
    }
    server.use('/' + i + '/src', express.static(includePath[i]));
    server.use('/' + i + '/dist', express.static(distPath));
}
server.use('/node_modules', express.static('node_modules'));
server.use('/css', express.static('css'));
server.use('/dev', express.static('dev'));

const port = process.env.PORT || process.argv[2] || 3000;
server.listen(port);
console.log('Listening on port', port);
