"use strict";

const util = require("util");
const url = require("url");

module.exports = exports = function(lynxDocs) {
  var finishYaml = lynxDocs.lib.finish;
  
  finishYaml.add(finishYaml.headers);
  finishYaml.add(finishYaml.titles);
  finishYaml.add(finishYaml.labels);
  finishYaml.add(finishYaml.links);
  finishYaml.add(finishYaml.submits);
  finishYaml.add(finishYaml.images);
  finishYaml.add(finishYaml.content);
  finishYaml.add(finishYaml.forms);
  finishYaml.add(finishYaml.sections);
  finishYaml.add(finishYaml.markers);
  finishYaml.add(finishYaml.containers);
  finishYaml.add(finishYaml.text);
  
  finishYaml.add(function addRealm(kvp, options) {
    // only do this for the root document kvp
    if (kvp.key) return;
    if (!util.isObject(kvp.value)) return;
    if (!options || !options.realm) return;

    if (kvp.value.realm) {
      kvp.value.realm = url.resolve(options.realm.realm, kvp.value.realm);
    } else {  
      kvp.value.realm = options.realm.realm;
    }
  });
  
  function expandMeta(meta) {
    if ("more" in meta) return meta.more();
    throw new Error("Unable to expand meta");
  }
  
  finishYaml.add(function addSpecChildren(kvp) {
    function isNode(meta) {
      return meta.children && meta.children.spec && meta.children.value;
    }
    
    function isArray(meta) {
      var firstMeta = meta.children.value[0];
      if (firstMeta.template && firstMeta.template.type === "array") return true;
      if (util.isArray(firstMeta.more().src.value)) return true;
      return false;
    }
    
    var meta = lynxDocs.lib.meta(kvp);  
    if (!isNode(meta) || isArray(meta)) return;
    
    var node = kvp.value;
    node.spec.children = node.spec.children || [];
    
    function addChildNode(childMeta) {
      function match(childSpec) {
        return childSpec.name === childMeta.key;
      }
      
      if (!isNode(childMeta)) return;
      if (node.spec.children.some(match)) return;
      if (childMeta.key === "href") {
        console.log(JSON.stringify(childMeta));
      }
      node.spec.children.push({ name: childMeta.key });
    }
    
    meta.children.value.map(expandMeta).forEach(function (valueMeta) {
      for (let childKey in valueMeta.children) {
        valueMeta.children[childKey].map(expandMeta).forEach(addChildNode);
      }
    });
  });
};
