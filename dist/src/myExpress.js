"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var http_1 = __importDefault(require("http"));
var fs_1 = __importDefault(require("fs"));
var MyExpress = (function () {
    function MyExpress() {
        var _this = this;
        this.port = 1337;
        this.host = '127.0.0.1';
        this.url = "http://" + this.host + ":" + this.port;
        this.routes = [];
        this.server = http_1["default"].createServer(function (req, res) {
            _this.request = req;
            _this.response = res;
            _this.response.send = function (message, status) {
                if (typeof message !== 'string')
                    message = message.toString();
                console.log(message);
                _this.response.write(message);
                _this.response.end();
            };
            _this.response.json = function (body) {
                _this.request.setEncoding('utf8');
                _this.response.send(JSON.stringify(body, null, 2), 200);
            };
            var _a = _this.request, url = _a.url, method = _a.method;
            var routeExists = _this.routes.find(function (currentRoute) {
                return currentRoute.method === method && currentRoute.path === url;
            });
            if (routeExists)
                routeExists.callback(_this.request, _this.response);
            else {
                _this.response.send("Error : this route doesn't exist.", 404);
            }
        });
    }
    MyExpress.prototype.get = function (path, clientCall) {
        this.routes.push({ method: "GET", path: path, callback: clientCall });
    };
    MyExpress.prototype.post = function (path, clientCall) {
        this.routes.push({ method: "POST", path: path, callback: clientCall });
    };
    MyExpress.prototype.put = function (path, clientCall) {
        this.routes.push({ method: "PUT", path: path, callback: clientCall });
    };
    MyExpress.prototype["delete"] = function (path, clientCall) {
        this.routes.push({ method: "DELETE", path: path, callback: clientCall });
    };
    MyExpress.prototype.all = function (path, clientCall) {
        this.routes.push({ method: "ALL", path: path, callback: clientCall });
    };
    MyExpress.prototype.listen = function (port, host) {
        var _this = this;
        this.server.listen(port, host, function () {
            _this.port = port;
            _this.host = host;
            _this.url = "http://" + host + ":" + port;
            console.log("This server is now listenning on address http://" + host + ":" + port);
        });
    };
    MyExpress.prototype.render = function (view, callback, options) {
        if (typeof callback === 'object') {
            var backupCallback = options;
            options = callback;
            callback = backupCallback;
        }
        try {
            if (fs_1["default"].existsSync("./pages/" + view + ".html")) {
                fs_1["default"].readFile("./pages/" + view + ".html", function (err, data) {
                    if (typeof callback !== 'object') {
                        if (err)
                            return callback(err, null);
                        var renderedHTML_1 = data.toString();
                        var dynamicFields = renderedHTML_1.match(/{{*.*}}/gm);
                        var instructions_1 = [];
                        if (typeof options === 'object') {
                            dynamicFields.forEach(function (field) {
                                if (/|/.test(field)) {
                                    field = field.replace('{{', '').replace('}}', '');
                                    instructions_1.push(field.split('|'));
                                }
                                Object.keys(options).map(function (option, index) {
                                    var value = options[option];
                                    instructions_1.forEach(function (rule) {
                                        if (rule[0] === option && rule.length > 1) {
                                            for (var i = 1; i < rule.length; i++) {
                                                switch (rule[i]) {
                                                    case 'upper':
                                                        value = value.toUpperCase();
                                                        break;
                                                    case 'lower':
                                                        value = value.toLowerCase();
                                                        break;
                                                    default: break;
                                                }
                                                renderedHTML_1 = renderedHTML_1.replace("{{" + option + "|" + rule[i] + "}}", value);
                                            }
                                        }
                                        else {
                                            renderedHTML_1 = renderedHTML_1.replace("{{" + option + "}}", value);
                                        }
                                    });
                                });
                            });
                        }
                        callback(null, renderedHTML_1);
                    }
                });
            }
        }
        catch (err) {
            console.error(err);
        }
    };
    MyExpress.prototype.use = function () {
        console.log("Calling USE");
    };
    return MyExpress;
}());
exports["default"] = (function () { return new MyExpress(); });
//# sourceMappingURL=myExpress.js.map