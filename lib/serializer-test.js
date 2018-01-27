const { expect} = require('chai');

const Serializer = require('./serializer');
const Model = require('./model');

const {
  attr,
  one,
  many,
  primaryKey
} = Model;

describe('Serializer', function() {
  describe('instance', function() {
    describe('#serialize', function() {
      describe('#serializeRelationship', function() {
        describe('using "only" specified relationships', function() {
          /**
            `serializer.serialize(data, { only: ['posts'] })`
            should only serialize specified attributes/relationships
            - returning only the serialized `posts` in this example:
          */
          const rawData = {
            author: { fullName: 'bob ross' },
            posts: [
              { id: 1, title: 'post 1' },
              { id: 2, title: 'post 2' }
            ]
          };

          const author = new Model({
            fullName: attr(mockTransform())
          });
          const post = new Model({
            id: primaryKey(mockTransform()),
            title: attr(mockTransform())
          });
          const book = new Model({
            author: one(author),
            posts: many(post)
          });

          const serializer = new Serializer({ model: book });

          it('serializes the "only" specified relationship', function() {
            expect(serializer.serialize(rawData, { only: ['posts'] }))
              .to.deep.equal({ posts: rawData.posts });
          });
        });

        describe('with embedded relationships', function() {
          describe('using defaultRelationshipSerializer()', function() {
            const rawData = {
              author: {
                fullName: 'bob ross',
                foo: 'bar'
              },
              posts: [
                { id: 1, title: 'post 1', foo: 'bar' },
                { id: 2, title: 'post 2', category:
                  { id: 'x', type: 'watercolor', foo: 'bar' }
                }
              ]
            };

            const author = new Model({
              fullName: attr(mockTransform())
            });
            const category = new Model({
              id: primaryKey(mockTransform()),
              type: attr(mockTransform())
            });
            const post = new Model({
              id: primaryKey(mockTransform()),
              title: attr(mockTransform()),
              category: one(category)
            });
            const book = new Model({
              author: one(author),
              posts: many(post)
            });

            const serializer = new Serializer({ model: book });

            it('serializes relationships as-is from raw data', function() {
              expect(serializer.serialize(rawData))
                .to.deep.equal(rawData)
            });
          });

          describe('with missing relationships', function() {
            const rawData = {
              mother: null,     // null `one` relationship
              friends: [null],  // null `many` relationship
              publisher: {},    // empty `one` relationship
              books: []         // empty `many` relationship
              // hometown:      // missing `one` relationship
              // cars:          // missing `many` relationship
            };

            const mother = new Model();
            const friend = new Model();
            const publisher = new Model({ name: attr(mockTransform()) });
            const book = new Model();
            const hometown = new Model();
            const car = new Model();

            const author = new Model({
              mother: one(mother),
              friends: many(friend),
              publisher: one(publisher),
              books: many(book),
              hometown: one(hometown),
              cars: many(car)
            });

            const motherSerializer = new Serializer({ model: mother });
            const friendSerializer = new Serializer({ model: friend });
            const publisherSerializer = new Serializer({ model: publisher });
            const bookSerializer = new Serializer({ model: book });
            const hometownSerializer = new Serializer({ model: hometown });
            const carSerializer = new Serializer({ model: car });
            const authorSerializer = new Serializer({
              model: author,
              serializers: {
                mother: motherSerializer,
                friends: friendSerializer,
                publisher: publisherSerializer,
                books: bookSerializer,
                hometown: hometownSerializer,
                cars: carSerializer
              }
            });

            it('serializes relationships as-is from raw data', function() {
              expect(authorSerializer.serialize(rawData))
                .to.deep.equal({
                  mother: null,
                  friends: [],
                  publisher: { name: null },
                  books: [],
                  hometown: null,
                  cars: []
                });
            });
          });

          describe('using provided relationship serializers', function() {
            const rawData = {
              author: {
                fullName: 'bob ross',
                foo: 'bar'
              },
              chapters: [
                { id: 1, title: 'chapter 1', foo: 'bar' },
                { id: 2, title: 'chapter 2', pages:
                  [{ id: 'page_1', text: 'hello', foo: 'bar' }]
                }
              ]
            };

            const author = new Model({
              fullName: attr(mockTransform())
            });
            const page = new Model({
              id: primaryKey(mockTransform()),
              text: attr(mockTransform())
            });
            const chapter = new Model({
              id: primaryKey(mockTransform()),
              title: attr(mockTransform()),
              pages: many(page)
            });
            const book = new Model({
              author: one(author),
              chapters: many(chapter)
            });

            const authorSerializer = new Serializer({ model: author });
            const pageSerializer = new Serializer({ model: page });
            const chapterSerializer = new Serializer({
              model: chapter,
              serializers: {
                pages: pageSerializer
              }
            });
            const bookSerializer = new Serializer({
              model: book,
              serializers: {
                author: authorSerializer,
                chapters: chapterSerializer
              }
            });

            it('serializes relationships as-is from raw data', function() {
              expect(bookSerializer.serialize(rawData))
                .to.deep.equal({
                  author: {
                    fullName: 'bob ross'
                  },
                  chapters: [
                    { id: 1, title: 'chapter 1', pages: [] },
                    { id: 2, title: 'chapter 2', pages:
                      [{ id: 'page_1', text: 'hello' }]
                    }
                  ]
                });
            });
          });
        });

        describe('with unaltered de/serialized keys', function() {
          const rawData = {
            author: 'user_1',
            posts: ['post_1', 'post_2'],
            foo: 'bar'
          };

          const model = new Model();
          const book = new Model({
            author: one(model),
            posts: many(model)
          });
          const serializer = new Serializer({ model: book });

          model.serialize = value => value;

          it('serializes one/many relationships from raw data', function() {
            expect(serializer.serialize(rawData))
              .to.deep.equal({
                author: 'user_1',
                posts: ['post_1', 'post_2']
              });
          });
        });

        describe('with custom de/serialized keys', function() {
          const serializedValues = [];
          const rawData = {
            __AUTHOR: 'user_1',
            __POSTS: ['post_1', 'post_2'],
            foo: 'non defined model property'
          };

          const model = new Model()

          const book = new Model({
            author: one(model),
            posts: many(model)
          });
          const serializer = new Serializer({
            model: book,
            keyForNonSerializedRelationship(relationship) {
              if (relationship.name === 'author') {
                return '__AUTHOR';
              } else if (relationship.name === 'posts') {
                return '__POSTS';
              }
            },

            keyForSerializedRelationship(relationship, value) {
              serializedValues.push(value);

              if (relationship.name === 'author') {
                return 'Author';
              } else if (relationship.name === 'posts') {
                return 'Posts';
              }
            }
          });

          it('serializes one/many relationships from raw data', function() {
            // 1. order matters
            expect(serializer.serialize(rawData))
              .to.deep.equal({
                Author: 'user_1',
                Posts: ['post_1', 'post_2']
              });

            // 2.
            expect(serializedValues)
              .to.deep.equal([
                'user_1',
                ['post_1', 'post_2']
              ]);
          });
        });
      });

      describe('#serializeAttribute', function() {
        describe('using "only" specified attributes', function() {
          /**
            `serializer.serialize(data, { only: ['fullName'] })`
            should only serialize specified attributes/relationships
            - returning only the serialized `fullName` in this example:
          */
          const rawData = {
            fullName: 'Roxane Gay',
            birthYear: 1974,
            zodiacSign: 'scorpio'
          };

          const feminist = new Model({
            fullName: attr(mockTransform()),
            birthYear: attr(mockTransform()),
            zodiacSign: attr(mockTransform())
          });

          const serializer = new Serializer({ model: feminist });

          it('serializes the "only" specified attributes', function() {
            expect(serializer.serialize(rawData, { only: ['fullName', 'birthYear'] }))
              .to.deep.equal({
                fullName: rawData.fullName,
                birthYear: rawData.birthYear
              });
          });
        });

        describe('with unaltered de/serialized keys', function() {
          const didSerialize = [];
          const name = 'bob ross';
          const rawData = { name };

          const transform = mockTransform();
          const model = new Model({ name: attr(transform) });
          const serializer = new Serializer({ model });

          transform.serializer.serialize = value => {
            didSerialize.push(value);
            return value;
          };

          it('serializes attributes from raw data', function() {
            // 1. order matters
            expect(serializer.serialize(rawData))
              .to.deep.equal({ name: name });

            // 2.
            expect(didSerialize)
              .to.include.all.members([name]);
          });
        });

        describe('with custom de/serialized keys', function() {
          const didSerialize = [];
          const fullName = 'bob ross';
          const rawData = { '__FULL_NAME': fullName };

          const transform = mockTransform();
          const model = new Model({ fullName: attr(transform) });
          const serializer = new Serializer({ model });

          serializer.keyForNonSerializedAttribute = attribute => {
            expect(attribute.name)
              .to.equal('fullName');

            expect(attribute)
              .to.have.property('serializer')
              .and.respondTo('serialize');

            return '__FULL_NAME';
          };

          serializer.keyForSerializedAttribute = (attribute, value) => {
            expect(attribute)
              .to.have.property('name')
              .and.to.equal('fullName');

            expect(attribute)
              .to.have.property('serializer')
              .and.respondTo('serialize');

            expect(value)
              .to.equal(fullName)

            return 'FullName';
          };

          transform.serializer.serialize = value => {
            didSerialize.push(value);
            return value;
          };

          it('serializes attributes from raw data using custom keys', function() {
            // 1. order matters
            expect(serializer.serialize(rawData))
              .to.deep.equal({ FullName: fullName });

            // 2.
            expect(didSerialize)
              .to.include.all.members([fullName]);
          });
        });
      });

    });

    describe('#deserialize', function() {
      describe('#deserializeRelationship', function() {
        describe('with embedded relationships', function() {
          describe('using defaultRelationshipSerializer()', function() {
            const rawData = {
              author: {
                fullName: 'bob ross',
                foo: 'bar'
              },
              posts: [
                { id: 1, title: 'post 1', foo: 'bar' },
                { id: 2, title: 'post 2', category:
                  { id: 'x', type: 'watercolor', foo: 'bar' }
                }
              ]
            };

            const author = new Model({
              fullName: attr(mockTransform())
            });
            const category = new Model({
              id: primaryKey(mockTransform()),
              type: attr(mockTransform())
            });
            const post = new Model({
              id: primaryKey(mockTransform()),
              title: attr(mockTransform()),
              category: one(category)
            });
            const book = new Model({
              author: one(author),
              posts: many(post)
            });

            const serializer = new Serializer({ model: book });

            it('deserializes relationships as-is from raw data', function() {
              expect(serializer.deserialize(rawData))
                .to.deep.equal(rawData)
            });
          });

          describe('with missing relationships', function() {
            const rawData = {
              mother: null,     // null `one` relationship
              friends: [null],  // null `many` relationship
              publisher: {},    // empty `one` relationship
              books: []         // empty `many` relationship
              // hometown:      // missing `one` relationship
              // cars:          // missing `many` relationship
            };

            const mother = new Model();
            const friend = new Model();
            const publisher = new Model({ name: attr(mockTransform()) });
            const book = new Model();
            const hometown = new Model();
            const car = new Model();

            const author = new Model({
              mother: one(mother),
              friends: many(friend),
              publisher: one(publisher),
              books: many(book),
              hometown: one(hometown),
              cars: many(car)
            });

            const motherSerializer = new Serializer({ model: mother });
            const friendSerializer = new Serializer({ model: friend });
            const publisherSerializer = new Serializer({ model: publisher });
            const bookSerializer = new Serializer({ model: book });
            const hometownSerializer = new Serializer({ model: hometown });
            const carSerializer = new Serializer({ model: car });
            const authorSerializer = new Serializer({
              model: author,
              serializers: {
                mother: motherSerializer,
                friends: friendSerializer,
                publisher: publisherSerializer,
                books: bookSerializer,
                hometown: hometownSerializer,
                cars: carSerializer
              }
            });

            it('deserializes relationships as-is from raw data', function() {
              expect(authorSerializer.deserialize(rawData))
                .to.deep.equal({
                  mother: null,
                  friends: [],
                  publisher: { name: null },
                  books: [],
                  hometown: null,
                  cars: []
                });
            });
          });

          describe('using provided relationship serializers', function() {
            const rawData = {
              author: {
                fullName: 'bob ross',
                foo: 'bar'
              },
              chapters: [
                { id: 1, title: 'chapter 1', foo: 'bar' },
                { id: 2, title: 'chapter 2', pages:
                  [{ id: 'page_1', text: 'hello', foo: 'bar' }]
                }
              ]
            };

            const author = new Model({
              fullName: attr(mockTransform())
            });
            const page = new Model({
              id: primaryKey(mockTransform()),
              text: attr(mockTransform())
            });
            const chapter = new Model({
              id: primaryKey(mockTransform()),
              title: attr(mockTransform()),
              pages: many(page)
            });
            const book = new Model({
              author: one(author),
              chapters: many(chapter)
            });

            const authorSerializer = new Serializer({ model: author });
            const pageSerializer = new Serializer({ model: page });
            const chapterSerializer = new Serializer({
              model: chapter,
              serializers: {
                pages: pageSerializer
              }
            });
            const bookSerializer = new Serializer({
              model: book,
              serializers: {
                author: authorSerializer,
                chapters: chapterSerializer
              }
            });

            it('deserializes relationships as-is from raw data', function() {
              expect(bookSerializer.deserialize(rawData))
                .to.deep.equal({
                  author: {
                    fullName: 'bob ross'
                  },
                  chapters: [
                    { id: 1, title: 'chapter 1', pages: [] },
                    { id: 2, title: 'chapter 2', pages:
                      [{ id: 'page_1', text: 'hello' }]
                    }
                  ]
                });
            });
          });
        });

        describe('with unaltered de/serialized keys', function() {
          const rawData = {
            author: 'user_1',
            posts: ['post_1', 'post_2'],
            foo: 'bar'
          };

          const model = new Model();
          const book = new Model({
            author: one(model),
            posts: many(model)
          });
          const serializer = new Serializer({ model: book });

          model.serialize = value => value;

          it('serializes one/many relationships from raw data', function() {
            expect(serializer.serialize(rawData))
              .to.deep.equal({
                author: 'user_1',
                posts: ['post_1', 'post_2']
              });
          });
        });

        describe('with custom de/serialized keys', function() {
          const serializedValues = [];
          const rawData = {
            __AUTHOR: 'user_1',
            __POSTS: ['post_1', 'post_2'],
            foo: 'non defined model property'
          };

          const model = new Model()

          const book = new Model({
            author: one(model),
            posts: many(model)
          });
          const serializer = new Serializer({
            model: book,
            keyForNonSerializedRelationship(relationship) {
              if (relationship.name === 'author') {
                return '__AUTHOR';
              } else if (relationship.name === 'posts') {
                return '__POSTS';
              }
            },

            keyForSerializedRelationship(relationship, value) {
              serializedValues.push(value);

              if (relationship.name === 'author') {
                return 'Author';
              } else if (relationship.name === 'posts') {
                return 'Posts';
              }
            }
          });

          it('serializes one/many relationships from raw data', function() {
            // 1. order matters
            expect(serializer.serialize(rawData))
              .to.deep.equal({
                Author: 'user_1',
                Posts: ['post_1', 'post_2']
              });

            // 2.
            expect(serializedValues)
              .to.deep.equal([
                'user_1',
                ['post_1', 'post_2']
              ]);
          });
        });
      });

      describe('#deserializeAttribute', function() {
        describe('with unaltered de/serialized keys', function() {
          const didDeserialize = [];
          const name = 'bob ross';
          const rawData = { name };

          const transform = mockTransform();
          const model = new Model({ name: attr(transform) });
          const serializer = new Serializer({ model });

          transform.deserializer.deserialize = value => {
            didDeserialize.push(value);
            return value;
          };

          it('deserializes attributes from raw data', function() {
            // 1. order matters
            expect(serializer.deserialize(rawData))
              .to.deep.equal({ name: name });

            // 2.
            expect(didDeserialize)
              .to.include.all.members([name]);
          });
        });

        describe('with custom de/serialized keys', function() {
          const didDeserialize = [];
          const fullName = 'bob ross';
          const rawData = { '__FULL_NAME': fullName };

          const transform = mockTransform();
          const model = new Model({ fullName: attr(transform) });
          const serializer = new Serializer({ model });

          serializer.keyForNonDeserializedAttribute = attribute => {
            expect(attribute.name)
              .to.equal('fullName');

            expect(attribute)
              .to.have.property('deserializer')
              .and.respondTo('deserialize');

            return '__FULL_NAME';
          };

          serializer.keyForDeserializedAttribute = (attribute, value) => {
            expect(attribute)
              .to.have.property('name')
              .and.to.equal('fullName');

            expect(attribute)
              .to.have.property('deserializer')
              .and.respondTo('deserialize');

            expect(value)
              .to.equal(fullName)

            return 'FullName';
          };

          transform.deserializer.deserialize = value => {
            didDeserialize.push(value);
            return value;
          };

          it('deserializes attributes from raw data using custom keys', function() {
            // 1. order matters
            expect(serializer.deserialize(rawData))
              .to.deep.equal({ FullName: fullName });

            // 2.
            expect(didDeserialize)
              .to.include.all.members([fullName]);
          });
        });
      });
    });

    describe('#keyForNonDeserializedAttribute', function() {
      const serializer = new Serializer({
        model: new Model({
          name: attr(mockTransform())
        })
      });
      const { model } = serializer;

      it('returns the attributes name by default', function() {
        expect(serializer.keyForNonDeserializedAttribute(model.name))
          .to.equal('name');
      });
    });

    describe('#keyForDeserializedAttribute', function() {
      const serializer = new Serializer({
        model: new Model({
          name: attr(mockTransform())
        })
      });
      const { model } = serializer;

      it('returns the attributes name by default', function() {
        expect(serializer.keyForDeserializedAttribute(model.name, 'bob'))
          .to.equal('name');
      });
    });

    describe('#keyForNonDeserializedRelationship', function() {
      const serializer = new Serializer({
        model: new Model({
          author: one(mockModel()),
          posts: many(mockModel())
        })
      });
      const { model } = serializer;

      it('returns the relationship name by default', function() {
        expect(serializer.keyForNonDeserializedRelationship(model.author))
          .to.equal('author');

        expect(serializer.keyForNonDeserializedRelationship(model.posts))
          .to.equal('posts');
      });
    });

    describe('#keyForDeserializedRelationship', function() {
      const serializer = new Serializer({
        model: new Model({
          author: one(mockModel()),
          posts: many(mockModel())
        })
      });
      const { model } = serializer;

      it('returns the relationship name by default', function() {
        expect(serializer.keyForDeserializedRelationship(model.author, {}))
          .to.equal('author');

        expect(serializer.keyForDeserializedRelationship(model.posts, []))
          .to.equal('posts');
      });
    });

    describe('#keyForNonSerializedAttribute', function() {
      const serializer = new Serializer({
        model: new Model({
          name: attr(mockTransform())
        })
      });
      const { model } = serializer;

      it('returns the attributes name by default', function() {
        expect(serializer.keyForNonSerializedAttribute(model.name))
          .to.equal('name');
      });
    });

    describe('#keyForSerializedAttribute', function() {
      const serializer = new Serializer({
        model: new Model({
          name: attr(mockTransform())
        })
      });
      const { model } = serializer;

      it('returns the attributes name by default', function() {
        expect(serializer.keyForSerializedAttribute(model.name, 'bob'))
          .to.equal('name');
      });
    });

    describe('#keyForNonSerializedRelationship', function() {
      const serializer = new Serializer({
        model: new Model({
          author: one(mockModel()),
          posts: many(mockModel())
        })
      });
      const { model } = serializer;

      it('returns the relationship name by default', function() {
        expect(serializer.keyForNonSerializedRelationship(model.author))
          .to.equal('author');

        expect(serializer.keyForNonSerializedRelationship(model.posts))
          .to.equal('posts');
      });
    });

    describe('#keyForSerializedRelationship', function() {
      const serializer = new Serializer({
        model: new Model({
          author: one(mockModel()),
          posts: many(mockModel())
        })
      });
      const { model } = serializer;

      it('returns the relationship name by default', function() {
        expect(serializer.keyForSerializedRelationship(model.author, {}))
          .to.equal('author');

        expect(serializer.keyForSerializedRelationship(model.posts, []))
          .to.equal('posts');
      });
    });
  });
});

// TODO: move these into some mock generator file or something...
function mockTransform() {
  return {
    deserializer: { deserialize(x) { return x; } },
    serializer: { serialize(x) { return x; } }
  };
}

function mockModel(props = {}) {
  return new Model(props);
}
