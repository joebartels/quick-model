const Model = require('./model');
const { assert, expect} = require('chai');

const { attr, one, many } = Model;

describe('Model', function() {
  const deserializer = { deserialize(x) { return x; } };
  const serializer = { serialize(x) { return x; } };
  const transform = { deserializer, serializer };

  describe('instance', function() {

    describe('new', function() {
      it('assigns properties to model instance', function() {
        let properties = { foo: 'bar' };

        expect(new Model(properties))
          .to.have.property('foo')
          .and.to.equal('bar');
      });

      it('assigns attributes to `_attributes`', function() {
        // create a new object for each model instantiation so that
        // attr transform is not shared
        let properties = () => { return { foo: attr(transform) } };

        expect(new Model(properties()))
          .to.have.property('foo');

        expect(new Model(properties()))
          .to.have.property('_attributes')
          .and.to.have.key('foo');
      });
    });

    describe('#serialize', function() {
      describe('attributes', function() {
        describe('with simple mapping between data and model', function() {
          let properties = {
            age: attr(transform),
            owns_dog: attr(transform),
            foo: 'malarkey',
            bar() { return 'malarkey'; }
          };

          let data = {
            age: 28,
            owns_dog: true,
            some: 'undefined model property'
          };

          let model = new Model(properties);

          it('serializes attributes', function() {
            expect(model.serialize(data))
            .to.deep.equal({
              age: 28,
              owns_dog: true
            });
          });
        });

        describe('with advanced mapping between data and model', function() {
          let properties = {
            age: attr(transform),

            ownsDog: attr(transform),

            // test accessing raw data values from custom keys
            keyForNonSerializedAttribute(attribute) {
              if (attribute.name === 'age') {
                return 'C__Age';
              } else if (attribute.name === 'ownsDog') {
                return 'C__Owns_Dog';
              }
              return attribute;
            },

            // test setting serialized values on custom keys
            keyForSerializedAttribute(attribute) {
              if (attribute.name === 'ownsDog') {
                return 'owns_dog';
              }

              return attribute.name;
            }
          };

          let rawData = {
            C__Age: 28,
            C__Owns_Dog: true,
            some: 'undefined model property'
          };

          let model = new Model(properties);

          it('serializes attributes', function() {
            expect(model.serialize(rawData))
            .to.deep.equal({
              age: 28,
              owns_dog: true
            });
          });
        });
      });

      describe('relationships', function() {

        describe('with ids only', function() {
          let personModel = new Model();
          let pageModel = new Model();

          let bookProperties = {
            author: one(personModel),
            pages: many(pageModel),
            foo: 'malarkey',
            bar() { return 'malarkey'; }
          };

          let data = {
            author: 128,
            pages: ['page_1', 'page_2', 'page_3'],
            some: 'undefined model property'
          };

          let book = new Model(bookProperties);

          it('serializes relationship ids', function() {
            expect(book.serialize(data))
            .to.deep.equal({
              author: 128,
              pages: ['page_1', 'page_2', 'page_3']
            });
          });
        });

        describe('with embedded relationships', function() {

          describe('with simple mapping between data and model', function() {
            let personModel = new Model({
              name: attr(transform)
            });
            let chapterModel = new Model({
              title: attr(transform),
              page: attr(transform)
            });
            let pageModel = new Model({
              chapter: one(chapterModel),
              text: attr(transform)
            });

            let bookModel = new Model({
              author: one(personModel),

              pages: many(pageModel),

              title: attr(transform)
            });

            let rawData = {
              title: 'Everything I want to do is illegal',
              author: {
                name: 'Joel Salatin'
              },
              pages: [
                {
                  chapter: { title: 'chapter 1', page: 1 },
                  text: 'a long time ago...'
                },
                {
                  chapter: { title: 'chapter 2', page: 2 },
                  text: 'more recently...'
                }
              ]
            };

            it('serializes relationship ids', function() {
              expect(bookModel.serialize(rawData))
              .to.deep.equal(rawData);
            });
          });
          describe('with advanced mapping between data and model', function() {
            let personModel = new Model({
              name: attr(transform),
            });

            let chapterModel = new Model({
              title: attr(transform),
              page: attr(transform),
            });

            let pageModel = new Model({
              chapter: one(chapterModel),
              text: attr(transform),

              keyForNonSerializedRelationship() {
                return 'BookChapter';
              },

              keyForSerializedRelationship() {
                return 'bookChapter';
              }
            });

            let bookModel = new Model({
              author: one(personModel),

              pages: many(pageModel),

              title: attr(transform),

              keyForNonSerializedRelationship(relationship) {
                if (relationship.name === 'pages') {
                  return 'BookPages';
                }
                if (relationship.name === 'author') {
                  return 'Author';
                }
              },

              keyForSerializedRelationship(relationship) {
                if (relationship.name === 'pages') {
                  return 'bookPages';
                }
                if (relationship.name === 'author') {
                  return 'bookAuthor';
                }
              }
            });

            let rawData = {
              title: 'Everything I want to do is illegal',
              Author: {
                name: 'Joel Salatin'
              },
              BookPages: [
                {
                  BookChapter: { title: 'chapter 1', page: 1 },
                  text: 'a long time ago...'
                },
                {
                  BookChapter: { title: 'chapter 2', page: 2 },
                  text: 'more recently...'
                }
              ]
            };

            it('serializes relationship ids', function() {
              expect(bookModel.serialize(rawData))
              .to.deep.equal({
                title: 'Everything I want to do is illegal',
                bookAuthor: {
                  name: 'Joel Salatin'
                },
                bookPages: [
                  {
                    bookChapter: { title: 'chapter 1', page: 1 },
                    text: 'a long time ago...'
                  },
                  {
                    bookChapter: { title: 'chapter 2', page: 2 },
                    text: 'more recently...'
                  }
                ]
              });
            });
          });
        });
      });
    });
  });

  describe('#eachAttribute', function() {
      let properties = {
        name: 'alice',
        age: attr(transform),
        height: attr(transform)
      };

      let model = new Model(properties);
      let keys = [];
      let vals = [];

      expect(model)
        .to.respondTo('eachAttribute');

      model.eachAttribute((attribute, attributeKey) => {
        keys.push(attributeKey);
        vals.push(attribute);
      });

      it('iterates though each attribute', function() {
        expect(keys).to.include.all.members(['age', 'height']);
        expect(keys).to.not.include('name');
        // TODO: not asserting attribute param of eachAttribute
      });
  });

  describe('#eachRelationship', function() {
      let carModel = new Model();
      let jobModel = new Model();

      let properties = {
        name: 'alice',
        age: attr(transform),
        car: one(carModel),
        job: one(jobModel),
      };

      let model = new Model(properties);
      let keys = [];
      let vals = [];

      expect(model)
        .to.respondTo('eachRelationship');

      model.eachRelationship((relationship, relationshipKey) => {
        keys.push(relationshipKey);
        vals.push(relationship);
      });

      it('iterates though each relationship', function() {
        expect(keys).to.include.all.members(['car', 'job']);
        expect(keys).to.not.include('name', 'age');
        // TODO: not asserting attribute param of eachAttribute
      });
  });

  describe('#serializeAttribute', function() {

    describe('keyForNonSerializedAttribute()', function() {
      it('accesses the correct attribute on raw data', function() {

        // this test should read from a custom key on non-serialized data
        let keyForNonSerializedAttribute = (attribute) => {
          if (attribute.name === 'accountNumber') {
            return 'ACCOUNT_NUM';
          }
        };

        let properties = {
          accountNumber: attr(transform),
          keyForNonSerializedAttribute
        };
        let rawData = {
          ACCOUNT_NUM: 123
        };

        let serialized = {};
        let model = new Model(properties);

        Model.serializeAttribute(
          model.accountNumber,
          model,
          rawData,
          serialized
        )

        // testing the serialized key matches key as defined on the model
        expect(serialized)
          .to.have.property('accountNumber');

        // testing the entire serialized object
        expect(serialized)
          .to.deep.equal({ accountNumber: 123 });

      });
    });

    describe('keyForSerializedAttribute()', function() {
      it('returns serialized value with custom defined key', function() {

        // this test should return serialized hash with an underscore key
        let keyForSerializedAttribute = (attribute) => {
          if (attribute.name === 'accountNumber') {
            return 'account_number';
          }
        };

        let properties = {
          accountNumber: attr(transform),
          keyForSerializedAttribute
        };

        // implicitely testing that the attribute will be accessed from the
        // raw data using the same key as defined on the model
        let rawData = {
          accountNumber: 123
        };

        let serialized = {};
        let model = new Model(properties);

        Model.serializeAttribute(
          model.accountNumber,
          model,
          rawData,
          serialized
        )

        // testing the serialized key matches the custom key
        expect(serialized)
          .to.have.property('account_number')

        // testing the entire serialized object
        expect(serialized)
          .to.deep.equal({ account_number: 123 });
      });
    });
  });


  describe('#serializeRelationship', function() {
    describe('keyForNonSerializedRelationship()', function() {
      it('accesses a `one` relationship on non-serialized data', function() {
        let keyForNonSerializedRelationship = (relationship) => {
          switch (relationship.name) {
            case 'author':
              return 'AUTHOR';
            default:
              return relationshipName;
          }
        };

        let personModel = new Model({ name: attr(transform) });
        let bookModel = new Model({
          author: one(personModel),
          keyForNonSerializedRelationship
        });

        let rawPerson = { name: 'bob' };
        let rawBook = { AUTHOR: rawPerson };
        let serialized = {};

        Model.serializeRelationship(
          bookModel.author,
          bookModel,
          rawBook,
          serialized
        )

        // testing the serialized key matches key as defined on the model
        expect(serialized)
          .to.have.property('author');

        // testing the entire serialized object
        expect(serialized)
          .to.deep.equal({ author: { name: 'bob' } });
      });

      it('accesses a `many` relationship on non-serialized data', function() {
        let keyForNonSerializedRelationship = (relationship) => {
          switch (relationship.name) {
            case 'posts':
              return 'Posts';
            default:
              return relationshipName;
          }
        };

        let postModel = new Model({ title: attr(transform) });
        let authorModel = new Model({
          posts: many(postModel),
          keyForNonSerializedRelationship
        });

        let rawPost = { title: 'top 10 beaches' };
        let rawAuthor = { Posts: [rawPost] };
        let serialized = {};

        Model.serializeRelationship(
          authorModel.posts,
          authorModel,
          rawAuthor,
          serialized
        )

        // testing the serialized key matches key as defined on the model
        expect(serialized)
          .to.have.property('posts');

        // testing the entire serialized object
        expect(serialized)
          .to.deep.equal({ posts: [{ title: 'top 10 beaches' }] });

      });
    });

    describe('keyForSerializedRelationship()', function() {
      it('returns serializes `one` relationship with custom defined key', function() {
        let keyForSerializedRelationship = (relationship) => {
          switch (relationship.name) {
            case 'author':
              return 'AUTHOR';
            default:
              return relationshipName;
          }
        };

        let personModel = new Model({ name: attr(transform) });
        let bookModel = new Model({
          author: one(personModel),
          keyForSerializedRelationship
        });

        let rawPerson = { name: 'bob' };
        let rawBook = { author: rawPerson };
        let serialized = {};

        Model.serializeRelationship(
          bookModel.author,
          bookModel,
          rawBook,
          serialized
        )

        expect(serialized)
          .to.have.property('AUTHOR')
          .and.to.deep.equal({ name: 'bob' })
      });

      it('returns serializes `many` relationship with custom defined key', function() {
        let keyForSerializedRelationship = (relationship) => {
          switch (relationship.name) {
            case 'posts':
              return 'POSTS';
            default:
              return relationshipName;
          }
        };

        let postModel = new Model({ title: attr(transform) });
        let authorModel = new Model({
          posts: many(postModel),
          keyForSerializedRelationship
        });

        let rawPost = { title: 'top 10 beaches' };
        let rawAuthor = { posts: [rawPost] };
        let serialized = {};

        Model.serializeRelationship(
          authorModel.posts,
          authorModel,
          rawAuthor,
          serialized
        )

        expect(serialized)
          .to.have.property('POSTS')
          .and.to.deep.equal([{ title: 'top 10 beaches' }]);
      });
    });
  });


  describe('#attr', function() {
    it('throws when missing serializer.serialize function', function() {
      expect(attr)
        .to.throw('attr() must be provided a `serializer.serialize` function');
    });

    it('throws when missing deserializer.deserialize function', function() {
      let fn = () => { attr({ serializer }) };

      expect(fn)
        .to.throw('attr() must be provided a `deserializer.deserialize` function');
    });

    it('returns frozen object', function() {
      expect(attr(transform))
        .to.be.sealed
        .and.to.not.be.extensible;
    });

    it('returns new transform object', function() {
      expect(attr(transform))
        .to.not.equal(transform)

      expect(attr(transform))
        .to.have.property('serializer')
        .and.to.respondTo('serialize')

      expect(attr(transform))
        .to.have.property('deserializer')
        .and.to.respondTo('deserialize')
    });

    it('merges options onto transform object', function() {
      let options = {
        foo: 'bar',
        deserializer: {
          deserialize() {}
        }
      };

      expect(attr(transform, options))
        .to.have.property('foo');

      expect(attr(transform, options))
        .to.have.property('deserializer')
        .and.to.have.property('deserialize')
        .and.to.equal(options.deserializer.deserialize)
    });
  });

  describe('#one', function() {
    let model = new Model();

    it('throws when not passed a Model instance', function() {
      expect(one)
        .to.throw('one(model) must be provided a `Model` instance');
    });

    it('returns frozen object', function() {
      expect(one(model))
        .to.be.sealed
        .and.to.not.be.extensible;
    });

    it('returns a transform object', function() {
      expect(one(model))
        .to.have.property('model');

      expect(one(model))
        .to.have.property('__relationship')
        .and.to.be.true;

      expect(one(model))
        .to.have.property('__kind')
        .and.to.equal('one');
    });

    it('merges options onto transform object', function() {
      let options = {
        foo: 'bar'
      };

      expect(one(model, options))
        .to.have.property('foo');
    });
  });

  describe('#many', function() {
    let model = new Model();

    it('throws when not passed a Model instance', function() {
      expect(many)
        .to.throw('many(model) must be provided a `Model` instance');
    });

    it('returns frozen object', function() {
      expect(many(model))
        .to.be.sealed
        .and.to.not.be.extensible;
    });

    it('returns a transform object', function() {
      expect(many(model))
        .to.have.property('model');

      expect(many(model))
        .to.have.property('__relationship')
        .and.to.be.true;

      expect(many(model))
        .to.have.property('__kind')
        .and.to.equal('many');
    });

    it('merges options onto transform object', function() {
      let options = {
        foo: 'bar'
      };

      expect(many(model, options))
        .to.have.property('foo');
    });
  });

});
