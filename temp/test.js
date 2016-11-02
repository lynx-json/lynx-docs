var lynxDocs = require("../src");
require("./config")(lynxDocs);

var sample = {
  foo: {
    bar: "hi"
  }
};

var expanded = lynxDocs.lib.expand({ value: sample });
var finished = lynxDocs.lib.finish({ value: expanded.value }, { realm: "http://example.com/" });
console.log(JSON.stringify(finished.value, null, 2));
