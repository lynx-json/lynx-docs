const lynxDocs = require("../../../src/");
const fs = require("fs");
const config = require("../../config");
config(lynxDocs);

var c = fs.readFileSync("./default.lynx.yml");
var yaml = lynxDocs.lib.parse(c);

var kvp = { key: undefined, value: yaml };
kvp = lynxDocs.lib.expand(kvp);
// console.log(JSON.stringify(kvp.value, null, 2));

kvp = lynxDocs.lib.finish(kvp, { realm: "http://example.com/" });
//console.log(JSON.stringify(kvp.value, null, 2));

var output = [];
lynxDocs.lib.export("handlebars", kvp, function (content) { output.push(content); });
console.log(output.join(""));
