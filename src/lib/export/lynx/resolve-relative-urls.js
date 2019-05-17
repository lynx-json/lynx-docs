"use strict";
const traverse = require("traverse");
const types = require("../../../types");
const exportLynx = require("./index");
const shouldResolve = {
  scope: function (traverseNode) { return !!exportLynx.getLynxParentNode(traverseNode); },
  realm: function (traverseNode) { return traverseNode.parent && traverseNode.parent.isRoot; },
  for: function (traverseNode) { return !!exportLynx.getLynxParentNode(traverseNode); }
};
const candidateKeys = Object.keys(shouldResolve);

const url = require("url");

function resolveRelativeUrls(realm) {
  return function (template) {
    return traverse(template).forEach(function (value) {
      if (!types.isString(value)) return;
      let update = candidateKeys.some(key => {
        return key === this.key && shouldResolve[key](this);
      });

      if (update) this.update(url.resolve(realm, value));
    });
  };
}

exports.resolveRelativeUrls = resolveRelativeUrls;
