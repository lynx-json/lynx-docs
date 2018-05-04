var tests = [{
    description: "object with static and dynamic text values no data",
    template: { message: "Hello", "name<": "Default" },
    data: null,
    expected: { message: "Hello", name: "Default" }
  },
  {
    description: "object with static and dynamic text values with data",
    template: { message: "Hello", "name<": "Default" },
    data: { name: "Foo" },
    expected: { message: "Hello", name: "Foo" }
  },
  {
    description: "object with static text, dynamic sections and no data",
    template: { message: "Hello", "name": { "#name": { "first<": null, "last<": null }, "^name": "Anon" } },
    data: null,
    expected: { message: "Hello", name: "Anon" }
  },
  {
    description: "object with static text, dynamic sections and data",
    template: { message: "Hello", "name": { "#name": { "first<": null, "last<": null }, "^name": "Anon" } },
    data: { name: { first: "Foo", last: "Bar" } },
    expected: { message: "Hello", name: { first: "Foo", last: "Bar" } }
  },
  {
    description: "issue #42",
    template: { array: [{ "@arrayVar": { "#boolVar": { label: "Truthy" }, "^boolVar": { label: "Falsey" } } }] },
    data: { arrayVar: [{ boolVar: true }, { boolVar: false }, { boolVar: true }] },
    expected: { array: [{ label: "Truthy" }, { label: "Falsey" }, { label: "Truthy" }] }
  },
  {
    description: "different value spec pairs at root",
    template: { "#boolVar>text": "Truthy", "^boolVar>text": "Falsey" },
    options: { realm: { realm: "http://whatever" } },
    data: { boolVar: false },
    expected: { value: "Falsey", spec: { hints: ["text"] }, realm: "http://whatever" }
  },
  {
    description: "Issue #86. Verify with spec and flattening.",
    template: { ">content": { data: { realm: "http://somerealm/", ">text": "A message" } } },
    options: { realm: { realm: "http://whatever/" }, spec: { dir: "specs", url: "/specs/" }, flatten: true, output: "out" },
    onFile: (path, content) => {},
    data: null,
    expected: {
      realm: "http://whatever/",
      spec: "/specs/c78ed022973e01c91bd89c7ebb49eceb.lnxs",
      data: {
        realm: "http://somerealm/",
        spec: "/specs/c389beed6629fe88882175b4fa0bba4e.lnxs",
        value: "A message"
      }
    }
  },
  {
    description: "Issue #86. Content with data and sources.",
    template: {
      ">content": {
        type: "application/lynx+json",
        "data>text": null,
        sources: [{
          media: "http//example.com/some-media",
          type: "application/vnd.example.some-media+json",
          data: '{ "openingForm": { "name": "A form name", "args": ["{{one}}", "{{two}}"] } }'
        }]
      }
    },
    options: { realm: { realm: "http://example.com/" }, spec: { dir: "specs", url: "/specs/" }, flatten: true, output: "out" },
    onFile: (path, content) => {},
    data: {
      one: "I'm one",
      two: "I'm two"
    },
    expected: {
      realm: "http://example.com/",
      spec: "/specs/c78ed022973e01c91bd89c7ebb49eceb.lnxs",
      type: "application/lynx+json",
      data: {
        spec: "/specs/c389beed6629fe88882175b4fa0bba4e.lnxs",
        value: null
      },
      sources: [{
        media: "http//example.com/some-media",
        type: "application/vnd.example.some-media+json",
        data: `{ "openingForm": { "name": "A form name", "args": ["I'm one", "I'm two"] } }`
      }]
    }
  },
  {
    description: "Issue #83. Converting binding token '<' with empty string value. Default behavior",
    template: { "foo<": "No foo" },
    data: { foo: "" },
    expected: { foo: "No foo" }
  },
  {
    description: "Issue #83. Converting binding token '<' with empty string value. Options define handlebars.allowBindToZeroAndEmptyString",
    options: { handlebars: { allowBindToZeroAndEmptyString: true } },
    template: { "foo<": "No foo" },
    data: { foo: "" },
    expected: { foo: "" }
  },
  {
    description: "Issue #83. Converting binding token '<' with 0 number value. Default behavior",
    template: { "foo<": "No foo" },
    data: { foo: 0 },
    expected: { foo: "No foo" }
  },
  {
    description: "Issue #83. Converting binding token '<' with 0 number value. Options define handlebars.allowBindToZeroAndEmptyString",
    template: { "foo<": "No foo" },
    options: { handlebars: { allowBindToZeroAndEmptyString: true } },
    data: { foo: 0 },
    expected: { foo: "0" }
  },
  {
    description: "Issue #83. Converting binding token '<' with positive number value",
    template: { "foo<": "No foo" },
    data: { foo: 10 },
    expected: { foo: "10" }
  },
  {
    description: "Issue #83. Converting binding token '<' with negative number value. Default behavior",
    template: { "foo<": "No foo" },
    data: { foo: -10 },
    expected: { foo: "-10" }
  }
];

tests.suite = "mixed content (static and dynamic)";

module.exports = tests;
