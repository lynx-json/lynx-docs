"use strict";

const fs = require("fs");
const path = require("path");
const url = require("url");
const mime = require("mime");
const types = require("../types");
const parseYaml = require("./parse-yaml");
const log = require("logatim");

function getRealms(roots, realm) {
  var realms = [];
  if (!types.isArray(roots)) roots = [roots];
  roots.forEach(root => {
    root = path.resolve(root);
    aggregateRealms(root, root, realm || "/", realms);
    realms
      .filter(realm => !realm.root)
      .forEach(realm => realm.root = root);
  });

  return realms.sort(function (a, b) {
    if (a.realm === b.realm) return 0;
    if (a.realm.indexOf(b.realm) === 0) return 1;
    if (b.realm.indexOf(a.realm) === 0) return -1;
    if (a.realm < b.realm) return 1;
    if (a.realm > b.realm) return -1;
  });
}

function aggregateRealms(folder, root, parentRealm, realms) {
  var realmsForFolder = getRealmsForFolder(folder, root, parentRealm);
  var defaultRealm = realmsForFolder[0];

  var subfolders = [];
  var templateFiles = [];
  var contentFiles = [];

  fs.readdirSync(folder).forEach(function (child) {
    var pathToChild = path.resolve(folder, child);
    var stats = fs.statSync(pathToChild);

    if (stats.isDirectory()) {
      if (!isDataDir(pathToChild)) subfolders.push(pathToChild);
    } else {
      if (isTemplateFile(pathToChild)) {
        templateFiles.push(pathToChild);
      } else if (isContentFile(pathToChild)) {
        contentFiles.push(pathToChild);
      }
    }
  });

  aggregateTemplateFiles(templateFiles, realmsForFolder);
  aggregateContentFiles(contentFiles, realmsForFolder);

  realmsForFolder.forEach(function (realm) {
    realms.push(realm);
  });

  subfolders.forEach(function (subfolder) {
    aggregateRealms(subfolder, folder, defaultRealm.realm, realms);
  });
}

function getRealmsForFolder(folder, root, parentRealm) {
  var defaultRealm = deriveRealmFromFolder(folder, root);
  var realmsForFolder = getMetaForFolder(folder);

  if (realmsForFolder.length) {
    copyObject(realmsForFolder[0], defaultRealm);
    realmsForFolder.splice(0, 1, defaultRealm);
  } else {
    realmsForFolder.push(defaultRealm);
  }

  realmsForFolder.forEach(function (realmObj) {
    ensureStructure(realmObj);
    resolveRealm(realmObj, parentRealm);
    resolvePaths(realmObj, folder);
  });

  return realmsForFolder;
}

function deriveRealmFromFolder(folder, root) {
  var realmPath = path.relative(root, folder);
  var realm = createRealm(realmPath, folder);
  return realm;
}

function createRealm(realm, folder, variants) {
  return {
    realm: realm,
    folder: folder,
    templates: [],
    variants: variants || []
  };
}

function getMetaForFolder(folder) {
  var pathToMeta = path.resolve(folder, "./.meta.yml");
  if (!fs.existsSync(pathToMeta)) return [];

  var meta = parseYaml(fs.readFileSync(pathToMeta));
  if (!meta) {
    log.warn("Empty metadata file was ignored: '" + pathToMeta + "'");
    return [];
  }

  if (!types.isArray(meta)) meta = [meta];
  meta.forEach(m => {
    m.folder = folder;
  });
  return meta;
}

function copyObject(src, dest) {
  Object.getOwnPropertyNames(src).forEach(function (prop) {
    dest[prop] = src[prop];
  });
}

function ensureStructure(realmObj) {
  realmObj.variants = realmObj.variants || [];
  realmObj.variants.forEach(ensureVariantName);
  realmObj.templates = realmObj.templates || [];
}

function ensureVariantName(variantObj) {
  if (!variantObj.name) variantObj.name = getVariantName(variantObj);
}

function resolveRealm(realmObj, parentRealm) {
  realmObj.realm = url.resolve(parentRealm, realmObj.realm);
  if (!realmObj.realm.match(/\/$/)) realmObj.realm += "/";
}

function resolvePaths(realmObj, folder) {
  realmObj.templates.forEach(function (val, idx, arr) {
    arr[idx] = path.resolve(folder, val);
  });

  realmObj.variants.forEach(function (val) {
    if (val.template) val.template = path.resolve(folder, val.template);
    if (val.data) val.data = path.resolve(folder, val.data);
    if (val.content) val.content = path.resolve(folder, val.content);
  });
}

function isTemplateFile(pathToFile) {
  return pathToFile.match(/\.(lynx|template)\.yml$/);
}

function isDataFile(pathToFile) {
  return pathToFile.match(/\.data\.(yml|js|json)$/);
}

function isMetaFile(pathToFile) {
  return pathToFile.match(/^.*\.meta.yml$/);
}

function isDataDir(pathToDir) {
  return pathToDir.match(/\.data$/);
}

