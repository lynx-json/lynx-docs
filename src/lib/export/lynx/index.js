const keyMetadata = require("../../json-templates/key-metadata");
const lynxNodeKeys = ["spec", "value"];
const types = require("../../../types");

function getLynxParent(traverseNode) {
  let context = traverseNode.parent;
  while (context && context.level + 2 >= traverseNode.level) {
    if (isLynxNode(context.node)) return context;
    context = context.parent;
  }
  return null;
}

function isLynxNode(candidate) {
  if (!types.isObject(candidate)) return false;
  let keys = Object.keys(candidate);
  return lynxNodeKeys.every(key => keys.includes(key));
}

function resultsInLynxNode(candidate) {
  if (!types.isObject(candidate)) return false;
  //every key is section binding token or empty
  return Object.keys(candidate).every(key => {
    let meta = keyMetadata.parse(key);
    let isTemplateForValue = meta.empty || (meta.binding &&
      keyMetadata.sectionTokens.includes(meta.binding.token));

    if (!isTemplateForValue) return false;

    return exports.isLynxNodeOrResultsInLynxNode(candidate[key]);
  });
}

function isLynxNodeOrResultsInLynxNode(candidate) {
  return exports.isLynxNode(candidate) || exports.resultsInLynxNode(candidate);
}

exports.getLynxParent = getLynxParent;
exports.isLynxNode = isLynxNode;
exports.isLynxNodeOrResultsInLynxNode = isLynxNodeOrResultsInLynxNode;
exports.resultsInLynxNode = resultsInLynxNode;
exports.addChildren = require("./add-children");
exports.resolveRelativeUrls = require("./resolve-relative-urls");
