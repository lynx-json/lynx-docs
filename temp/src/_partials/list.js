"use strict";

const getMetadata = require("../../../src").lib.meta;
const util = require("util");
const lynxPartial = require("./lynx-node");
const partials = require("./partials");
const params = partials.params;
const param = partials.param;

module.exports = exports = function (kvp) {
  kvp.value.hints = [ "http://uncategorized/listing" ];
  var result = lynxPartial(kvp);
  
  var valueParam = param(result, "value");
  if (valueParam) {
    let items = valueParam.src.value.map(item => {
      let meta = getMetadata({ key: undefined, value: item });
      var symbolMeta = meta.children.symbol;
      
      if (symbolMeta) {
        symbolMeta = symbolMeta[0].more();
        
        item[symbolMeta.key] = {
          spec: {
            hints: [ "http://uncategorized/listing/item/symbol" ]
          }
        };
        
        if (symbolMeta.template) {
          item[symbolMeta.key]["value" + symbolMeta.template.section] = symbolMeta.src.value;
        } else {
          item[symbolMeta.key].value = symbolMeta.src.value;
        }
      }
      
      return {
        spec: {
          hints: [ "http://uncategorized/listing/item", "card", "section" ]
        },
        value: item
      };
    });
    
    result.value[valueParam.src.key] = items;
  }
  
  return result;
};
