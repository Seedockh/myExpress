"use strict";
exports.__esModule = true;
var MyExpress = (function () {
    function MyExpress() {
    }
    MyExpress.prototype.get = function () {
        console.log("Calling GET");
    };
    MyExpress.prototype.post = function () {
        console.log("Calling POST");
    };
    MyExpress.prototype.put = function () {
        console.log("Calling PUT");
    };
    MyExpress.prototype["delete"] = function () {
        console.log("Calling DELETE");
    };
    MyExpress.prototype.all = function () {
        console.log("Calling ALL");
    };
    MyExpress.prototype.listen = function () {
        console.log("Calling LISTEN");
    };
    MyExpress.prototype.render = function () {
        console.log("Calling RENDER");
    };
    MyExpress.prototype.use = function () {
        console.log("Calling USE");
    };
    return MyExpress;
}());
exports["default"] = (function () { return new MyExpress(); });
//# sourceMappingURL=myExpress.js.map