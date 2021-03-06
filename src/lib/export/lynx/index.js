"use strict";
const traverse = require("traverse");
const templateKey = require("../../json-templates/template-key");
const types = require("../../../types");
const log = require("logatim");
const specKey = "spec";
const valueKey = "value";

function getValuePortionOfLynxValue(lynxJsValue) {
  return valueKey in lynxJsValue ? lynxJsValue.value : lynxJsValue;
}

function validateSections(sections) {
  function sectionsAreCompatible(reference, comparison) {
    if (exports.isLynxOrResultsInLynx(reference.value) ^ exports.isLynxOrResultsInLynx(comparison.value)) return false;
    if (exports.isLynxOrResultsInLynx(reference.value) && exports.isLynxOrResultsInLynx(comparison.value)) return true;
    if (reference.children.length === 0 || comparison.children.length === 0) return true;
    if (reference.children.length !== comparison.children.length) return false;
    return reference.children.every((child, index) => {
      let childMeta = child.meta;
      let checkMeta = comparison.children[index].meta;
      if (!checkMeta.binding && !childMeta.binding) return checkMeta.name === childMeta.name;
      if (checkMeta.binding && !childMeta.binding) return false;
      if (childMeta.binding && !checkMeta.binding) return false;
      return childMeta.binding.variable === checkMeta.binding.variable;
    });
  }

  let compatible = sections.every((section, index) => {
    if (index + 1 === sections.length) return true;
    return sectionsAreCompatible(section, sections[index + 1]);
  });

  if (!compatible) {
    let sectionKeys = sections.map(item => item.meta.source);
    throw Error("Children are not compatible between value templates. In order to correct this, each binding must be it's own value spec pair. Sections that are incompatible are '" + sectionKeys.join("','") + "'");
  }
}

function accumulateLynxChildren(lynxJsValue) {
  if (!types.isObject(lynxJsValue)) return [];
  let source = getValuePortionOfLynxValue(lynxJsValue);
  if (!types.isObject(source)) return [];
  let sections = [];
  let children = Object.keys(source)
    .map(templateKey.parse)
    .filter(meta => meta.name !== specKey)
    .reduce((acc, meta) => {
      if (meta.name && isLynxOrResultsInLynx(source[meta.source])) {
        acc.push({ meta: meta, value: source[meta.source], updateValue: function (newValue) { source[meta.source] = newValue; } });
      } else if (meta.binding && templateKey.sectionTokens.includes(meta.binding.token)) {
        let sectionChildren = accumulateLynxChildren(source[meta.source]);
        sections.push({ meta: meta, value: source[meta.source], children: sectionChildren });
        acc = acc.concat(sectionChildren.filter(item => !!item.meta.name));
      }
      return acc;
    }, []);

  validateSections(sections);
  return children;
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
  if (!(specKey in jsValue)) return false;
  if (!types.isArray(jsValue[specKey].hints)) {
    log.yellow("Value appears to be a lynx value but has no 'hints' array or 'spec' value.").warn();
    log.yellow(JSON.stringify(jsValue)).warn();
    return false;
  }
  return true;
}

function resultsInLynxNode(jsValue) {
  if (!types.isObject(jsValue)) return false;
  //every key is section binding token or empty
  let keys = Object.keys(jsValue);
  return keys.length > 0 && keys.every(key => {
    let meta = templateKey.parse(key);
    let isTemplateForValue = meta.empty || (meta.binding &&
      templateKey.sectionTokens.includes(meta.binding.token));

    if (!isTemplateForValue) return false;

    return jsValue[key] === null || exports.isLynxOrResultsInLynx(jsValue[key]);
  });
}

function isLynxOrResultsInLynx(jsValue) {
  return exports.isLynxValue(jsValue) || exports.resultsInLynxNode(jsValue);
}

function containsDynamicContent(value) {
  let dynamicNodes = traverse(value).reduce(function (acc, jsValue) {
    let meta = this.key && templateKey.parse(this.key);
    if (meta && meta.binding) acc.push(jsValue);
    if (types.isString(jsValue) && jsValue.indexOf("{{") > -1) acc.push(jsValue);
    return acc;
  }, []);
  return dynamicNodes.length > 0;
}

exports.getLynxParentNode = getLynxParentNode;
exports.isLynxValue = isLynxValue;
exports.isLynxOrResultsInLynx = isLynxOrResultsInLynx;
exports.resultsInLynxNode = resultsInLynxNode;
exports.accumulateLynxChildren = accumulateLynxChildren;
exports.getValuePortionOfLynxValue = getValuePortionOfLynxValue;
exports.containsDynamicContent = containsDynamicContent;
exports.calculateChildren = require("./calculate-children").calculateLynxChildren;
exports.resolveRelativeUrls = require("./resolve-relative-urls").resolveRelativeUrls;
exports.flatten = require("./flatten").flattenLynx;
exports.extractSpecs = require("./extract-specs").extractSpecs;
exports.addRealm = require("./add-realm").addRealm;
exports.validateDocument = require("./validate-document").validateLynxDocument;
