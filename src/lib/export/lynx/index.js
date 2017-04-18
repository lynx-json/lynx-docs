const keyMetadata = require("../../json-templates/key-metadata");
const types = require("../../../types");
const specKey = "spec";

function getLynxParentNode(traverseNode) {
  let context = traverseNode.parent;
  while (context) {
    if (isLynxValue(context.node)) return context;
    context = context.parent;
  }
  return null;
}

function isLynxValue(jsValue) {
  if (!types.isObject(jsValue)) return false;
  return Object.keys(jsValue).some(key => key === specKey);
}

function resultsInLynxNode(jsValue) {
  if (!types.isObject(jsValue)) return false;
  //every key is section binding token or empty
  return Object.keys(jsValue).every(key => {
    let meta = keyMetadata.parse(key);
    let isTemplateForValue = meta.empty || (meta.binding &&
      keyMetadata.sectionTokens.includes(meta.binding.token));

    if (!isTemplateForValue) return false;

    return exports.isLynxOrResultsInLynx(jsValue[key]);
  });
}

function isLynxOrResultsInLynx(jsValue) {
  return exports.isLynxValue(jsValue) || exports.resultsInLynxNode(jsValue);
}

exports.getLynxParentNode = getLynxParentNode;
exports.isLynxValue = isLynxValue;
exports.isLynxOrResultsInLynx = isLynxOrResultsInLynx;
exports.resultsInLynxNode = resultsInLynxNode;
exports.calculateChildren = require("./calculate-children");
exports.resolveRelativeUrls = require("./resolve-relative-urls");
