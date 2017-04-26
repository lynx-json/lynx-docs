"use strict";

const fs = require("fs");
const path = require("path");
const url = require("url");
const partialExtensions = [".js", ".yml", ""];
const lynxDocsPartialDirectory = path.join(__dirname, "../../_partials");
const parseYaml = require("../../parse-yaml");
const partials = require("./index");
const types = require("../../../types");

function calculateSearchDirectories(templatePath) {
  let cwd = process.cwd();
  let relative = path.relative(cwd, templatePath);
  let dirnames = path.dirname(relative).split(path.sep);

  let searchPaths = dirnames.reduce((acc, segment, index) => {
    acc.push(path.resolve(cwd, dirnames.slice(0, index).join(path.sep), segment, exports.partialDirectory));
    return acc;
  }, []).reverse(); //closest paths first
  let cwdPartialDir = path.resolve(cwd, exports.partialDirectory);
  if (!searchPaths.includes(cwdPartialDir)) searchPaths.push(cwdPartialDir);
  searchPaths.push(lynxDocsPartialDirectory);
  return searchPaths;
}

function scanDirectoryForPartial(directory, partialName) {
  if (!fs.existsSync(directory)) return null;
  if (!fs.statSync(directory).isDirectory()) return null;

  return fs.readdirSync(directory).find(filename => {
    return partialExtensions.some(ext => {
      return partialName === path.basename(filename, ext) &&
        ext === path.extname(filename);
    });
  }) || null; //normalize failure to return null. Without would be undefined
}

function convertJsPartialToFunction(partialFile) {
  delete require.cache[require.resolve(partialFile)];
  let partialFn = require(partialFile);
  return (parameters) => {
    let partial = partialFn(parameters);
    return partials.process(partial, parameters);
  };
}

function convertYamlPartialToFunction(partialFile) {
  let contents = fs.readFileSync(partialFile);
  let partial = parseYaml(contents);
  return (parameters) => partials.process(partial, parameters);
}

function resolvePartial(partialUrl) { //some/path/to/templat.lynx.yml?partial=name
  if (!types.isString(partialUrl)) throw Error("partialUrl must be a string");
  let parsed = url.parse(partialUrl, true);
  if (!parsed.query || !parsed.pathname || !parsed.query.partial) throw Error("Invalid partial value. The partial format is expected to be the absolute path to the the template file with a query string for the partial name to resolve (e.g. '/full/path/to/template.lynx.yml?partial=partialName').");

  var directories = exports.calculateSearchDirectories(path.resolve(parsed.pathname));
  var partialFile = directories.reduce((acc, directory) => {
    if (acc) return acc; //partial already resolved, just move along
    let fileName = exports.scanDirectoryForPartial(directory, parsed.query.partial);
    return !!fileName ? path.join(directory, fileName) : acc;
  }, null);

  if (!partialFile) throw Error("Unable to find partial '" + parsed.query.partial + "'. The following directories where scanned. \n" + directories.join("\n"));
  if (path.extname(partialFile) === ".js") return exports.convertJsPartialToFunction(partialFile);
  else return exports.convertYamlPartialToFunction(partialFile);
}

exports.resolve = resolvePartial;
exports.calculateSearchDirectories = calculateSearchDirectories;
exports.scanDirectoryForPartial = scanDirectoryForPartial;
exports.convertJsPartialToFunction = convertJsPartialToFunction;
exports.convertYamlPartialToFunction = convertYamlPartialToFunction;
exports.partialDirectory = "_partials";
exports.lynxDocsPartialDirectory = lynxDocsPartialDirectory;
