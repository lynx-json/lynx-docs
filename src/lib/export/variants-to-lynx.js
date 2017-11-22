"use strict";

const util = require("util");
const path = require("path");
const processTemplate = require("./process-template");
const toHandlebars = require("../json-templates/to-handlebars");
const templateData = require("./template-data");
const handlebars = require("handlebars");
const jsonLint = require("json-lint");
const types = require("../../types");
const log = require("logatim");
const validateLynxDocument = require("./lynx/validateDocument");

handlebars.Utils.escapeExpression = function (toEscape) {
  if (toEscape === null || toEscape === undefined) return "";
  if (!types.isString(toEscape)) return toEscape;

  let stringified = JSON.stringify(toEscape);
  return stringified.substr(1, stringified.length - 2);
};

function exportLynxDocuments(realms, createFile, options) {
  realms.forEach(realm => realm.variants
    .filter(variant => variant.template) //only variants that have template and data
    .forEach(function (variant) {
      let variantOptions = Object.assign({}, options, { realm: realm });
      let content = transformVariantToLynx(variant, variantOptions, createFile);
      let outputPath = path.join(path.relative(realm.root, path.dirname(variant.template)), variant.name + ".lnx");
      createFile(outputPath, content);
    }));
}

function transformVariantToLynx(variant, options, createFile) {
  try {
    let template = processTemplate(variant.template, options, createFile);
    let hbContent = toHandlebars(template, options) + "\n";
    log.blue("# Handlebars Content #").debug();
    log.debug(hbContent);

    let data = types.isString(variant.data) ? templateData(variant.data) : variant.data || null;
    let json = handlebars.compile(hbContent)(data);
    return lintContent(json, variant, options);
  } catch (err) {
    log.red(err).error();
    return createErrorDocument(variant, options, err);
  }
}

function lintContent(json, variant, options) {
  let linted = jsonLint(json);
  if (linted.error) {
    let error = new Error(`Failed JSON linting when data binding '${variant.data}'`);
    error.before = json.substr(0, linted.character - 1);
    error.after = json.substr(linted.character - 1);

    log.red.bold("! " + error.message + " !").error();
    log.green(error.before).red(error.after).error();

    return createErrorDocument(variant, options, error);
  }
  let result = validateLynxDocument(JSON.parse(json) /*, domainSpecificHints */ );
  if (!result.valid) {
    let error = new Error(`Failed Lynx linting when data binding '${variant.data}'`);
    error.lynxValidation = result.errors.map(e => {
      return `Key: ${e.key}\nJSON:\n${e.json}\nErrors:\n${e.errors.join("\n")}`;
    }).join("\n\n");
    return createErrorDocument(variant, options, error);
  }
  return json;
}

function createErrorDocument(variant, options, err) {

  let doc = {
    realm: options.realm.realm,
    spec: { hints: ["section", "container"], children: [{ name: "header" }, { name: "message" }], labeledBy: "label" },
    value: {
      header: {
        spec: { hints: ["header", "container"], children: [{ name: "label" }] },
        value: {
          label: {
            spec: { hints: ["label", "text"] },
            value: `Unable to export ${variant.template} to lynx format`
          }
        }
      }
    }
  };

  doc.value.message = createErrorDocumentSection("Error message", err.message);
  if (err.stack) {
    doc.value.stack = createErrorDocumentSection("Error stack", err.stack);
    doc.spec.children.push({ name: "stack" });
  }
  if (err.snippet) {
    doc.value.snippet = createErrorDocumentSection("YAML parse error details", `line ${err.parsedLine} near "${err.snippet}"`);
    doc.spec.children.push({ name: "snippet" });
  }
  if (err.before) {
    doc.value.before = createErrorDocumentSection("Content before JSON lint error", err.before);
    doc.spec.children.push({ name: "before" });
  }
  if (err.after) {
    doc.value.after = createErrorDocumentSection("Content after JSON lint error", err.after);
    doc.spec.children.push({ name: "after" });
  }
  if (err.lynxValidation) {
    doc.value.lynxValidation = createErrorDocumentSection("Lynx validation errors", err.lynxValidation);
    doc.spec.children.push({ name: "lynxValidation" });
  }
  return JSON.stringify(doc);
}

function createErrorDocumentSection(label, content) {
  return {
    spec: { hints: ["section", "container"], children: [{ name: "header" }, { name: "contents" }], labeledBy: "label" },
    header: {
      spec: { hints: ["header", "container"], children: [{ name: "label" }] },
      value: {
        label: {
          spec: { hints: ["label", "text"] },
          value: label
        }
      }
    },
    contents: {
      spec: { hints: ["text"] },
      value: content
    }
  };
}

exports.one = transformVariantToLynx;
exports.all = exportLynxDocuments;
