const keyMetadata = require("../../json-templates/key-metadata");
const types = require("../../../types");
const specKey = "spec";

function getValuePortionOfLynxValue(lynxValue) {
  return Object.keys(lynxValue).includes("value") ? lynxValue.value : lynxValue;
}

function validateAndAccumulateChildren(accumulator) {
  function sectionAndInverseCompatible(section, inverse) {
    if (!section || !inverse) return true;
    if (section.length === 0 || inverse.length === 0) return true;
    if (section.length !== inverse.length) return false;
    return section.every((child, index) => {
      let childMeta = child.meta;
      let checkMeta = inverse[index].meta;
      if (!checkMeta.binding && !childMeta.binding) return checkMeta.name === childMeta.name;
      if (checkMeta.binding && !childMeta.binding) return false;
      if (childMeta.binding && !checkMeta.binding) return false;
      return childMeta.binding.variable === checkMeta.binding.variable;
    });
  }

  let sectionKeys = Object.keys(accumulator).filter(key => key !== "direct");

  let sections = sectionKeys.reduce((acc, key) => {
    if (key === "direct") return acc;
    acc.push(accumulator[key]);
    return acc;
  }, []);

  let compatible = sections.every((section, index) => {
    let areCompatible = true;
    for (var compare = index + 1; compare < sections.length; compare++) {
      areCompatible = areCompatible && sectionAndInverseCompatible(section, sections[compare]);
    }
    return areCompatible;
  });

  if (!compatible) throw Error("Children are not compatible between value templates. In order to correct this, each value template must be it's own value spec pair. Sections that are incompatible are '" + sectionKeys.join("','") + "'");

  let sectionWithChildren = sections.find(section => section.length > 0);
  return [].concat(accumulator.direct || [], sectionWithChildren || []);
}

function accumulateLynxChildren(lynxValue) {
  if (!types.isObject(lynxValue)) return [];
  let source = getValuePortionOfLynxValue(lynxValue);
  let accumulator = Object.keys(source)
    .map(keyMetadata.parse)
    .reduce((acc, meta) => {
      if (meta.name === specKey) return acc;
      if (meta.name && isLynxValue(source[meta.source])) {
        acc.direct.push({ meta: meta, value: source[meta.source], parent: lynxValue });
      } else if (meta.binding && keyMetadata.sectionTokens.includes(meta.binding.token)) {
        acc[meta.binding.token + meta.binding.variable] = accumulateLynxChildren(source[meta.source]);
      }
      return acc;
    }, { direct: [] });

  return validateAndAccumulateChildren(accumulator);
}

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
exports.accumulateLynxChildren = accumulateLynxChildren;
exports.getValuePortionOfLynxValue = getValuePortionOfLynxValue;
exports.calculateChildren = require("./calculate-children");
exports.resolveRelativeUrls = require("./resolve-relative-urls");
exports.rollUpSpecs = require("./rollup-specs");
exports.extractSpecs = require("./extract-specs");
