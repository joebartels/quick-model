const { expect} = require('chai');

const serializeMixin = require('../serialize-mixin');

const Model = require('../../model');

const {
  one,
  many,
} = Model;

describe('serializeMixin', function() {
  describe('#serializeAttribute', function() {
    const subject = Object.create(serializeMixin);
    subject.serializers = {};

    it('serializes an attribute', function() {
      const serializedData = {};
      const rawData = {
        age: 66
      };
      const age = mockTransform()
      age.name = 'age';

      subject.serializeAttribute(age, rawData, serializedData);

      expect(serializedData)
        .to.deep.equal({ age: 66 });
    });
  });

  describe('#serializeRelationship', function() {
    describe('with `one` relationship', function() {
      const subject = Object.create(serializeMixin);
      subject.serializers = {};

      it('serializes a many relationship', function() {
        const serializedData = {};
        const rawData = {
          mom: { name: 'harriet' }
        };
        const mom = one(mockModel());
        mom.name = 'mom';

        subject.serializeRelationship(mom, rawData, serializedData);

        expect(serializedData)
          .to.deep.equal({ mom: { name: 'harriet' } });
      });
    });

    describe('with `many` relationship', function() {
      const subject = Object.create(serializeMixin);
      subject.serializers = {};

      it('serializes a many relationship', function() {
        const serializedData = {};
        const rawData = {
          children: [{ name: 'alice' }]
        };
        const children = many(mockModel());
        children.name = 'children';

        subject.serializeRelationship(children, rawData, serializedData);

        expect(serializedData)
          .to.deep.equal({ children: [{ name: 'alice' }] });
      });
    });
  });

  describe('#keyForNonSerializedAttribute', function() {
    const subject = Object.create(serializeMixin);

    it('returns relationship name', function() {
      const age = mockTransform();
      age.name = 'age';

      expect(subject.keyForNonSerializedAttribute(age)).to.equal('age');
    });
  });

  describe('#keyForSerializedAttribute', function() {
    const subject = Object.create(serializeMixin);

    it('returns relationship name', function() {
      const age = mockTransform();
      age.name = 'age';

      expect(subject.keyForSerializedAttribute(age)).to.equal('age');
    });
  });

  describe('#keyForNonSerializedRelationship', function() {
    const subject = Object.create(serializeMixin);

    it('returns relationship name', function() {
      const mom = one(mockModel());
      const children = many(mockModel());
      mom.name = 'mom';
      children.name = 'children';

      expect(subject.keyForNonSerializedRelationship(mom)).to.equal('mom');
      expect(subject.keyForNonSerializedRelationship(children)).to.equal('children');
    });
  });

  describe('#keyForSerializedRelationship', function() {
    const subject = Object.create(serializeMixin);

    it('returns relationship name', function() {
      const mom = one(mockModel());
      const children = many(mockModel());
      mom.name = 'mom';
      children.name = 'children';

      expect(subject.keyForSerializedRelationship(mom)).to.equal('mom');
      expect(subject.keyForSerializedRelationship(children)).to.equal('children');
    });
  });

  describe('#serializerFor', function() {
    const subject = Object.create(serializeMixin);

    describe('default serializer', function() {
      it('behaves like serializer', function() {
        const attributeSerializer = subject.serializerFor();

        expect(attributeSerializer).to.respondTo('serialize');
        expect(attributeSerializer.serialize('hi')).to.equal('hi');
      });
    });


    describe('relationship serializer', function() {
      it('behaves like serializer', function() {
        const oneSerializer = subject.serializerFor(one(mockModel()));
        const manySerializer = subject.serializerFor(many(mockModel()));

        expect(oneSerializer).to.respondTo('serialize');
        expect(manySerializer).to.respondTo('serialize');
        expect(oneSerializer.serialize('hi')).to.equal('hi');
        expect(manySerializer.serialize('hi')).to.equal('hi');
      });
    });

    describe('relationship serializer when serializer is provided', function() {
      subject.serializers = {};
      let count = 0;
      const mom = one(mockModel());
      const children = many(mockModel());
      mom.name = 'mom';
      children.name = 'children';

      subject.serializers['mom'] = { serialize() { count++; } }
      subject.serializers['children'] = { serialize() { count++; } }

      it('behaves like serializer', function() {
        const oneSerializer = subject.serializerFor(mom);
        const manySerializer = subject.serializerFor(children);

        expect(oneSerializer).to.respondTo('serialize');
        expect(manySerializer).to.respondTo('serialize');

        oneSerializer.serialize();
        manySerializer.serialize();

        expect(count).to.equal(2);
      });
    });
  });

  describe('#normalizeSerializedRelationshipValue', function() {
    const subject = Object.create(serializeMixin);

    describe('one relationship', function() {
      const undefinedRelationship = subject.normalizeSerializedRelationshipValue(
        one(mockModel()),
        undefined
      );

      const nullRelationship = subject.normalizeSerializedRelationshipValue(
        one(mockModel()),
        null
      );

      const relationshipId = subject.normalizeSerializedRelationshipValue(
        one(mockModel()),
        '1'
      );

      const relationshipObject = subject.normalizeSerializedRelationshipValue(
        one(mockModel()),
        { id: '1' }
      );

      it('serializes a one relationship', function() {
        expect(undefinedRelationship).to.equal(null);
        expect(nullRelationship).to.equal(null);
        expect(relationshipId).to.equal('1');
        expect(relationshipObject).to.deep.equal({ id: '1' });
      });
    });

    describe('many relationship', function() {
      const undefinedRelationship = subject.normalizeSerializedRelationshipValue(
        many(mockModel()),
        undefined
      );

      const nullRelationship = subject.normalizeSerializedRelationshipValue(
        many(mockModel()),
        null
      );

      const relationshipId = subject.normalizeSerializedRelationshipValue(
        many(mockModel()),
        '1'
      );

      const relationshipObject = subject.normalizeSerializedRelationshipValue(
        many(mockModel()),
        { id: '1' }
      );

      const relationshipArray = subject.normalizeSerializedRelationshipValue(
        many(mockModel()),
        [{ id: '1' }]
      );

      it('serializes a many relationship', function() {
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
    serializer: { serialize(x) { return x; } },
    deserializer: { serialize(x) { return x; } },
    normalizer: { normalize(x) { return x; } }
  };
}

function mockModel(props = {}) {
  return new Model(props);
}
