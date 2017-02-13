var util = require("util");
var diff = require("deep-diff").diff;
var getMetadata = require("../metadata-yaml");

function isNode(meta) {
  return meta.children && meta.children.spec && meta.children.value;
}

function isArrayNode(meta) {
  var firstValueMeta = meta.children.value;
  if(firstValueMeta.more) firstValueMeta = firstValueMeta.more();
  return !firstValueMeta.template &&
    firstValueMeta.src &&
    Array.isArray(firstValueMeta.src.value);
}

function isObjectNode(meta) {
  var firstValueMeta = meta.children.value;
  if(firstValueMeta.more) firstValueMeta = firstValueMeta.more();
  return !firstValueMeta.template &&
    firstValueMeta.src &&
    util.isObject(firstValueMeta.src.value);
}

function isTextNode(meta) {
  var firstValueMeta = meta.children.value;
  if(firstValueMeta.more) firstValueMeta = firstValueMeta.more();
  return !firstValueMeta.template &&
    firstValueMeta.src &&
    util.isPrimitive(firstValueMeta.src.value);
}

function isTemplateNode(meta, type) {
  var valueMeta = meta.children.value;
  if(valueMeta.more) valueMeta = valueMeta.more();
  return(valueMeta.template && valueMeta.template.type === type) ||
    (valueMeta.templates && valueMeta.templates[0].template.type === type);
}

function isArrayValueTemplateNode(meta) {
  return isTemplateNode(meta, "array");
}

function isObjectValueTemplateNode(meta) {
  return isTemplateNode(meta, "object");
}

function isLiteralValueTemplateNode(meta) {
  return isTemplateNode(meta, "literal");
}

function getChildSpec(parentSpec, name) {
  if(name === undefined) return;
  return parentSpec.children.find(cs => cs.name === name);
}

function moveChildSpecToParent(childSpec, parentSpec) {
  parentSpec.children = parentSpec.children || [];
  var targetSpec = getChildSpec(parentSpec, childSpec.name);

  if(targetSpec) {
    Object.assign(targetSpec, childSpec);
  } else {
    parentSpec.children.push(childSpec);
  }
}

function flattenSpecForArrayNode(kvp, parentSpec) {
  function ignoreName(path, key) {
    return path.length === 0 && key === "name";
  }

  function childSpecsAreIdentical() {
    var firstSpec = spec.children[0];
    return spec.children.every((childSpec, idx) => {
      if(idx === 0) return true;
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

  if(spec.children && (spec.children.length === 1 || childSpecsAreIdentical())) {
    spec.children = spec.children[0];
    delete spec.children.name;
  }

  if(!parentSpec) {
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
    let childMeta = getMetadata(childKvp);
    newValue[childKvp.key] = childKvp.value;
  });

  if(!parentSpec) {
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
  if(!parentSpec) return kvp;

  var spec = kvp.value.spec;
  moveChildSpecToParent(spec, parentSpec);

  kvp.value = kvp.value.value;
  return kvp;
}

function flattenSpecForArrayValueTemplateNode(kvp, parentSpec) {
  var meta = getMetadata(kvp);
  var spec = kvp.value.spec;

  var valueMeta = meta.children.value;
  if(valueMeta.more) valueMeta = valueMeta.more();
  if(valueMeta.templates && valueMeta.templates.length !== 1) return kvp;
  
  var arrayItemTemplates = valueMeta.templates[0].src.value;
  if (arrayItemTemplates.length !== 1) return kvp;
  
  let ckvp = { value: arrayItemTemplates[0] };

  ckvp = flattenSpecForKvp(ckvp, spec);

  if(ckvp.key) {
    let newItemTemplate = {};
    newItemTemplate[ckvp.key] = ckvp.value;
    arrayItemTemplates[0] = newItemTemplate;
  } else {
    arrayItemTemplates[0] = ckvp.value;
  }

  spec.children = spec.children[0];

  return kvp;
}

function flattenSpecForObjectValueTemplateNode(kvp, parentSpec) {
  function flattenSpecForChildren(valueMeta) {
    if (valueMeta.more) valueMeta = valueMeta.more();
    var templateValue = valueMeta.src.value;
    var newTemplateValue = {};

    Object.getOwnPropertyNames(templateValue).forEach(childKey => {
      let childKvp = { key: childKey, value: templateValue[childKey] };
      childKvp = flattenSpecForKvp(childKvp, spec);
      newTemplateValue[childKvp.key] = childKvp.value;
    });

    kvp.value[valueMeta.src.key] = newTemplateValue;
  }
  
  var meta = getMetadata(kvp);
  var spec = kvp.value.spec;
  
  var valueMeta = meta.children.value;
  if(valueMeta.more) valueMeta = valueMeta.more();

  if(valueMeta.templates.length === 1) {
    flattenSpecForChildren(valueMeta.templates[0]);
    return flattenSpecForSingleValueTemplateNode(kvp, parentSpec);
  } else {
    valueMeta.templates.forEach(flattenSpecForChildren);
  }

  return kvp;
}

function flattenSpecForLiteralValueTemplateNode(kvp, parentSpec) {
  var meta = getMetadata(kvp);
  
  var valueMeta = meta.children.value;
  if(valueMeta.more) valueMeta = valueMeta.more();
  if(valueMeta.templates && valueMeta.templates.length !== 1) return kvp;

  return flattenSpecForSingleValueTemplateNode(kvp, parentSpec);
}

function flattenSpecForSingleValueTemplateNode(kvp, parentSpec) {
  var meta = getMetadata(kvp);

  var valueMeta = meta.children.value;
  if(valueMeta.more) valueMeta = valueMeta.more();
  if(valueMeta.templates && valueMeta.templates.length !== 1) return kvp;

  var spec = kvp.value.spec;
  var newKvp = { key: null, value: valueMeta.templates[0].src.value };
  var template = valueMeta.templates[0].template;

  if(meta.key === template.variable) {
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
  function log(msg, val) {
    // console.log(msg, val);
  }
  
  function _return(param) {
    log("out", JSON.stringify(param));
    return param;
  }
  
  if(!kvp) throw new Error("'kvp' param is required");
  log("in", JSON.stringify(kvp));
  var meta = getMetadata(kvp);

  if(!isNode(meta)) return _return( kvp );
  if(meta.template) return _return( kvp );
  if(meta.children.spec.template) return _return( kvp );

  if(meta.key !== undefined && meta.key !== null) {
    var specMeta = meta.children.spec.more();
    specMeta.src.value.name = meta.key;
  }

  if(isArrayNode(meta)) return _return( flattenSpecForArrayNode(kvp, parentSpec) );
  if(isObjectNode(meta)) return _return( flattenSpecForObjectNode(kvp, parentSpec) );
  if(isTextNode(meta)) return _return( flattenSpecForTextNode(kvp, parentSpec) );
  if(isArrayValueTemplateNode(meta)) return _return( flattenSpecForArrayValueTemplateNode(kvp, parentSpec) );
  if(isObjectValueTemplateNode(meta)) return _return( flattenSpecForObjectValueTemplateNode(kvp, parentSpec) );
  if(isLiteralValueTemplateNode(meta)) return _return( flattenSpecForLiteralValueTemplateNode(kvp, parentSpec) );

  delete meta.src;
  var msg = "Unexpected type of KVP. Metadata for KVP is: " + JSON.stringify(meta);
  throw new Error(msg);
}

module.exports = exports = flattenSpecForKvp;
