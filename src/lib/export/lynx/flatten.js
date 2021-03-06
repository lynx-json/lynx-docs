"use strict";
const traverse = require("traverse");
const types = require("../../../types");
const exportLynx = require("./index");
const templateKey = require("../../json-templates/template-key");
const log = require("logatim");
const valueKey = "value";
const documentKeys = ["realm", "base", "focus", "context"];

function shouldCondenseObject(jsValue) {
  var dynamicValue = Object.keys(jsValue.value)
    .map(templateKey.parse)
    .every(meta => meta.binding && (templateKey.sectionTokens.includes(meta.binding.token) || templateKey.simpleTokens.includes(meta.binding.token)));
  if (dynamicValue) return false; //if the value is dynamic, then we need to keep the value key

  if (exportLynx.isLynxValue(jsValue)) {
    var keys = documentKeys.filter(key => key in jsValue.value);
    if (keys.length > 0) {
      log.yellow("Unexpected document key(s) '" + keys.join("','") + "' exist in the 'value' component. Flattening disabled.").warn();
      return false;
    }
  }

  return true;
}

function condenseValue(jsValue, updateValue) {
  if (valueKey in jsValue) {
    if (types.isObject(jsValue.value)) {
      if (!shouldCondenseObject(jsValue)) return;

      Object.assign(jsValue, jsValue.value);
      delete jsValue.value;
    } else {
      if (exportLynx.isLynxValue(jsValue)) return; //don't condense if spec still exists
      updateValue(jsValue.value); //condense to non object value (string, array, etc.)
    }
  }
}

function moveChildrenSpecToParent(jsValue) {
  let specChildren = jsValue.spec && jsValue.spec.children;
  let accumulated = exportLynx.accumulateLynxChildren(jsValue);

  accumulated.forEach(child => {
    moveChildrenSpecToParent(child.value);
    if (exportLynx.containsDynamicContent(child.value.spec)) return;
    let childSpec = specChildren && specChildren.find(item => item.name === child.meta.name);
    if (childSpec) {
      Object.assign(childSpec, child.value.spec);
      delete child.value.spec;
    }
  });
  accumulated.forEach(child => condenseValue(child.value, child.updateValue));
  if (accumulated.length > 0) condenseValue(jsValue);
}

function flattenLynx(template) {
  return traverse(template).map(function (jsValue) {
    if (exportLynx.isLynxValue(jsValue)) {
      moveChildrenSpecToParent(jsValue);
      this.update(jsValue);
    }
  });
}

exports.flattenLynx = flattenLynx;
