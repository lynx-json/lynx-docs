var util = require("util");
var diff = require("deep-diff").diff;
var getMetadata = require("../metadata-yaml");

function isNode(meta) {
  return meta.children && meta.children.spec && meta.children.value;
}

function isArrayNode(meta) {
  var firstValueMeta = meta.children.value[0].more();
  return !firstValueMeta.template && Array.isArray(firstValueMeta.src.value);
}

function isObjectNode(meta) {
  var firstValueMeta = meta.children.value[0].more();
  return !firstValueMeta.template && util.isObject(firstValueMeta.src.value);
}

function isTextNode(meta) {
  var firstValueMeta = meta.children.value[0].more();
  return !firstValueMeta.template && util.isPrimitive(firstValueMeta.src.value);
}

function isArrayValueTemplateNode(meta) {
  var firstValueMeta = meta.children.value[0].more();
  return firstValueMeta.template && firstValueMeta.template.type === "array";
}

function isObjectValueTemplateNode(meta) {
  var firstValueMeta = meta.children.value[0].more();
  return firstValueMeta.template && firstValueMeta.template.type === "object";
}

function isLiteralValueTemplateNode(meta) {
  var firstValueMeta = meta.children.value[0].more();
  return firstValueMeta.template && firstValueMeta.template.type === "literal";
}

function ensureParentSpecChildren(parentSpec, key) {
  if (parentSpec.children && Array.isArray(parentSpec.children)) return;
  throw new Error("Parent spec for key '" + key + "' does not have a 'children' array.");
}

function getChildSpec(parentSpec, name) {
  if (name === undefined) return;
  return parentSpec.children.find(cs => cs.name === name);
}

function moveChildSpecToParent(childSpec, parentSpec) {
  var targetSpec = getChildSpec(parentSpec, childSpec.name);
  if (targetSpec) Object.assign(targetSpec, childSpec);
  else parentSpec.children.push(childSpec);
}

function flattenSpecForArrayNode(kvp, parentSpec) {
  function ignoreName(path, key) {
    return path.length === 0 && key === "name";
  }
  
  function childSpecsAreIdentical() {
    var firstSpec = spec.children[0];
    return spec.children.every((childSpec, idx) => {
      if (idx === 0) return true;
      return undefined === diff(firstSpec, childSpec, ignoreName);
    });
  }
  
  var spec = kvp.value.spec;
  var value = kvp.value.value;
  var newValue = [];
  
  value.forEach((item, idx) => {
    let childKvp = { key: idx, value: item };
    childKvp = flattenSpecForKvp(childKvp, spec);
    newValue.push(childKvp.value);
  });
  
  if (spec.children.length === 0) {
    delete spec.children;
  } else if (spec.children.length === 1 || childSpecsAreIdentical()) {
    spec.children = spec.children[0];
    delete spec.children.name;
  }
  
  if (!parentSpec) {
    // this is the root node, so we need to return the value/spec pair
    // just update the value/spec pair's value
    kvp.value.value = newValue;
    return kvp;
  }
  
  moveChildSpecToParent(spec, parentSpec);
  
  // convert the value/spec pair to just a value
  kvp.value = newValue;
  
  return kvp;
}

function flattenSpecForObjectNode(kvp, parentSpec) {
  var spec = kvp.value.spec;
  var value = kvp.value.value;
  var newValue = {};
  
  Object.getOwnPropertyNames(value).forEach(childKey => {
    let childKvp = { key: childKey, value: value[childKey] };
    childKvp = flattenSpecForKvp(childKvp, spec);
    newValue[childKvp.key] = childKvp.value;
  });
  
  // clean up the children property for this node
  if (spec.children.length === 0) delete spec.children;
  
  if (!parentSpec) {
    // this is the root node, so we need to return the value/spec pair
    // just update the value/spec pair's value
    kvp.value.value = newValue;
    return kvp;
  }
  
  moveChildSpecToParent(spec, parentSpec);
  
  // convert the value/spec pair to just a value
  kvp.value = newValue;
  
  return kvp;
}

function flattenSpecForTextNode(kvp, parentSpec) {
  if (!parentSpec) return kvp;
  ensureParentSpecChildren(parentSpec, kvp.key);
  
  var spec = kvp.value.spec;
  if ("children" in spec) delete spec.children;
  
  moveChildSpecToParent(spec, parentSpec);
  kvp.value = kvp.value.value;
  
  return kvp;
}

