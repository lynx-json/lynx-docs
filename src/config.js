"use strict";

const util = require("util");
const url = require("url");

module.exports = exports = function (lynxDocs) {
  var finishYaml = lynxDocs.lib.finish;

  finishYaml.add(finishYaml.links);
  finishYaml.add(finishYaml.submits);
  finishYaml.add(finishYaml.images);
  finishYaml.add(finishYaml.content);
  finishYaml.add(finishYaml.forms);
  finishYaml.add(finishYaml.markers);
  finishYaml.add(finishYaml.containers);
  finishYaml.add(finishYaml.text);

  finishYaml.add(function addRealm(kvp, options) {
    // only do this for the root document kvp
    if(kvp.key) return;
    if(!util.isObject(kvp.value)) return;
    if(!options || !options.realm) return;

    var meta = lynxDocs.lib.meta(kvp);
    if(meta.children.realm && meta.children.realm.templates) return;

    if(kvp.value.realm) {
      kvp.value.realm = url.resolve(options.realm.realm, kvp.value.realm);
    } else {
      kvp.value.realm = options.realm.realm;
    }
  });

  function expandMeta(meta) {
    if("more" in meta) return meta.more();
    throw new Error("Unable to expand meta");
  }

  finishYaml.add(function addSpecChildren(kvp) {
    function isNode(meta) {
      return meta.children && meta.children.spec && meta.children.value;
    }

    function isArray(meta) {
      var valueMeta = meta.children.value;
      if(valueMeta.more) valueMeta = valueMeta.more();

      if(valueMeta.template) return valueMeta.template.type === "array";
      if(valueMeta.templates) return valueMeta.templates[0].template.type === "array";
      if(Array.isArray(valueMeta.src.value)) return true;
      return false;
    }

    var meta = lynxDocs.lib.meta(kvp);
    if(!isNode(meta) || isArray(meta)) return;

    var node = kvp.value;
    node.spec.children = node.spec.children || [];

    function addChildNode(childMeta) {
      function match(childSpec) {
        return childSpec.name === childMeta.key;
      }

      if(childMeta.more) childMeta = childMeta.more();

      if(!isNode(childMeta)) return;
      if(node.spec.children.some(match)) return;

      node.spec.children.push({ name: childMeta.key });
    }

    var valueMeta = meta.children.value;
    if(valueMeta.more) valueMeta = valueMeta.more();

    if(valueMeta.children) {
      Object.getOwnPropertyNames(valueMeta.children).forEach(childKey => {
        addChildNode(valueMeta.children[childKey]);
      });
    } else if(valueMeta.templates) {
      addChildNode(valueMeta.templates[0]);
    }
  });
};
