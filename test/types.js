const chai = require("chai");
const expect = chai.expect;

var types = require("../src/types");
var anon = function () {};
var regex = /test/;
var date = new Date();

var allTests = {
  "Array": [{
      value: [],
      expected: true
    },
    {
      value: {},
      expected: false
    },
    {
      value: "string",
      expected: false
    },
    {
      value: date,
      expected: false
    },
    {
      value: regex,
      expected: false
    },
    {
      value: anon,
      expected: false
    },
    {
      value: true,
      expected: false
    },
    {
      value: 12,
      expected: false
    },
    {
      value: null,
      expected: false
    },
    {
      value: undefined,
      expected: false
    }
  ],
  "Object": [{
      value: [],
      expected: false
    },
    {
      value: {},
      expected: true
    },
    {
      value: "string",
      expected: false
    },
    {
      value: date,
      expected: false
    },
    {
      value: regex,
      expected: false
    },
    {
      value: anon,
      expected: false
    },
    {
      value: true,
      expected: false
    },
    {
      value: 12,
      expected: false
    },
    {
      value: null,
      expected: false
    },
    {
      value: undefined,
      expected: false
    }
  ],
  "String": [{
      value: [],
      expected: false
    },
    {
      value: {},
      expected: false
    },
    {
      value: "string",
      expected: true
    },
    {
      value: date,
      expected: false
    },
    {
      value: regex,
      expected: false
    },
    {
      value: anon,
      expected: false
    },
    {
      value: true,
      expected: false
    },
    {
      value: 12,
      expected: false
    },
    {
      value: null,
      expected: false
    },
    {
      value: undefined,
      expected: false
    }
  ],
  "Date": [{
      value: [],
      expected: false
    },
    {
      value: {},
      expected: false
    },
    {
      value: "string",
      expected: false
    },
    {
      value: date,
      expected: true
    },
    {
      value: regex,
      expected: false
    },
    {
      value: anon,
      expected: false
    },
    {
      value: true,
      expected: false
    },
    {
      value: 12,
      expected: false
    },
    {
      value: null,
      expected: false
    },
    {
      value: undefined,
      expected: false
    }
  ],
  "RegExp": [{
      value: [],
      expected: false
    },
    {
      value: {},
      expected: false
    },
    {
      value: "string",
      expected: false
    },
    {
      value: date,
      expected: false
    },
    {
      value: regex,
      expected: true
    },
    {
      value: anon,
      expected: false
    },
    {
      value: true,
      expected: false
    },
    {
      value: 12,
      expected: false
    },
    {
      value: null,
      expected: false
    },
    {
      value: undefined,
      expected: false
    }
  ],
  "Function": [{
      value: [],
      expected: false
    },
    {
      value: {},
      expected: false
    },
    {
      value: "string",
      expected: false
    },
    {
      value: date,
      expected: false
    },
    {
      value: regex,
      expected: false
    },
    {
      value: anon,
      expected: true
    },
    {
      value: true,
      expected: false
    },
    {
      value: 12,
      expected: false
    },
    {
      value: null,
      expected: false
    },
    {
      value: undefined,
      expected: false
    }
  ],
  "Boolean": [{
      value: [],
      expected: false
    },
    {
      value: {},
      expected: false
    },
    {
      value: "string",
      expected: false
    },
    {
      value: date,
      expected: false
    },
    {
      value: regex,
      expected: false
    },
    {
      value: anon,
      expected: false
    },
    {
      value: true,
      expected: true
    },
    {
      value: 12,
      expected: false
    },
    {
      value: null,
      expected: false
    },
    {
      value: undefined,
      expected: false
    }
  ],
  "Number": [{
      value: [],
      expected: false
    },
    {
      value: {},
      expected: false
    },
    {
      value: "string",
      expected: false
    },
    {
      value: date,
      expected: false
    },
    {
      value: regex,
      expected: false
    },
    {
      value: anon,
      expected: false
    },
    {
      value: true,
      expected: false
    },
    {
      value: 12,
      expected: true
    },
    {
      value: null,
      expected: false
    },
    {
      value: undefined,
      expected: false
    }
  ],
  "Null": [{
      value: [],
      expected: false
    },
    {
      value: {},
      expected: false
    },
    {
      value: "string",
      expected: false
    },
    {
      value: date,
      expected: false
    },
    {
      value: regex,
      expected: false
    },
    {
      value: anon,
      expected: false
    },
    {
      value: true,
      expected: false
    },
    {
      value: 12,
      expected: false
    },
    {
      value: null,
      expected: true
    },
    {
      value: undefined,
      expected: false
    }
  ],
  "Undefined": [{
      value: [],
      expected: false
    },
    {
      value: {},
      expected: false
    },
    {
      value: "string",
      expected: false
    },
    {
      value: date,
      expected: false
    },
    {
      value: regex,
      expected: false
    },
    {
      value: anon,
      expected: false
    },
    {
      value: true,
      expected: false
    },
    {
      value: 12,
      expected: false
    },
    {
      value: null,
      expected: false
    },
    {
      value: undefined,
      expected: true
    }
  ]
};

function getTests(tests) {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test, type) {
  var fn = types["is" + type];
  expect(fn(test.value)).to.equal(test.expected);
}

function getValueDescription(test) {
  if (test.value === anon) return "function";
  if (test.value === regex) return "regex";
  if (test.value === date) return "date";
  return JSON.stringify(test.value);
}

describe("types module", function () {
  Object.keys(allTests).map(key => {
    describe("when testing is" + key, function () {
      getTests(allTests[key]).forEach(function (test) {
        it("when value is " + getValueDescription(test) + ", result should be " + test.expected, function () {
          runTest(test, key);
        });
      });
    });
  });
});
