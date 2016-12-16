"use strict";
/*jshint expr:true */
const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const parseYaml = require("../../../src/lib/parse-yaml");
const variantsToLynx = require("../../../src/lib/export/variants-to-lynx").all;

var kvp = { key: "key", value: "value" };
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
    expected: [
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
    expected: [
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
    expected: [],
    description: "when realm with content variant",
    should: "should ignore content variant"
  }
];

function runTest(test) {
  var count = 0;

  function onFile(path, content) {
    path.should.equal(test.expected[count]);
    count++;
  }

  variantsToLynx(test.realms, onFile, test.options);
  count.should.equal(test.expected.length);
}

describe("when exporting templates to lynx", function () {
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
