"use strict";

const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const variantsToLynx = require("../../../src/lib/export/variants-to-lynx").all;

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
    template: "foo: Should be \"escaped\"",
    expected: [{
      realm: "/src/folder-one/",
      foo: "Should be \"escaped\""
    }],
    description: "when string contains characters that should be escaped",
    should: "should have content that contains escaped characters"
  }, {
    realms: [{
      root: "/src/",
      realm: "/src/folder-one/",
      variants: [{
        template: "/src/folder-one/default.lynx.yml",
        name: "default"
      }]
    }],
    options: {},
    template: "foo: Should not be escaped",
    expected: [{
      realm: "/src/folder-one/",
      foo: "Should not be escaped"
    }],
    description: "when string does not contain characters that should be escaped",
    should: "should have content that does not contain escaped characters"
  }
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  var count = 0;

  function onFile(path, content) {
    if (test.files) path.should.equal(test.files[count]);
    if (test.expected) {
      let parsed = JSON.parse(content);
      expect(parsed).to.deep.equal(test.expected[count]);
    }

    count++;
  }

  variantsToLynx(test.realms, onFile, test.options);
}

describe("when exporting templates to lynx", function () {
  getTests().forEach(test => {
    describe(test.description, function () {
      beforeEach(function () {
        var stub;
        test.realms.forEach(realm => {
          realm.variants.forEach(variant => {
            if (typeof variant.template === "string") {
              stub = stub || sinon.stub(fs, "readFileSync");
              stub.withArgs(variant.template)
                .returns(test.template || "foo: Hello World!");
            }
          });
        });
      });

      afterEach(function () {
        if (fs.readFileSync.restore) fs.readFileSync.restore();
      });

      it(test.should, function () {
        runTest(test);
      });
    });
  });
});
