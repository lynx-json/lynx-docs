const traverse = require("traverse");
const types = require("../../../types");
const exportLynx = require("./index");
const shouldResolve = {
  scope: function (node) { return !!exportLynx.getLynxParentNode(node); },
  realm: function (node) { return node.parent && node.parent.isRoot; }
};

const url = require("url");

function resolveRelativeUrls(realm) {
  return function (template) {
    return traverse(template).forEach(function (value) {
      if (!types.isString(value)) return;
      let update = Object.keys(shouldResolve).some(key => {
        return key === this.key && shouldResolve[key](this);
      });

      if (update) this.update(url.resolve(realm, value));
    });
  };
}

module.exports = exports = resolveRelativeUrls;
