```YAML
>main:
  spec.visibility: hidden
```

```YAML
>lynx:
  spec.hints~: [ http://uncategorized/main, section ]
  ~*:
```

```YAML
>lynx:
  spec:
    ~spec.*:
  value:
    ~*:
```
