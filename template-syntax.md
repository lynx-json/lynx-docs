# Lynx Template Syntax

Lynx templates are authored using YAML. For details see [http://yaml.org/](http://yaml.org/).

## File Naming Conventions
Template names are in the form of `<template>.lynx.yml` (e.g. default.lynx.yml). The <template> value must not contain a dot/period character (`.`).

Templates are combined with data files to create variants of a resource. A single combination of a template and a data files results in a named variant.

### Data Files
Data files that are bound to templates are discovered in two ways. As sibling files to the template file or as a sibling folder to the template file.

#### Sibling Data Files
Sibling data file names are in the form of `<template>.<variant>.data.(yml|json,js)` (e.g. default.invalid.data.yml)

#### Sibling Data Folders
Sibling data folder names are in the form of `<template>.data` (e.g. default.data). Each file within the folder is a data file used to create a variant. The names are in the form of `<variant>.(yml|json|js)` (e.g. invalid.yml).

## Document Properties
Lynx documents have special properties at the root of the document. These properties are `realm`, `base`, `context`, and `focus`. For details on the meaning and constraints for these values review the [lynx-json specification](http://lynx-json.org/specification/content/).

### Realm
Absolute `realm` example
``` yaml
realm: http://www.example.com/process/step/
restOfDocument:  
```

Relative `realm` example. Absolute value is calculated relative to the realm of the current template.
```yaml
realm: ./process/step/
restOfDocument:  
```

### Base
Base always needs to be an absolute URI
```yaml
base: http://www.example.com/
restOfDocument:
```

### Context
Absolute `context` example
``` yaml
context: http://www.example.com/employees/john.doe/
restOfDocument:  
```

Relative `context` example. Absolute value is calculated relative to the realm of the current template.
```yaml
context: ./employees/john.doe/
restOfDocument:  
```

### Focus
Focus is used to instruct the user agent which element to set focus to when the document is displayed.
```yaml
focus: nameOfContentToFocus
restOfDocument:
```

## Static Content
Static content is embedded in the template and does not change.

Static content scenarios
- [Text Value](#static-text-value)
- [Object Value](#static-object-value)
- [Array Value](#static-array-value)

### <a name="static-text-value"></a>Text Value
Simple text value example
```yaml
title: Fletch
```

Text values with special characters need to be quoted.
```yaml
message: "{{braces need quotes}}"
```

### <a name="static-object-value"></a>Object Value
Simple object value example
```yaml
golfer:
  name: Ty
  handicap: 0
caddy:
  name: Danny
```

### <a name="static-array-value"></a>Array Value
Array example with text values
```yaml
movies:
  - Fletch
  - Christmas Vacation
```

Array example with object values
```yaml
movies:
  - title: Fletch
    yearReleased: 1985
  - title: Christmas Vacation
    yearReleased: 1989
```

## Dynamic Content
Dynamic content changes based on the state of the application and therefore, must be provided by the server. Dynamic content is bound to the templates at runtime.

Dynamic content values
- [Text Value](#dynamic-text-value)
- [Object Value](#dynamic-object-value)
- [Array Value](#dynamic-array-value)
- [Dynamic with Partial](#dynamic-with-partial)

### <a name="dynamic-text-value"></a>Dynamic Text
#### Simple data binding example.
The key in the template is the same as the key in the data that is being bound.

Template:
```yaml
name<:
```

Data:
```yaml
name: Chevy Chase
```

Result:
```yaml
name: "Chevy Chase"
```

#### Key in template different than key in data
The key in the template is `name` and the key in the data is `username`.

Template:
```yaml
name<username:
```

Data:
```yaml
username: Chevy Chase
```

Result:
```yaml
name: "Chevy Chase"
```

#### Mixing static and dynamic
Template:
```yaml
name: "{{firstName}} {{lastName}} is a great actor"
```

Data:
```yaml
firstName: Chevy
lastName: Chase
```

Result:
```yaml
name: "Chevy Chase is a great actor"
```

#### Binding literals
The `<` binding token encloses the bound value in quotes. The `=` binding token binds the value as a literal (not quoted).

Template:
```yaml
height=:
quoted<height:
```

Data:
```yaml
height: 42
```

Result:
```yaml
height: 42
quoted: "42"
```

#### Default values
Default values can be provided in the template. If the data being bound doesn't contain a value to bind, then the default value is used. If no default is specified, it is assumed to be the literal null.

Template:
```yaml
firstName<: Chevy
middleName<:
lastName<: Silverado
```

Data:
```yaml
lastName: Chase
```

Result:
```yaml
firstName: Chevy
middleName: null
lastName: Chase
```

### <a name="dynamic-object-value"></a>Dynamic Object

#### Changing binding context
When binding to an object in data, you can change the binding context to the object being bound.

Template:
```yaml
"user#":
  firstName<: Chevy
  middleName<:
  lastName<: Silverado
```

Data:
```yaml
user:
  lastName: Chase
```

Result:
```yaml
user:
  firstName: Chevy
  middleName: null
  lastName: Chase
```

#### Output different values based on presence or absence of data
The `#` binding token indicates a section that is to bound when a value exists. The `^` binding token is the inverse of `#`. Therefore it is used to indicate a section that is to be bound when a value does not exist.

Template:
```yaml
"user#":
  firstName<: Chevy
  middleName<:
  lastName<: Silverado
user^:
  message: User does not exist
```

Data:
```yaml
null
```

Result:
```yaml
user:
  message: User does not exist
```

### <a name="dynamic-array-value"></a>Dynamic Array

#### Simple array binding
The `@` binding token is used to iterate over the values in a list.

Template:
```yaml
users@:
  - name<:
    age<:
```

Data:
```yaml
users:
  - name: User 1
    age: 25
  - name: User 2
    age: 30
```

Result:
```yaml
users:
  - name: "User 1"
    age: "25"
  - name: "User 2"
    age: "30"
```

### <a name="dynamic-with-partial"></a>Dynamic Content with Partial
In order to reference a partial for a value that is dynamic, you simply add the partial reference at the end of the key.

Template with dynamic object value that references a partial:
```yaml
"user#>group":
user^>group:
"foo#user>group":
for^user>group:
```

Data:
```yaml
user: null
```

Template with dynamic array value that references a partial:
```yaml
users@>list:
foo@users>list:
```

Data:
```yaml
users:
  - User One
  - User Two
```

## Scratch Area for Lynx YAML Template Rules
- Names should be resolved recursively. Will need rules for this.
- If engine does not support recursive resolution than data needs to be structured so the name evaluates in the current context

### Object template conditionals `#`
- Allowed values are true, false, null, undefined, string, or an object
- True and object result is rendering of template
- All other values are interpreted as falsey and result it template not being rendered
- If value is an object then it is set as the data context for the section

### List binding `@`
- Allowed values are arrays(lists), null, or undefined
- Each item in the list is set as the binding context for the item template
#### Potential future list binding rules. Support for mustache
- ??Each item must have a key named "xxxx" which evaluates to true only for last item in the list??

### Quoted `<` and unquoted `=` literal binding
- Allowed values are true, false, null, undefined, string, or number