function flattenSpecForArrayValueTemplateNode(kvp, parentSpec) {
  var meta = getMetadata(kvp);
  var spec = kvp.value.spec;
  
  if (meta.children.value.length !== 1) return kvp;
  
  var valueMeta = meta.children.value[0].more();
  if (valueMeta.src.value.length !== 1) throw new Error("Multiple item templates are not currently supported.");
  
  let childKvp = { value: valueMeta.src.value[0] };
  childKvp = flattenSpecForKvp(childKvp, spec);
  
  if (childKvp.key) {
    var newItemTemplate = {};
    newItemTemplate[childKvp.key] = childKvp.value;
    valueMeta.src.value[0] = newItemTemplate;
  } else {
    valueMeta.src.value[0] = childKvp.value;
  }
  
  spec.children = spec.children[0];
  
  return kvp;
}

function flattenSpecForObjectValueTemplateNode(kvp, parentSpec) {
  var meta = getMetadata(kvp);
  var spec = kvp.value.spec;
  
  function flattenSpecForChildren(valueMeta) {
    var templateValue = valueMeta.src.value;
    var newTemplateValue = {};
    
    Object.getOwnPropertyNames(templateValue).forEach(childKey => {
      let childKvp = { key: childKey, value: templateValue[childKey] };
      childKvp = flattenSpecForKvp(childKvp, spec);
      newTemplateValue[childKvp.key] = childKvp.value;
    });
    
    kvp.value[valueMeta.src.key] = newTemplateValue;
  }
  
  if (meta.children.value.length === 1) {
    flattenSpecForChildren(meta.children.value[0].more());
    return flattenSpecForSingleValueTemplateNode(kvp, parentSpec);
  } else {
    meta.children.value.map(m => m.more()).forEach(flattenSpecForChildren);
  }
  
  return kvp;
}

function flattenSpecForLiteralValueTemplateNode(kvp, parentSpec) {
  delete kvp.value.spec.children;
  var meta = getMetadata(kvp);
  if (meta.children.value.length !== 1) return kvp;
  return flattenSpecForSingleValueTemplateNode(kvp, parentSpec);
}

function flattenSpecForSingleValueTemplateNode(kvp, parentSpec) {
  var meta = getMetadata(kvp);
  var spec = kvp.value.spec;
  var valueMeta = meta.children.value[0].more();
  
  var newKvp = { key: null, value: valueMeta.src.value };
  var template = valueMeta.template;
  
  if (meta.key === template.variable) {
    newKvp.key = meta.key + template.symbol;
  } else {
    newKvp.key = meta.key ? 
      meta.key + template.symbol + template.variable :
      template.symbol + template.variable;
  }
  
  moveChildSpecToParent(spec, parentSpec);
  
  return newKvp;
}

function flattenSpecForKvp(kvp, parentSpec) {
  if (!kvp) throw new Error("'kvp' param is required");
  
  var meta = getMetadata(kvp);
  
  if (!isNode(meta)) return kvp;
  if (meta.template) return kvp; // we cannot flatten dynamic nodes
  if (meta.children.spec[0].template) return kvp; // we cannot flatten dynamic specs
  
  if (isArrayNode(meta)) return flattenSpecForArrayNode(kvp, parentSpec);
  if (isObjectNode(meta)) return flattenSpecForObjectNode(kvp, parentSpec);
  if (isTextNode(meta)) return flattenSpecForTextNode(kvp, parentSpec);
  if (isArrayValueTemplateNode(meta)) return flattenSpecForArrayValueTemplateNode(kvp, parentSpec);
  if (isObjectValueTemplateNode(meta)) return flattenSpecForObjectValueTemplateNode(kvp, parentSpec);
  if (isLiteralValueTemplateNode(meta)) return flattenSpecForLiteralValueTemplateNode(kvp, parentSpec);
  
  delete meta.src;
  var msg = "Unexpected type of KVP. Metadata for KVP is: " + JSON.stringify(meta);
  throw new Error(msg);
}

module.exports = exports = function flattenYaml(kvp) {
  kvp = flattenSpecForKvp(kvp);
  if (kvp.value.spec.children && kvp.value.spec.children.length === 0) delete kvp.value.spec.children;
  return kvp;
};
