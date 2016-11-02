const fs = require("fs");
const path = require("path");
const YAML = require("yamljs");

module.exports = exports = kvp => {
  var content = fs.readFileSync(path.join(__dirname, "em.yml"));
  var value = YAML.parse(content.toString());
  value.spec["http://bestbuy.com/retail/emphasis"] = kvp.value.level || 1;
  
  return {
    key: kvp.key,
    value: value
  };
};
