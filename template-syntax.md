# Lynx Template Syntax

Lynx templates are authored using YAML. For details see [http://yaml.org/](http://yaml.org/).

## Static Content
Static content is embedded in the template and does not change.

Here are the static content scenarios
- [Text Value](#static-text-value)
- [Object Value](#static-object-value)
- [Array Value](#static-array-value)

### <a name="static-text-value"></a>Text Value
Simple text value example
```
title: Fletch
```

Text values with special characters need to be quoted.
```
message: "{{braces need quotes}}"
```

### <a name="static-object-value"></a>Object Value
Simple object value example
```
golfer:
  name: Ty
  handicap: 0
caddy:
  name: Danny
```

### <a name="static-array-value"></a>Array Value
Array example with text values
```
movies:
  - Fletch
  - Christmas Vacation
```

Array example with object values
```
movies:
  - title: Fletch
    yearReleased: 1985
  - title: Christmas Vacation
    yearReleased: 1989
```

## Dynamic Content
Dynamic content changes based on the state of the application and therefore, must be provided by the server. Dynamic content is bound to the templates at runtime.

### <a name="dynamic-text-value"></a>Dynamic Text
#### Simple data binding example.
The key in the template is the same as the key in the data that is being bound.

Template:
```
name<:
```

Data:
```
name: Chevy Chase
```

Result:
```
name: "Chevy Chase"
```

#### Key in template different than key in data
The key in the template is "name" and the key in the data is "username".

Template:
```
name<username:
```

Data:
```
username: Chevy Chase
```

Result:
```
name: "Chevy Chase"
```

#### Mixing static and dynamic
Template:
```
name: "{{firstName}} {{lastName}}"
```

Data:
```
firstName: Chevy
lastName: Chase
```

Result:
```
name: "Chevy Chase"
```
