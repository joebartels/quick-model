### TODO:
- [ ] implement primaryKey in model and write tests!
- [ ] deepAssign when overwriting transform's deserializer, serializer, and validator objects. I.e. don't overwrite entire object, just merge the defined properties
```
deepAssign({ serializer: { foo: bar } }, { serializer: { baz: 'boo' } })
// returns:
{ serializer: {
    foo: 'bar',
    baz: 'boo'
  }
}
```

- [x] serializer.serialize/deserialize should accept a hash of 3rd party serializers in the event of embedded relationships. So that serializing an embedded relationship can use the correct serializer.

- [ ] add a Validator class
- [ ] validator.validate should accept a hash of validators so that validating embedded relationships can use the correct validator
- [ ] research a good format for return value of validate() (possibly an array of error objects)
