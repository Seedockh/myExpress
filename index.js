"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var myExpress_1 = __importDefault(require("./src/myExpress"));
var app = myExpress_1["default"]();
app.get();
app.post();
app.put();
app["delete"]();
app.all();
app.listen();
app.render();
app.use();
//# sourceMappingURL=index.js.map