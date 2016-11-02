const fs = require("fs");
const path = require("path");
const YAML = require("yamljs");

module.exports = exports = kvp => {
  var content = fs.readFileSync(path.join(__dirname, "page-layout-main.yml"));
  var value = YAML.parse(YAML.stringify(YAML.parse(content.toString())));
  
  if (kvp.value.main) value["http://bestbuy.com/retail/uncategorized/page-layout/main"] = kvp.value.main;
  
  return {
    key: kvp.key,
    value: value
  };
};