function isContentFile(pathToFile) {
  return !isTemplateFile(pathToFile) &&
    !isDataFile(pathToFile) &&
    !isMetaFile(pathToFile);
}

function aggregateTemplateFiles(templateFiles, realmsForFolder) {
  function equals(a) {
    return function (b) {
      return a === b;
    };
  }

  function hasTemplate(templateFile) {
    return function (realm) {
      return realm.templates && realm.templates.some(equals(templateFile));
    };
  }

  var defaultRealm = realmsForFolder[0];

  templateFiles.forEach(function (templateFile) {
    var realmForTemplate = realmsForFolder.filter(hasTemplate(templateFile));
    if (realmForTemplate.length === 0) defaultRealm.templates.push(templateFile);
  });

  realmsForFolder.forEach(function (realm) {
    aggregateVariants(realm.templates, realm);
  });
}

function aggregateVariants(templateFiles, realm) {
  templateFiles.forEach(function (templateFile) {
    var dataFiles = getDataFilesForTemplate(templateFile);

    dataFiles.forEach(function (dataFile) {
      if (realm.variants.some(v => templateFile === v.template && dataFile === v.data)) return;
      realm.variants.push(createVariant(templateFile, dataFile));
    });

    if (dataFiles.length > 0) return;
    if (realm.variants.some(v => v.template === templateFile)) return;

    // if there are no data files for this template
    // and if there are no variants already defined for this template
    // then the template is the only variant
    realm.variants.push(createVariant(templateFile));
  });
}

function getDataFilesForTemplate(templateFile) {
  var folder = path.dirname(templateFile);
  var dataFiles = [];

  fs.readdirSync(folder).forEach(function (child) {
    var pathToChild = path.resolve(folder, child);

    if (isDataDirForTemplate(pathToChild, templateFile)) {
      aggregateDataFiles(pathToChild, dataFiles);
    } else if (isDataFileForTemplate(pathToChild, templateFile)) {
      dataFiles.push(pathToChild);
    }
  });

  return dataFiles;
}

function isDataDirForTemplate(pathToDir, templateFile) {
  return pathToDir === getDataDirForTemplate(templateFile);
}

function getDataDirForTemplate(templateFile) {
  var templateDir = path.dirname(templateFile);
  var templateName = getTemplateFileName(templateFile);
  var dataDir = path.resolve(templateDir, templateName + ".data");
  return dataDir;
}

function aggregateDataFiles(pathToDir, dataFiles) {
  fs.readdirSync(pathToDir).forEach(function (dataFile) {
    dataFiles.push(path.resolve(pathToDir, dataFile));
  });
}

function isDataFileForTemplate(dataFile, templateFile) {
  if (dataFile === templateFile) return false;

  return getTemplateFileName(dataFile) === getTemplateFileName(templateFile);
}

function createVariant(templateFile, dataFile) {
  var variantObj = {
    template: templateFile,
    data: dataFile,
    type: "application/lynx+json"
  };

  variantObj.name = getVariantName(variantObj);

  return variantObj;
}

function getVariantName(variantObj) {
  var dataName = getDataFileName(variantObj.data);
  var templateName = getTemplateFileName(variantObj.template);
  var contentName = getContentFileName(variantObj.content);

  if (dataName) {
    if (dataName === templateName) return dataName;
    return templateName + "-" + dataName;
  } else if (templateName) {
    return templateName;
  } else if (contentName) {
    return contentName;
  }

  return "unknown";
}

function getDataFileName(pathToFile) {
  if (!pathToFile) return;

  var dataFileObj = path.parse(pathToFile);
  var dataFileNameParts = dataFileObj.name.split(".");

  if (dataFileNameParts.length === 1) {
    // variant.ext
    return dataFileObj.name;
  } else if (dataFileNameParts.length === 2) {
    // template.data.ext
    return dataFileNameParts[0];
  } else if (dataFileNameParts.length === 3) {
    // template.variant.data.ext
    return dataFileNameParts[1];
  }
}

function getTemplateFileName(pathToFile) {
  if (!pathToFile) return;
  var templateFileObj = path.parse(pathToFile);
  var templateFileNameParts = templateFileObj.name.split(".");
  return templateFileNameParts[0];
}

function getContentFileName(pathToFile) {
  if (!pathToFile) return;
  var contentFileObj = path.parse(pathToFile);
  return contentFileObj.base;
}

function aggregateContentFiles(contentFiles, realmsForFolder) {
  var defaultRealm = realmsForFolder[0];

  contentFiles.forEach(function (contentFile) {
    var realm = url.resolve(defaultRealm.realm, path.parse(contentFile).base);
    var variants = [createContentVariant(contentFile)];
    var folder = path.dirname(contentFile);
    var realmObj = createRealm(realm, folder, variants);
    realmsForFolder.push(realmObj);
  });
}

function createContentVariant(contentFile) {
  var variant = {
    content: contentFile,
    type: mime.lookup(contentFile)
  };

  variant.name = getVariantName(variant);

  return variant;
}

module.exports = exports = getRealms;
