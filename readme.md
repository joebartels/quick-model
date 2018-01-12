### TODO FOR 1.0:
- [x] implement primaryKey in model and write tests!
- [x] create a map-compact util & test
- [x] tests working for both directories: lib, utils
- [x] test for deserializeAttribute, keyForDeserializedRelationship
- [x] test for serialize
- [x] test for deserialize
- [ ] Cache for camelize and underscore
- [ ] tests for camelize and underscore
- move utils into files that represent the data type they operate on/with
  - [x] array
  - [x] string
  - [ ] function
  - [ ] object

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
- [ ] in each directory, combine tests for that directory and place in tests/ directory relative to where each test currently is
- [x] serializer.serialize/deserialize should accept a hash of 3rd party serializers in the event of embedded relationships. So that serializing an embedded relationship can use the correct serializer.
- [ ] accept hash of filter functions that can be applied to attributes or relationships.e.g. { filters: { password(x) { return x.replace('.+', '\*') } } }
- [ ] add a Validator class
- [ ] validator.validate should accept a hash of validators so that validating embedded relationships can use the correct validator
- [ ] research a good format for return value of validate() (possibly an array of error objects)
