"use strict";

var should = require("chai").should();
var kvpToHandlebars = require("../../../../src/lib/export/to-handlebars/kvp");

function runTest(test) {
  var actual = kvpToHandlebars({ key: test.key, value: test.value }, test.options || {});
  actual.should.equal(test.expected);
}

var tests = [{
    key: undefined,
    value: null,
    expected: 'null',
    should: "a null value should export a JSON null literal"
  },
  {
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
    key: undefined,
    value: true,
    expected: "true",
    should: "a true value should export a JSON true literal"
  },
  {
    key: "key",
    value: true,
    expected: '"key":true',
    should: "a kvp with a true value should export a JSON true kvp"
  },
  {
    key: undefined,
    value: false,
    expected: "false",
    should: "a false value should export a JSON false literal"
  },
  {
    key: "key",
    value: false,
    expected: '"key":false',
    should: "a kvp with a false value should export a JSON false kvp"
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
    expected: '"key":{{#key}}{"greeting":"Hi" }{{/key}}{{^key}}{"spec":{"hints":["container"]},"value":null}{{/key}}',
    should: "a kvp with a single object template should export a kvp with an object value template and a null fallback value"
  },
  {
    key: "key#",
    value: {
      "greeting<": "Hi"
    },
    expected: '"key":{{#key}}{"greeting":{{#if greeting}}"{{greeting}}"{{else}}"Hi"{{/if}} }{{/key}}{{^key}}{"spec":{"hints":["container"]},"value":null}{{/key}}',
    should: "a kvp with a single object template with a single value template should export correctly"
  },
  {
    key: "key#",
    value: {
      "greeting<": null,
      "greeting<alternateGreeting": null
    },
    expected: '"key":{{#key}}{"greeting":{{#if greeting}}"{{greeting}}"{{/if}}{{#if alternateGreeting}}"{{alternateGreeting}}"{{/if}} }{{/key}}{{^key}}{"spec":{"hints":["container"]},"value":null}{{/key}}',
    should: "a kvp with a single object template with multiple value templates should export correctly without a value template fallback/default value"
  },
  {
    key: "key^",
    value: {
      greeting: "Hi"
    },
    expected: '"key":{{^key}}{"greeting":"Hi" }{{/key}}{{#key}}{"spec":{"hints":["container"]},"value":null}{{/key}}',
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
    expected: '{"contact":{{#isPrimary}}{"label":"Primary Contact" }{{/isPrimary}}{{#isSecondary}}{"label":"Secondary Contact" }{{/isSecondary}} }',
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
    expected: '{"contact":{{#isPrimary}}{"label":"Primary Contact" }{{/isPrimary}}{{^isPrimary}}{"label":"Secondary Contact" }{{/isPrimary}} }',
    should: "a kvp with a multiple object templates should export a kvp with multiple object templates"
  },
  {
    key: undefined,
    value: {
      spec: {
        hints: ["container"]
      },
      "value#v1": {
        name: "One"
      }
    },
    expected: '{"spec":{"hints":["container"] },"value":{{#v1}}{"name":"One" }{{/v1}}{{^v1}}null{{/v1}} }',
    should: "a kvp with a dynamic value template with no inverse should export a kvp with null inverse"
  },
  {
    key: undefined,
    value: {
      spec: {
        hints: ["container"]
      },
      "value#v1": {
        name: "One"
      },
      "value^v1": {
        name: "None"
      }
    },
    expected: '{"spec":{"hints":["container"] },"value":{{#v1}}{"name":"One" }{{/v1}}{{^v1}}{"name":"None" }{{/v1}} }',
    should: "a kvp with a dynamic value template with explicit inverse should export a kvp with explicit inverse"
  },
  {
    key: undefined,
    value: {
      spec: {
        hints: ["container"]
      },
      "flag#": {
        name: "One"
      },
      "flag^": {
        name: "None"
      }
    },
    expected: '{"spec":{"hints":["container"] },"flag":{{#flag}}{"name":"One" }{{/flag}}{{^flag}}{"name":"None" }{{/flag}} }',
    should: "a kvp with a dynamic value template with explicit inverse and with no variable should export a kvp with explicit inverse"
  },
  {
    key: undefined,
    value: {
      spec: {
        hints: ["container"]
      },
      "value#v1": {
        name: "One"
      },
      "value#v2": {
        name: "Two"
      }
    },
    expected: '{"spec":{"hints":["container"] },"value":{{#v1}}{"name":"One" }{{/v1}}{{#v2}}{"name":"Two" }{{/v2}} }',
    should: "a kvp with a multiple value templates should export a kvp with values in blocks"
  },
  {
    key: "key#",
    value: {
      greeting: "Hi"
    },
    options: { hbStyleSections: true },
    expected: '"key":{{#with key}}{"greeting":"Hi" }{{/with}}{{#unless key}}{"spec":{"hints":["container"]},"value":null}{{/unless}}',
    should: "with handlebars style sections a kvp with a single object template should export a kvp with an object value template and a null fallback value"
  },
  {
    key: "key#",
    value: {
      "greeting<": "Hi"
    },
    options: { hbStyleSections: true },
    expected: '"key":{{#with key}}{"greeting":{{#if greeting}}"{{greeting}}"{{else}}"Hi"{{/if}} }{{/with}}{{#unless key}}{"spec":{"hints":["container"]},"value":null}{{/unless}}',
    should: "with handlebars style sections a kvp with a single object template with a single value template should export correctly"
  },
  {
    key: "key#",
    value: {
      "greeting<": null,
      "greeting<alternateGreeting": null
    },
    options: { hbStyleSections: true },
    expected: '"key":{{#with key}}{"greeting":{{#if greeting}}"{{greeting}}"{{/if}}{{#if alternateGreeting}}"{{alternateGreeting}}"{{/if}} }{{/with}}{{#unless key}}{"spec":{"hints":["container"]},"value":null}{{/unless}}',
    should: "with handlebars style sections a kvp with a single object template with multiple value templates should export correctly without a value template fallback/default value"
  },
  {
    key: "key^",
    value: {
      greeting: "Hi"
    },
    options: { hbStyleSections: true },
    expected: '"key":{{#unless key}}{"greeting":"Hi" }{{/unless}}{{#with key}}{"spec":{"hints":["container"]},"value":null}{{/with}}',
    should: "with handlebars style sections a kvp with a single negative object template should export a kvp with an object value template and a null fallback value"
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
    options: { hbStyleSections: true },
    expected: '{"contact":{{#with isPrimary}}{"label":"Primary Contact" }{{/with}}{{#with isSecondary}}{"label":"Secondary Contact" }{{/with}} }',
    should: "with handlebars style sections a kvp with a multiple object templates should export a kvp with multiple object templates"
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
    options: { hbStyleSections: true },
    expected: '{"contact":{{#with isPrimary}}{"label":"Primary Contact" }{{/with}}{{#unless isPrimary}}{"label":"Secondary Contact" }{{/unless}} }',
    should: "with handlebars style sections a kvp with a multiple object templates should export a kvp with multiple object templates"
  },
  {
    key: undefined,
    value: {
      spec: {
        hints: ["container"]
      },
      "value#v1": {
        name: "One"
      }
    },
    options: { hbStyleSections: true },
    expected: '{"spec":{"hints":["container"] },"value":{{#with v1}}{"name":"One" }{{/with}}{{#unless v1}}null{{/unless}} }',
    should: "with handlebars style sections a kvp with a dynamic value template with no inverse should export a kvp with null inverse"
  },
  {
    key: undefined,
    value: {
      spec: {
        hints: ["container"]
      },
      "value#v1": {
        name: "One"
      },
      "value^v1": {
        name: "None"
      }
    },
    options: { hbStyleSections: true },
    expected: '{"spec":{"hints":["container"] },"value":{{#with v1}}{"name":"One" }{{/with}}{{#unless v1}}{"name":"None" }{{/unless}} }',
    should: "with handlebars style sections a kvp with a dynamic value template with explicit inverse should export a kvp with explicit inverse"
  },
  {
    key: undefined,
    value: {
      spec: {
        hints: ["container"]
      },
      "flag#": {
        name: "One"
      },
      "flag^": {
        name: "None"
      }
    },
    options: { hbStyleSections: true },
    expected: '{"spec":{"hints":["container"] },"flag":{{#with flag}}{"name":"One" }{{/with}}{{#unless flag}}{"name":"None" }{{/unless}} }',
    should: "with handlebars style sections a kvp with a dynamic value template with explicit inverse and with no variable should export a kvp with explicit inverse"
  },
  {
    key: undefined,
    value: {
      spec: {
        hints: ["container"]
      },
      "value#v1": {
        name: "One"
      },
      "value#v2": {
        name: "Two"
      }
    },
    options: { hbStyleSections: true },
    expected: '{"spec":{"hints":["container"] },"value":{{#with v1}}{"name":"One" }{{/with}}{{#with v2}}{"name":"Two" }{{/with}} }',
    should: "with handlebars style sections a kvp with a multiple value templates should export a kvp with values in blocks"
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
