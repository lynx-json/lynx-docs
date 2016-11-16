"use strict";

const getMetadata = require("../../../src").lib.meta;
const util = require("util");
const lynxPartial = require("./lynx-node");
const partials = require("./partials");
const params = partials.params;
const param = partials.param;

function addHint(value, hint) {
  if (!util.isObject(value) || (!value.spec && !value.value)) {
    value = {
      value: value
    };
  }
  
  value.spec = value.spec || {};
  value.spec.hints = value.spec.hints || [];
  if (value.spec.hints.indexOf(hint) === -1) {
    value.spec.hints.unshift(hint);
  }
  
  return value;
}

module.exports = exports = function (kvp) {
  kvp.value.hints = [ "http://uncategorized/page", "section" ];
  
  var params = {};
  
  var bannerParam = param(kvp, "banner");
  if (bannerParam) {
    params[bannerParam.src.key] = addHint(bannerParam.src.value, "http://uncategorized/banner");
  } else {
    params["banner>"] = null;
  }
  
  var globalNavParam = param(kvp, "globalNav");
  if (globalNavParam) {
    params[globalNavParam.src.key] = addHint(globalNavParam.src.value, "http://uncategorized/global-navigation");
  }
  
  var searchParam = param(kvp, "search");
  if (searchParam) {
    params[searchParam.src.key] = addHint(searchParam.src.value, "http://uncategorized/search");
  }
  
  var localNavParam = param(kvp, "localNav");
  if (localNavParam) {
    params[localNavParam.src.key] = addHint(localNavParam.src.value, "http://uncategorized/local-navigation");
  }
  
  var ctxParam = param(kvp, "ctx");
  if (ctxParam) {
    params[ctxParam.src.key] = addHint(ctxParam.src.value, "http://uncategorized/context");
  }
  
  var mainParam = param(kvp, "main");
  if (mainParam) {
    params[mainParam.src.key] = addHint(mainParam.src.value, "http://uncategorized/main");
  }
  
  return lynxPartial({ key: kvp.key, value: params });
};
