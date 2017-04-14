"use strict";

const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const parseYaml = require("../../../src/lib/parse-yaml");
const templatesToHandlebars = require("../../../src/lib/export/to-handlebars").all;

var kvp = { key: "key", value: "value" };
var tests = [{
    realms: [{
      root: "/src/",
      realm: "/src/folder-one/",
      templates: [
        "/src/folder-one/default.lynx.yml"
      ]
    }],
    options: {},
    expected: [
      path.join("folder-one", "default.lynx.handlebars")
    ],
    description: "when realm with one template",
    should: "should emit one handlebars file with path relative to root"
  },
  {
    realms: [{
      root: "/src/",
      realm: "/src/folder-one/",
      templates: [
        "/src/folder-one/default.lynx.yml",
        "/src/folder-one/default.invalid.lynx.yml"
      ]
    }],
    options: {},
    expected: [
      path.join("folder-one", "default.lynx.handlebars"),
      path.join("folder-one", "default.invalid.lynx.handlebars")
    ],
    description: "when realm with multiple templates",
    should: "should emit handlebars files for each template with path relative to root"
  }
];

function runTest(test) {
  var count = 0;

  function onFile(path, content) {
    path.should.equal(test.expected[count]);
    count++;
  }

  templatesToHandlebars(test.realms, onFile, test.options);
  count.should.equal(test.expected.length);
}

describe("when exporting templates to handlebars", function () {
  beforeEach(function () {
    sinon.stub(fs, "readFileSync").returns(parseYaml(kvp));
  });

  afterEach(function () {
    fs.readFileSync.restore();
  });

  tests.forEach(test => {
    describe(test.description, function () {
      it(test.should, function () {
        runTest(test);
      });
    });
  });
});
