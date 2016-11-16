const lynxNodePartial = require("./lynx-node");

module.exports = exports = function (kvp) {
  kvp.value.hints = [ "section", "container" ];
  return lynxNodePartial(kvp);
};
