"use strict";

const lynxDocs = require("../../../src");
const getMetadata = lynxDocs.lib.meta;
const util = require("util");

function* params(kvp) {
  if (kvp.value && util.isObject(kvp.value)) {
    for (let p in kvp.value) {
      yield getMetadata({
        key: p,
        value: kvp.value[p]
      });
    }
  }
}

function param(kvp, name) {
  for (let p of params(kvp)) {
    if (p.key === name) return p;
  }
}

exports.params = params;
exports.param = param;
