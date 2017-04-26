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
  }
];

tests.suite = "mixed content (static and dynamic)";

module.exports = tests;
