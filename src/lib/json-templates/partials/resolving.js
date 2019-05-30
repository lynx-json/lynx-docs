"use strict";

const fs = require("fs");
const path = require("path");
const url = require("url");
const partialExtensions = [".js", ".yml", ];
const lynxDocsPartialDirectory = path.join(__dirname, "../../_partials");
const parseYaml = require("../../parse-yaml");
const partials = require("./index");
const types = require("../../../types");

function calculateSearchDirectories(startPath) {
  let cwd = process.cwd();
  let relative = path.relative(cwd, startPath);
  let dirnames = path.dirname(relative).split(path.sep);

  let searchPaths = dirnames.reduce((acc, segment, index) => {
    let current = path.resolve(cwd, dirnames.slice(0, index).join(path.sep), segment);
    acc.push(path.resolve(current, exports.partialDirectory));
    acc.push(current);
    return acc;
  }, []).reverse(); //closest paths first
  if (!searchPaths.includes(cwd)) searchPaths.push(cwd);
  let cwdPartialDir = path.resolve(cwd, exports.partialDirectory);
  if (!searchPaths.includes(cwdPartialDir)) searchPaths.push(cwdPartialDir);
  searchPaths.push(lynxDocsPartialDirectory);
  return searchPaths;
}

function scanDirectoryForPartial(directory, partialName, partialFolder) {
  if (!fs.existsSync(directory)) return null;
  if (!fs.statSync(directory).isDirectory()) return null;

  //determine if we are in a partialFolder context. Context could have been established by ancestor
  partialFolder = partialFolder || directory.endsWith(exports.partialDirectory) || directory === lynxDocsPartialDirectory;
  let extensions = partialFolder ? partialExtensions : partialExtensions.map(ext => ".partial" + ext);

  return fs.readdirSync(directory)
    .map(child => {
      return { name: child, path: path.join(directory, child), isDirectory: fs.statSync(path.join(directory, child)).isDirectory() };
    })
    .sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return 1; //process files first
      if (b.isDirectory && !a.isDirectory) return -1; //only process directories last
      return 0;
    })
    .reduce((result, child) => {
      if (result) return result;

      if (path.extname(child.name) &&
        extensions.some(ext => partialName === path.basename(child.name, ext))) return child.path;

      return partialFolder && child.isDirectory ? scanDirectoryForPartial(child.path, partialName, partialFolder) : null;

    }, null);

}

function convertJsPartialToFunction(partialFile) {
  delete require.cache[require.resolve(partialFile)];
  let partialFn = require(partialFile);
  return (parameters, options) => {
    let partial = partialFn(parameters, options);
    return partials.applyParameters(partial, parameters);
  };
}

function convertYamlPartialToFunction(partialFile) {
  let contents = fs.readFileSync(partialFile);
  let partial = parseYaml(contents);
  return (parameters) => partials.applyParameters(partial, parameters);
}

function resolvePartialFromName(basePath, partialName) {
  let directories = exports.calculateSearchDirectories(path.resolve(basePath));
  let partialFile = directories.reduce((acc, directory) => {
    return acc ? acc : exports.scanDirectoryForPartial(directory, partialName);
  }, null);

  if (!partialFile) throw Error("Unable to find partial '" + partialName + "'. The following directories where scanned. \n" + directories.join("\n"));

  return partialFile;
}

function resolvePartial(partialUrl) { //initial/search/path?partial=name
  if (!types.isString(partialUrl)) throw Error("partialUrl must be a string");
  let parsed = url.parse(partialUrl, true);
  if (!parsed.query || !parsed.pathname || !parsed.query.partial) throw Error("Invalid partial value. The partial format is expected to be the absolute path to the the template file with a query string for the partial name to resolve (e.g. '/full/path/to/template.(lynx|template).yml?partial=partialName').");

  let partial = exports.resolvePartialFromName(parsed.pathname, parsed.query.partial);
  if (types.isObject(partial)) return (parameters) => partials.applyParameters(partial, parameters);
  if (!types.isString(partial)) throw Error("Resolved partial must be a partial object or a path to a partial file.");

  if (path.extname(partial) === ".js") return exports.convertJsPartialToFunction(partial);
  else return exports.convertYamlPartialToFunction(partial);
}

exports.resolve = resolvePartial;
exports.resolvePartialFromName = resolvePartialFromName;
exports.calculateSearchDirectories = calculateSearchDirectories;
exports.scanDirectoryForPartial = scanDirectoryForPartial;
exports.convertJsPartialToFunction = convertJsPartialToFunction;
exports.convertYamlPartialToFunction = convertYamlPartialToFunction;
exports.partialDirectory = "_partials";
exports.lynxDocsPartialDirectory = lynxDocsPartialDirectory;
