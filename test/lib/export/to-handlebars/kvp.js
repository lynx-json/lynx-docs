"use strict";
/*jshint expr:true */
var should = require("chai").should();
var kvpToHandlebars = require("../../../../src/lib/export/to-handlebars/kvp");

function runTest(test) {
  var actual = kvpToHandlebars({ key: test.key, value: test.value });
  actual.should.equal(test.expected);
}

var tests = [{
    key: undefined,
    value: "String",
    expected: '"String"',
    should: "a string value should export a JSON string"
  },
  {
    key: "key",
    value: "String",
    expected: '"key":"String"',
    should: "a kvp with a string value should export a JSON string kvp"
  },
  {
    key: undefined,
    value: 42,
    expected: "42",
    should: "a number value should export a JSON number"
  },
  {
    key: "key",
    value: 42,
    expected: '"key":42',
    should: "a kvp with a number value should export a JSON number kvp"
  },
  {
    key: undefined,
    value: {
      name: "String"
    },
    expected: '{"name":"String" }',
    should: "an object value should export a JSON object"
  },
  {
    key: "key",
    value: {
      name: "String"
    },
    expected: '"key":{"name":"String" }',
    should: "a kvp with an object value should export a JSON object kvp"
  },
  {
    key: undefined,
    value: ["String", "String"],
    expected: '["String","String"]',
    should: "an array value should export a JSON array"
  },
  {
    key: "key",
    value: ["String", "String"],
    expected: '"key":["String","String"]',
    should: "a kvp with an array value should export a JSON array kvp"
  },
  {
    key: "name<",
    value: null,
    expected: '"name":{{#if name}}"{{name}}"{{else}}null{{/if}}',
    should: "a kvp with a single value template should export a kvp with a value template and a null fallback value"
  },
  {
    key: "name<",
    value: "default",
    expected: '"name":{{#if name}}"{{name}}"{{else}}"default"{{/if}}',
    should: "a kvp with a single value template should export a kvp with a value template and a default value"
  },
  {
    key: "name=",
    value: null,
    expected: '"name":{{#if name}}{{name}}{{else}}null{{/if}}',
    should: "a kvp with a single value template should export a kvp with a value template and a null fallback value"
  },
  {
    key: "name=",
    value: "default",
    expected: '"name":{{#if name}}{{name}}{{else}}"default"{{/if}}',
    should: "a kvp with a single value template should export a kvp with a value template and a default value"
  },
  {
    key: "name=",
    value: 42,
    expected: '"name":{{#if name}}{{name}}{{else}}42{{/if}}',
    should: "a kvp with a single value template should export a kvp with a value template and a default value"
  },
  {
    key: undefined,
    value: {
      "name<": "default"
    },
    expected: '{"name":{{#if name}}"{{name}}"{{else}}"default"{{/if}} }',
    should: "a nested kvp with a single value template should export a kvp with a value template and a default value"
  },
  {
    key: undefined,
    value: {
      parent: {
        "name<": "default"
      }
    },
    expected: '{"parent":{"name":{{#if name}}"{{name}}"{{else}}"default"{{/if}} } }',
    should: "a deeply nested kvp with a single value template should export a kvp with a value template and a default value"
  },
  {
    key: "key#",
    value: {
      greeting: "Hi"
    },
    expected: '"key":{{#with key}}{"greeting":"Hi" }{{/with}}{{#unless key}}null{{/unless}}',
    should: "a kvp with a single object template should export a kvp with an object value template and a null fallback value"
  },
  {
    key: "key#",
    value: {
      "greeting<": "Hi"
    },
    expected: '"key":{{#with key}}{"greeting":{{#if greeting}}"{{greeting}}"{{else}}"Hi"{{/if}} }{{/with}}{{#unless key}}null{{/unless}}',
    should: "a kvp with a single object template with a single value template should export correctly"
  },
  {
    key: "key#",
    value: {
      "greeting<": null,
      "greeting<alternateGreeting": null
    },
    expected: '"key":{{#with key}}{"greeting":{{#if greeting}}"{{greeting}}"{{/if}}{{#if alternateGreeting}}"{{alternateGreeting}}"{{/if}} }{{/with}}{{#unless key}}null{{/unless}}',
    should: "a kvp with a single object template with multiple value templates should export correctly without a value template fallback/default value"
  },
  {
    key: "key^",
    value: {
      greeting: "Hi"
    },
    expected: '"key":{{#unless key}}{"greeting":"Hi" }{{/unless}}{{#with key}}null{{/with}}',
    should: "a kvp with a single negative object template should export a kvp with an object value template and a null fallback value"
  },
  {
    key: undefined,
    value: {
      "contact#isPrimary": {
        label: "Primary Contact"
      },
      "contact#isSecondary": {
        label: "Secondary Contact"
      }
    },
    expected: '{"contact":{{#with isPrimary}}{"label":"Primary Contact" }{{/with}}{{#with isSecondary}}{"label":"Secondary Contact" }{{/with}} }',
    should: "a kvp with a multiple object templates should export a kvp with multiple object templates"
  },
  {
    key: undefined,
    value: {
      "contact#isPrimary": {
        label: "Primary Contact"
      },
      "contact^isPrimary": {
        label: "Secondary Contact"
      }
    },
    expected: '{"contact":{{#with isPrimary}}{"label":"Primary Contact" }{{/with}}{{#unless isPrimary}}{"label":"Secondary Contact" }{{/unless}} }',
    should: "a kvp with a multiple object templates should export a kvp with multiple object templates"
  },
  {
    key: "items@",
    value: [
      { label: "Hi" }
    ],
    expected: '"items":[{{#each items}}{"label":"Hi" }{{#unless @last}},{{/unless}}{{/each}}]',
    should: "a kvp with a single array item template for an object value should export a kvp with an array item template for an object value"
  },
  {
    key: "items@",
    value: [
      "{{foo}}"
    ],
    expected: '"items":[{{#each items}}"{{foo}}"{{#unless @last}},{{/unless}}{{/each}}]',
    should: "a kvp with a single array item template for a string value should export a kvp with an array item template for a string value"
  }
];

describe("when exporting YAML to Handlebars", function () {
  tests.forEach(function (test) {
    it(test.should, function () {
      runTest(test);
    });
  });
});
