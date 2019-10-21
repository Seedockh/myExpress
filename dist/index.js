"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var myExpress_1 = __importDefault(require("./src/myExpress"));
var app = myExpress_1["default"]();
app.get('/', function (req, res) {
    app.render('index', { name: 'myExpress', author: 'Pierre Hérissé', serverName: 'myExpress' }, function (err, html) {
        res.setHeader('Content-Type', 'text/html');
        res.write(html);
        res.json({ get: 'This is the response from a GET / request.' });
        res.end();
    });
});
app.all('/api', function (req, res) {
    console.log('creating /api all()');
});
app.get('/home', function (req, res) {
    res.json({ get: 'This is the response from a GET HOME request.' });
    res.end();
});
app.get('/api', function (req, res) {
    res.json({ get: 'This is the response from a GET API request.' });
    res.end();
});
app.post('/api', function (req, res) {
    res.json({ post: 'This is the response from a POST API request.' });
    res.end();
});
app.put('/api', function (req, res) {
    res.json({ put: 'This is the response from a PUT API request.' });
    res.end();
});
app["delete"]('/api', function (req, res) {
    res.json({ "delete": 'This is the response from a DELETE API request.' });
    res.end();
});
app.listen(1337, '127.0.0.1');
//# sourceMappingURL=index.js.map