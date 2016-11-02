const fs = require("fs");
const path = require("path");
const YAML = require("yamljs");

module.exports = exports = kvp => {
  var content = fs.readFileSync(path.join(__dirname, "page-layout-with-context.yml"));
  var value = YAML.parse(YAML.stringify(YAML.parse(content.toString())));
  
  if (kvp.value.context) value["http://bestbuy.com/retail/uncategorized/page-layout-with-context/context"] = kvp.value.context;
  if (kvp.value.main) value["http://bestbuy.com/retail/uncategorized/page-layout-with-context/main"] = kvp.value.main;
  
  return {
    key: kvp.key,
    value: value
  };
};
