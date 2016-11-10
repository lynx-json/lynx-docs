"use strict";

var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var expandYaml = require("../../src/lib/expand-yaml");

function runTest(test) {
  var actual = expandYaml(test.kvp);
  actual.should.deep.equal(test.expected);
}

function vsp(value, hints) {
  return { spec: { hints: hints || [] }, value: value };
}

var tests = [
  {
    kvp: { value: "Hi" },
    expected: { value: vsp("Hi") },
    description: "an expanded string value",
    should: "should expand correctly"
  },
  {
    kvp: { value: 42 },
    expected: { value: vsp(42) },
    description: "an expanded number value",
    should: "should expand correctly"
  },
  {
    kvp: { value: true },
    expected: { value: vsp(true) },
    description: "an expanded boolean value",
    should: "should expand correctly"
  },
  {
    kvp: { value: true },
    expected: { value: vsp(true) },
    description: "an expanded boolean value",
    should: "should expand correctly"
  },
  {
    kvp: { value: { greeting: "Hi" } },
    expected: { value: vsp({ greeting: vsp("Hi") }) },
    description: "an expanded object value",
    should: "should expand correctly"
  },
  {
    kvp: { value: [ "Hi", "Hello" ] },
    expected: { value: vsp([ vsp("Hi"), vsp("Hello") ]) },
    description: "an expanded array value",
    should: "should expand correctly"
  },
  {
    kvp: { value: { value: "Hi" } },
    expected: { value: vsp("Hi") },
    description: "an expanded partial node (value)",
    should: "should expand correctly"
  },
  {
    kvp: { value: { spec: { hints: [ "text" ] } } },
    expected: { value: vsp(null, ["text"]) },
    description: "an expanded partial node (spec)",
    should: "should expand correctly"
  },
  {
    kvp: { value: { spec: { hints: "text" } } },
    expected: { value: vsp(null, ["text"]) },
    description: "an expanded partial node (spec) with a hints string",
    should: "should expand correctly"
  },
  {
    kvp: { value: { "value@": { greeting: "Hi" } } },
    expected: { value: { 
      spec: { hints: [] },
      "value@": [ vsp({ greeting: vsp("Hi") }) ]
    }},
    description: "an expanded array template value without a variable",
    should: "should expand correctly"
  },
  {
    kvp: { value: { "value#": { greeting: "Hi" } } },
    expected: { value: {
      spec: { hints: [] },
      "value#": { greeting: vsp("Hi") } 
    } },
    description: "an expanded object template value without a variable",
    should: "should expand correctly"
  },
  {
    kvp: { value: { "value<": null } },
    expected: { value: { 
      spec: { hints: [] },
      "value<": null
    } },
    description: "an expanded simple template value without a variable",
    should: "should expand correctly"
  },
  {
    kvp: { value: { "value@dataVariable": { greeting: "Hi" } } },
    expected: { value: { 
      spec: { hints: [] },
      "value@dataVariable": [ vsp({ greeting: vsp("Hi") }) ]
    }},
    description: "an expanded array template value with a variable",
    should: "should expand correctly"
  },
  {
    kvp: { value: { "value#dataVariable": { greeting: "Hi" } } },
    expected: { value: {
      spec: { hints: [] },
      "value#dataVariable": { greeting: vsp("Hi") } 
    } },
    description: "an expanded object template value with a variable",
    should: "should expand correctly"
  },
  {
    kvp: { value: { "value<dataVariable": null } },
    expected: { value: { 
      spec: { hints: [] },
      "value<dataVariable": null
    } },
    description: "an expanded simple template value with a variable",
    should: "should expand correctly"
  },
  {
    kvp: { value: { "array@": "Hi" } },
    expected: { value: vsp({ "array@": vsp([ vsp("Hi") ]) }) },
    description: "an expanded array template kvp",
    should: "should expand correctly"
  },
  {
    kvp: { value: { "object#": { greeting: "Hi" } } },
    expected: { value: vsp({ "object#": vsp({ greeting: vsp("Hi") }) }) },
    description: "an expanded object template kvp",
    should: "should expand correctly"
  },
  {
    kvp: { value: { "foo<": null } },
    expected: { value: vsp({ "foo<": vsp(null) }) },
    description: "an expanded simple template kvp",
    should: "should expand correctly"
  }
];

describe("when expanding YAML", function () {
  tests.forEach(function (test) {
    describe(test.description, function () {
      it(test.should, function () {
        runTest(test);
      });
    });  
  });
});
