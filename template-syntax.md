# Lynx Template Syntax

Lynx templates are authored using YAML. For details see [http://yaml.org/](http://yaml.org/).

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

Static content scenarios
- [Text Value](#dynamic-text-value)
- [Object Value](#dynamic-object-value)
- [Array Value](#dynamic-array-value)

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
The key in the template is "name" and the key in the data is "username".

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
name: "{{firstName}} {{lastName}}"
```

Data:
```yaml
firstName: Chevy
lastName: Chase
```

Result:
```yaml
name: "Chevy Chase"
```

#### Binding literals
The "<" binding token encloses the bound value in quotes. The "=" binding token binds the value as a literal (not quoted).

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
You may specify a default value in the template. If the data being bound doesn't contain a matching key to bind, then the default value is used. If no default is specified, then it is assumed to be the literal null.

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
user#:
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

#### Output different values based on presence or absence of object
When binding to an object in data, you can change the binding context to the object being bound.

Template:
```yaml
user:
  value#user:
    firstName<: Chevy
    middleName<:
    lastName<: Silverado
  value^user:
    message: User does not exist
```

Data:
```yaml
null
```

Result:
```yaml
user:
  value:
    message: User does not exist
```

### <a name="dynamic-array-value"></a>Dynamic Array

#### Simple array binding
When binding to an object in data, you can change the binding context to the object being bound.

Template:
```yaml
list:
  value@users:
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
list:
  value:
    - name: "User 1"
      age: "25"
    - name: "User 2"
      age: "30"
```
