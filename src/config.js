"use strict";

const util = require("util");
const url = require("url");
const expandYaml = require("./lib/expand-yaml");

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
  finishYaml.add(finishYaml.documentProperties);

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

    function addChildNode(childMeta, childKey) {
      function match(childSpec) {
        return childSpec.name === childKey;
      }

      if(childMeta.more) childMeta = childMeta.more();

      if(!isNode(childMeta) && !childMeta.templates) return;
      if(node.spec.children.some(match)) return;

      node.spec.children.push({ name: childKey });
    }

    function findTemplateWithChildren(templates) {
      var templatesWithChildren = templates.map(t => {
          if(t.more) return t.more();
          return t;
        })
        .filter(t => t.children);
      if(templatesWithChildren.length > 1) {
        var compare = Object.getOwnPropertyNames(templatesWithChildren[0].children).sort().join();
        for(var i = 1; i < templatesWithChildren.length; i++) {
          if(Object.getOwnPropertyNames(templatesWithChildren[i].children).sort().join() !== compare) {
            throw new Error("Two value templates have different children. This is an authoring error.");
          }
        }
      }
      if(templatesWithChildren.length === 0) return templates[0];
      return templatesWithChildren[0];
    }

    var valueMeta = meta.children.value;
    if(valueMeta.more) valueMeta = valueMeta.more();

    if(valueMeta.templates) valueMeta = findTemplateWithChildren(valueMeta.templates);

    if(valueMeta.children) {
      Object.getOwnPropertyNames(valueMeta.children)
        .filter(childKey => !expandYaml.excludes.some(f => f({ key: childKey })))
        .forEach(childKey => {
          var childMeta = valueMeta.children[childKey];
          addChildNode(childMeta, childKey);
        });
    }
  });
};
