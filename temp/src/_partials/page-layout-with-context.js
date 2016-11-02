const fs = require("fs");
const path = require("path");
const YAML = require("yamljs");

module.exports = exports = kvp => {
  var content = fs.readFileSync(path.join(__dirname, "page-layout-with-context.yml"));
  var value = YAML.parse(YAML.stringify(YAML.parse(content.toString())));
  
  value.context = kvp.value.context || value.context;
  value.main = kvp.value.main || value.main;
  
  return {
    key: kvp.key,
    value: value
  };
};
