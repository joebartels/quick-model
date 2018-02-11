const { expect} = require('chai');

const deserializeMixin = require('../deserialize-mixin');

const Model = require('../../model');

const {
  one,
  many,
} = Model;

describe('deserializeMixin', function() {
  describe('#deserializeAttribute', function() {
    const subject = Object.create(deserializeMixin);
    subject.serializers = {};

    it('deserializes a many relationship', function() {
      const deserializedData = {};
      const rawData = {
        age: 66
      };
      const age = mockTransform()
      age.name = 'age';

      subject.deserializeAttribute(age, rawData, deserializedData);

      expect(deserializedData)
        .to.deep.equal({ age: 66 });
    });
  });

  describe('#deserializeRelationship', function() {
    describe('with `one` relationship', function() {
      const subject = Object.create(deserializeMixin);
      subject.serializers = {};

      it('deserializes a many relationship', function() {
        const deserializedData = {};
        const rawData = {
          mom: { name: 'harriet' }
        };
        const mom = one(mockModel());
        mom.name = 'mom';

        subject.deserializeRelationship(mom, rawData, deserializedData);

        expect(deserializedData)
          .to.deep.equal({ mom: { name: 'harriet' } });
      });
    });

    describe('with `many` relationship', function() {
      const subject = Object.create(deserializeMixin);
      subject.serializers = {};

      it('deserializes a many relationship', function() {
        const deserializedData = {};
        const rawData = {
          children: [{ name: 'alice' }]
        };
        const children = many(mockModel());
        children.name = 'children';

        subject.deserializeRelationship(children, rawData, deserializedData);

        expect(deserializedData)
          .to.deep.equal({ children: [{ name: 'alice' }] });
      });
    });
  });

  describe('#keyForNonDeserializedAttribute', function() {
    const subject = Object.create(deserializeMixin);

    it('returns relationship name', function() {
      const age = mockTransform();
      age.name = 'age';

      expect(subject.keyForNonDeserializedAttribute(age)).to.equal('age');
    });
  });

  describe('#keyForDeserializedAttribute', function() {
    const subject = Object.create(deserializeMixin);

    it('returns relationship name', function() {
      const age = mockTransform();
      age.name = 'age';

      expect(subject.keyForDeserializedAttribute(age)).to.equal('age');
    });
  });

  describe('#keyForNonDeserializedRelationship', function() {
    const subject = Object.create(deserializeMixin);

    it('returns relationship name', function() {
      const mom = one(mockModel());
      const children = many(mockModel());
      mom.name = 'mom';
      children.name = 'children';

      expect(subject.keyForNonDeserializedRelationship(mom)).to.equal('mom');
      expect(subject.keyForNonDeserializedRelationship(children)).to.equal('children');
    });
  });

  describe('#keyForDeserializedRelationship', function() {
    const subject = Object.create(deserializeMixin);

    it('returns relationship name', function() {
      const mom = one(mockModel());
      const children = many(mockModel());
      mom.name = 'mom';
      children.name = 'children';

      expect(subject.keyForDeserializedRelationship(mom)).to.equal('mom');
      expect(subject.keyForDeserializedRelationship(children)).to.equal('children');
    });
  });

  describe('#deserializerFor', function() {
    const subject = Object.create(deserializeMixin);

    describe('default deserializer', function() {
      it('behaves like deserializer', function() {
        const attributeDeserializer = subject.deserializerFor();

        expect(attributeDeserializer).to.respondTo('deserialize');
        expect(attributeDeserializer.deserialize('hi')).to.equal('hi');
      });
    });


    describe('relationship deserializer', function() {
      it('behaves like deserializer', function() {
        const oneDeserializer = subject.deserializerFor(one(mockModel()));
        const manyDeserializer = subject.deserializerFor(many(mockModel()));

        expect(oneDeserializer).to.respondTo('deserialize');
        expect(manyDeserializer).to.respondTo('deserialize');
        expect(oneDeserializer.deserialize('hi')).to.equal('hi');
        expect(manyDeserializer.deserialize('hi')).to.equal('hi');
      });
    });

    describe('relationship deserializer when serializer is provided', function() {
      subject.serializers = {};
      let count = 0;
      const mom = one(mockModel());
      const children = many(mockModel());
      mom.name = 'mom';
      children.name = 'children';

      subject.serializers['mom'] = { deserialize() { count++; } }
      subject.serializers['children'] = { deserialize() { count++; } }

      it('behaves like deserializer', function() {
        const oneDeserializer = subject.deserializerFor(mom);
        const manyDeserializer = subject.deserializerFor(children);

        expect(oneDeserializer).to.respondTo('deserialize');
        expect(manyDeserializer).to.respondTo('deserialize');

        oneDeserializer.deserialize();
        manyDeserializer.deserialize();

        expect(count).to.equal(2);
      });
    });
  });

  describe('#normalizeDeserializedRelationshipValue', function() {
    const subject = Object.create(deserializeMixin);

    describe('one relationship', function() {
      const undefinedRelationship = subject.normalizeDeserializedRelationshipValue(
        one(mockModel()),
        undefined
      );

      const nullRelationship = subject.normalizeDeserializedRelationshipValue(
        one(mockModel()),
        null
      );

      const relationshipId = subject.normalizeDeserializedRelationshipValue(
        one(mockModel()),
        '1'
      );

      const relationshipObject = subject.normalizeDeserializedRelationshipValue(
        one(mockModel()),
        { id: '1' }
      );

      it('deserializes a one relationship', function() {
        expect(undefinedRelationship).to.equal(null);
        expect(nullRelationship).to.equal(null);
        expect(relationshipId).to.equal('1');
        expect(relationshipObject).to.deep.equal({ id: '1' });
      });
    });

    describe('many relationship', function() {
      const undefinedRelationship = subject.normalizeDeserializedRelationshipValue(
        many(mockModel()),
        undefined
      );

      const nullRelationship = subject.normalizeDeserializedRelationshipValue(
        many(mockModel()),
        null
      );

      const relationshipId = subject.normalizeDeserializedRelationshipValue(
        many(mockModel()),
        '1'
      );

      const relationshipObject = subject.normalizeDeserializedRelationshipValue(
        many(mockModel()),
        { id: '1' }
      );

      const relationshipArray = subject.normalizeDeserializedRelationshipValue(
        many(mockModel()),
        [{ id: '1' }]
      );

      it('deserializes a many relationship', function() {
        expect(undefinedRelationship).to.deep.equal([]);
        expect(nullRelationship).to.deep.equal([]);
        expect(relationshipId).to.deep.equal([]);
        expect(relationshipObject).to.deep.equal([]);
        expect(relationshipArray).to.deep.equal([{ id: '1' }]);
      });
    });
  });
});

// TODO: move these into some mock generator file or something...
function mockTransform() {
  return {
    __attribute: true,
    deserializer: { deserialize(x) { return x; } },
    serializer: { serialize(x) { return x; } },
    normalizer: { normalize(x) { return x; } }
  };
}

function mockModel(props = {}) {
  return new Model(props);
}
