"use strict";

var util = require("util");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var flattenYaml = require("../../src/lib/export/flatten-yaml");

var tests = [
  {
    description: "a non-container value",
    should: "should not flatten specs",
    case: {
      expanded: {
        spec: { 
          hints: [ "text" ],
          children: []
        },
        value: "Hi"
      },
      flattened: {
        spec: { 
          hints: [ "text" ],
          children: []
        },
        value: "Hi"
      }
    }
  },
  {
    description: "an object value",
    should: "should flatten specs",
    case: {
      expanded: {
        spec: { 
          hints: [ "container" ], 
          children: [ 
            { name: "message" }
          ] 
        },
        value: {
          message: {
            spec: { 
              hints: [ "text" ] 
            },
            value: "Hi"
          }
        }
      },
      flattened: {
        spec: { 
          hints: [ "container" ], 
          children: [ 
            { 
              name: "message", 
              hints: [ "text" ] 
            } 
          ] 
        },
        value: {
          message: "Hi"
        }
      }
    }
  },
  {
    description: "a homogenous array value",
    should: "should flatten specs",
    case: {
      expanded: {
        spec: { 
          hints: [ "container" ], 
          children: [] 
        },
        value: [
          {
            spec: { hints: [ "text" ] },
            value: "One"
          },
          {
            spec: { hints: [ "text" ] },
            value: "Two"
          },
          {
            spec: { hints: [ "text" ] },
            value: "Three"
          }
        ]
      },
      flattened: {
        spec: { 
          hints: [ "container" ], 
          children: { 
            hints: [ "text" ] 
          } 
        },
        value: [ "One", "Two", "Three" ]
      }
    }
  },
  {
    description: "a heterogenous array value",
    should: "should not flatten specs",
    case: {
      expanded: {
        spec: { 
          hints: [ "container" ], 
          children: [] 
        },
        value: [
          {
            spec: { hints: [ "http://example.com/one", "text" ] },
            value: "One"
          },
          {
            spec: { hints: [ "http://example.com/two", "text" ] },
            value: "Two"
          },
          {
            spec: { hints: [ "http://example.com/three", "text" ] },
            value: "Three"
          }
        ]
      },
      flattened: {
        spec: { 
          hints: [ "container" ], 
          children: [] 
        },
        value: [
          {
            spec: { hints: [ "http://example.com/one", "text" ] },
            value: "One"
          },
          {
            spec: { hints: [ "http://example.com/two", "text" ] },
            value: "Two"
          },
          {
            spec: { hints: [ "http://example.com/three", "text" ] },
            value: "Three"
          }
        ]
      }
    }
  },
  {
    description: "a dynamic array value with one item template (quoted literal)",
    should: "should flatten specs",
    case: {
      expanded: {
        spec: { 
          hints: [ "container" ], 
          children: [] 
        },
        "value@greetings": [
          {
            spec: { 
              hints: [ "text" ],
              children: []
            },
            "value<message": "Hi"
          }
        ]
      },
      flattened: {
        spec: { 
          hints: [ "container" ], 
          children: {
            hints: [ "text" ]    
          }
        },
        "value@greetings": [
          {
            "<message": "Hi"
          }
        ]
      }
    }
  },
  {
    description: "a dynamic array value with one item template (object)",
    should: "should flatten specs",
    case: {
      expanded: {
        spec: { 
          hints: [ "container" ], 
          children: [] 
        },
        "value@greetings": [
          {
            spec: { 
              hints: [ "container" ] 
            },
            "value#message": "Hi"
          }
        ]
      },
      flattened: {
        spec: { 
          hints: [ "container" ], 
          children: {
            hints: [ "text" ]    
          }
        },
        "value@greetings": [
          {
            "<message": "Hi"
          }
        ]
      }
    }
  },
  {
    description: "a child with a dynamic quoted literal value",
    should: "should flatten specs",
    case: {
      expanded: {
        spec: {
          hints: [ "container" ],
          children: [ 
            { name: "message" } 
          ]
        },
        value: {
          message: {
            spec: { hints: [ "text" ] },
            "value<message": "Hi" 
          }
        }
      },
      flattened: {
        spec: {
          hints: [ "container" ],
          children: [ 
            { 
              name: "message", 
              hints: [ "text" ] 
            } 
          ]
        },
        value: {
          "message<": "Hi"
        }
      }
    }
  },
  {
    description: "a child with a dynamic literal value",
    should: "should flatten specs",
    case: {
      expanded: {
        spec: {
          hints: [ "container" ],
          children: [ 
            { name: "message" } 
          ]
        },
        value: {
          message: {
            spec: { hints: [ "text" ] },
            "value=message": "Hi" 
          }
        }
      },
      flattened: {
        spec: {
          hints: [ "container" ],
          children: [ 
            { 
              name: "message", 
              hints: [ "text" ] 
            } 
          ]
        },
        value: {
          "message=": "Hi"
        }
      }
    }
  },
  {
    description: "a child with a dynamic object value",
    should: "should flatten specs",
    case: {
      expanded: {
        spec: {
          hints: [ "container" ],
          children: [ 
            { name: "greeting" } 
          ]
        },
        value: {
          greeting: {
            spec: { 
              hints: [ "container" ], 
              children: [ { name: "message" } ] 
            },
            "value#greeting": {
              message: {
                spec: {
                  hints: [ "text" ],
                  children: []
                },
                "value<message": "Hi"
              }
            }
          }
        }
      },
      flattened: {
        spec: {
          hints: [ "container" ],
          children: [ 
            { 
              name: "greeting",
              hints: [ "container" ],
              children: [
                {
                  name: "message",
                  hints: [ "text" ],
                  children: []
                }
              ]
            } 
          ]
        },
        value: {
          "greeting#": {
            "message<": "Hi"
          }
        }
      }
    }
  },
  {
    description: "a child with a dynamic value/spec",
    should: "should not flatten specs",
    case: {
      expanded: {
        spec: {
          hints: [ "container" ],
          children: [ 
            { name: "message" } 
          ]
        },
        value: {
          "message#": {
            spec: { 
              "visibility<": "hidden", 
              hints: [ "text" ] 
            },
            "value<": "Hi"
          }
        }
      },
      flattened: {
        spec: {
          hints: [ "container" ],
          children: [ 
            { name: "message" } 
          ]
        },
        value: {
          "message#": {
            spec: { 
              "visibility<": "hidden", 
              hints: [ "text" ] 
            },
            "value<": "Hi"
          }
        }
      }
    }
  }
];

function runTest(test) {
  var kvp = { value: test.case.expanded };
  var actual = flattenYaml(kvp);
  actual.value.should.deep.equal(test.case.flattened);
}

// describe.only("when flattening YAML", function () {
//   tests.forEach(function (test) {
//     describe(test.description, function () {
//       it(test.should, function () {
//         runTest(test);
//       });
//     });
//   });
// });