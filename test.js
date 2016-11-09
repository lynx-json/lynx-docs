const lynxDocs = require("./src/");

var tests = [
  {
    key: undefined,
    value: "String",
    expected: "String"
  },
  {
    key: "key",
    value: "String",
    expected: '"key":"String"'
  },
  {
    key: undefined,
    value: 42,
    expected: "42"
  },
  {
    key: "key",
    value: 42,
    expected: '"key":42'
  },
  {
    key: undefined,
    value: {
      name: "String"
    },
    expected: '{"name":"String" }'
  },
  {
    key: "key",
    value: {
      name: "String"
    },
    expected: '"key":{"name":"String" }'
  },
  {
    key: undefined,
    value: [ "String", "String" ],
    expected: '["String","String"]'
  },
  {
    key: "key",
    value: [ "String", "String" ],
    expected: '"key":["String","String"]'
  },
  {
    key: "name<",
    value: null,
    expected: '"name":{{#if name}}"{{name}}"{{else}}null{{/if}}'
  },
  {
    key: "name<",
    value: "default",
    expected: '"name":{{#if name}}"{{name}}"{{else}}"default"{{/if}}'
  },
  {
    key: undefined,
    value: {
      "name<": "default"
    },
    expected: '{"name":{{#if name}}"{{name}}"{{else}}"default"{{/if}} }'
  },
  {
    key: undefined,
    value: {
      parent: {
        "name<": "default"
      }
    },
    expected: '{"parent":{"name":{{#if name}}"{{name}}"{{else}}"default"{{/if}} } }'
  },
  {
    key: "key#",
    value: {
      greeting: "Hi"
    },
    expected: '"key":{{#with key}}{"greeting":"Hi" }{{/with}}{{^with key}}null{{/with}}'
  },
  {
    key: "key#",
    value: {
      "greeting<": "Hi"
    },
    expected: '"key":{{#with key}}{"greeting":{{#if greeting}}"{{greeting}}"{{else}}"Hi"{{/if}} }{{/with}}{{^with key}}null{{/with}}'
  },
  {
    key: "key#",
    value: {
      "greeting<": null,
      "greeting<alternateGreeting": null
    },
    expected: '"key":{{#with key}}{"greeting":{{#if greeting}}"{{greeting}}"{{/if}}{{#if alternateGreeting}}"{{alternateGreeting}}"{{/if}} }{{/with}}{{^with key}}null{{/with}}'
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
    expected: '{"contact":{{#with isPrimary}}{"label":"Primary Contact"}{{/with}}{{#with isSecondary}}{"label":"Secondary Contact"}{{/with}} }'
  },
  {
    key: "items@",
    value: [
      { label: "Hi" }
    ],
    expected: '"items":[{{#each items}}{"label":"Hi"}{{#unless @last}},{{/unless}}{{/each}}]'
  },
  {
    key: "items@",
    value: [
      "{{foo}}"
    ],
    expected: '"items":[{{#each items}}"Hi"{{#unless @last}},{{/unless}}{{/each}}]'
  }
];

var output = [];
lynxDocs.lib.export("handlebars", arrayKVTOfString, function (content) { output.push(content); });
console.log(output.join(""));
