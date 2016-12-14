const partials = require("../partials-yaml");

module.exports = exports = (kvp, options) => {
  var result = {
    items: []
  };
  options.partials = {
    contextFolder: kvp.value.folder
  };

  if(kvp.value.value) {
    kvp.value.value.forEach(item => {
      result.items.push({
        ">markdown": item
      });
    });
  }

  return {
    key: kvp.key,
    value: result
  };
};
