"use strict";

const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const parseYaml = require("../../../src/lib/parse-yaml");
const variantsToLynx = require("../../../src/lib/export/variants-to-lynx").all;

var inputValue = "Hello world!";
var tests = [{
    realms: [{
      root: "/src/",
      realm: "/src/folder-one/",
      variants: [{
        template: "/src/folder-one/default.lynx.yml",
        name: "default"
      }]
    }],
    options: {},
    files: [
      path.join("folder-one", "default.lnx")
    ],
    description: "when realm with one template variant",
    should: "should emit one lnx file with path relative to root"
  },
  {
    realms: [{
      root: "/src/",
      realm: "/src/folder-one/",
      variants: [{
          template: "/src/folder-one/default.lynx.yml",
          name: "default"
        },
        {
          template: "/src/folder-one/default.invalid.lynx.yml",
          name: "default-invalid"
        }
      ]
    }],
    options: {},
    files: [
      path.join("folder-one", "default.lnx"),
      path.join("folder-one", "default-invalid.lnx")
    ],
    description: "when realm with multiple template variants",
    should: "should emit lnx file for each template variant with path relative to root"
  },
  {
    realms: [{
      root: "/src/",
      realm: "/src/folder-one/",
      variants: [{
        content: "/src/folder-one/file.ext",
        name: "file.ext"
      }]
    }],
    options: {},
    files: [],
    description: "when realm with content variant",
    should: "should ignore content variant"
  },
  {
    realms: [{
      root: "/src/",
      realm: "/src/folder-one/",
      variants: [{
        template: "/src/folder-one/default.lynx.yml",
        name: "default"
      }]
    }],
    options: {},
    inputValue: 'Should be "escaped"',
    expected: [
      '{"spec":{"hints":[] },"value":"Should be \\"escaped\\"" }\n'
    ],
    description: "when string contains characters that should be escaped",
    should: "should have content that contains escaped characters"
  },
  {
    realms: [{
      root: "/src/",
      realm: "/src/folder-one/",
      variants: [{
        template: "/src/folder-one/default.lynx.yml",
        name: "default"
      }]
    }],
    options: {},
    expected: [
      '{"spec":{"hints":[] },"value":"Hello world!" }\n'
    ],
    description: "when string does not contain characters that should be escaped",
    should: "should have content that does not contain escaped characters"
  }
];

function runTest(test, stubs) {
  var count = 0;

  function onFile(path, content) {
    if(test.files) path.should.equal(test.files[count]);
    if(test.expected) content.should.equal(test.expected[count]);

    count++;
  }

  if(test.inputValue) stubs.readFileSync.returns(parseYaml(test.inputValue));

  variantsToLynx(test.realms, onFile, test.options);
}

describe("when exporting templates to lynx", function () {
  var dependencies = {};
  beforeEach(function () {
    dependencies.readFileSync = sinon.stub(fs, "readFileSync").returns(parseYaml(inputValue));
  });

  afterEach(function () {
    fs.readFileSync.restore();
  });

  tests.forEach(test => {
    describe(test.description, function () {
      it(test.should, function () {
        runTest(test, dependencies);
      });
    });
  });
});
