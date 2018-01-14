## quick-model

It provides serialization and deserialization using a defined data model. That's it.

## What is it for?
Mapping data from A to B.

E.g. your database query returns snake\_cased keys and embedded relationships but you want to send it to the client with camelCase keys and sideloaded relationships. quick-model can do that.  

Another usecase is a client sends data to your server in a client-friendly format and you need to 'deserialize' it into yet another format and insert it into some 3rd party database like a SalesForce table with a _wacky_ schema.

## Quick install:
```bash
npm install quick-model
```

## Quick model setup:
```js
const { 
  Model,
  Transforms
} = require('quick-model');

const {
  attr,
  one
} = Model;

const { 
  stringTransform
} = Transforms;

const personModel = new Model({
  name: attr(stringTransform)
});

const bookModel = new Model({
  title: attr(stringTransform),

  author: one(personModel)
});
```

## Quick serializer setup:
Imagine your database query returns an object _(continuing the example above)_ :
```js
const book = await db.books.findByTitle('foundation');
console.log(book);
// {
//   book_title: 'Foundation',
//   book_author: { 
//     full_name: 'Isaac Asimov'
//   }
// }
```
Notice the differences between db result and defined model.  
database **->** model  
`book_title` -> `title`  
`book_author` -> `author`  
`full_name` -> `name`  

This is where quick-model shines. Let us make a quick serializer!
```js
const { Serializer } = require('quick-model');

const personSerializer = new Serializer({
  model: personModel,

  keyForNonSerializedAttribute(attribute) {
    const { name } = attribute;

    // attribute.name is the key you defined when creating an attr() in your model.
    if (name === 'name') {
      return 'full_name';
    }

    // default behavior
    return name;
  }
});

const bookSerializer = new Serializer({
  model: bookModel,

  serializers: {
    author: personSerializer
  },

  keyForNonSerializedAttribute(attribute) {
    const { name } = attribute;

    return `book_${name}`;
  },
  
  keyForNonSerializedRelationship(relationship) {
    const { name } = relationship;
    
    if (name === 'author') {
      return 'book_author';
    }
    
    return name;
  }
});
```
Now you can call `bookSerializer.serialize(dataFromDatabase)`.  
It will properly extract the fields from the raw data and , by default, return an object that resembles how the model was defined:
```js
bookSerializer.serialize({
  book_title: 'Foundation',
  book_author: { 
    full_name: 'Isaac Asimov'
  }
});
// returns:
{
  title: 'Foundation',
  author: {
    name: 'Isaac Asimov'
  }
}
```
This is a simple example. But you can model some really unfriendly data and serialize it into something friendly :)

Full docs coming as soon...

Some ideas I'd personally like to explore _(or see explored)_ in future:
- Building a JSON API Serializer
- Building an XML Serializer


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
