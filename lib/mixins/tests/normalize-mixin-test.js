const { expect} = require('chai');

const normalizeMixin = require('../normalize-mixin');

const Model = require('../../model');

const {
  one,
  many,
} = Model;

describe('normalizeMixin', function() {
  describe('#normalizeAttribute', function() {
    const subject = Object.create(normalizeMixin);
    subject.serializers = {};

    it('normalizes an attribute', function() {
      const normalizedData = {};
      const rawData = {
        age: 66
      };
      const age = mockTransform()
      age.name = 'age';

      subject.normalizeAttribute(age, rawData, normalizedData);

      expect(normalizedData)
        .to.deep.equal({ age: 66 });
    });
  });

  describe('#normalizeRelationship', function() {
    describe('with `one` relationship', function() {
      const subject = Object.create(normalizeMixin);
      subject.serializers = {};

      it('normalizes a many relationship', function() {
        const normalizedData = {};
        const rawData = {
          mom: { name: 'harriet' }
        };
        const mom = one(mockModel());
        mom.name = 'mom';

        subject.normalizeRelationship(mom, rawData, normalizedData);

        expect(normalizedData)
          .to.deep.equal({ mom: { name: 'harriet' } });
      });
    });

    describe('with `many` relationship', function() {
      const subject = Object.create(normalizeMixin);
      subject.serializers = {};

      it('normalizes a many relationship', function() {
        const normalizedData = {};
        const rawData = {
          children: [{ name: 'alice' }]
        };
        const children = many(mockModel());
        children.name = 'children';

        subject.normalizeRelationship(children, rawData, normalizedData);

        expect(normalizedData)
          .to.deep.equal({ children: [{ name: 'alice' }] });
      });
    });
  });

  describe('#normalizerFor', function() {
    const subject = Object.create(normalizeMixin);

    describe('default normalizer', function() {
      it('behaves like serializer', function() {
        const attributeNormalizer = subject.normalizerFor();

        expect(attributeNormalizer).to.respondTo('normalize');
        expect(attributeNormalizer.normalize('hi')).to.equal('hi');
      });
    });


    describe('relationship normalizer', function() {
      it('behaves like normalizer', function() {
        const oneNormalizer = subject.normalizerFor(one(mockModel()));
        const manyNormalizer = subject.normalizerFor(many(mockModel()));

        expect(oneNormalizer).to.respondTo('normalize');
        expect(manyNormalizer).to.respondTo('normalize');
        expect(oneNormalizer.normalize('hi')).to.equal('hi');
        expect(manyNormalizer.normalize('hi')).to.equal('hi');
      });
    });

    describe('relationship normalizer when serializer is provided', function() {
      subject.serializers = {};
      let count = 0;
      const mom = one(mockModel());
      const children = many(mockModel());
      mom.name = 'mom';
      children.name = 'children';

      subject.serializers['mom'] = { normalize() { count++; } }
      subject.serializers['children'] = { normalize() { count++; } }

      it('behaves like normalizer', function() {
        const oneNormalizer = subject.normalizerFor(mom);
        const manyNormalizer = subject.normalizerFor(children);

        expect(oneNormalizer).to.respondTo('normalize');
        expect(manyNormalizer).to.respondTo('normalize');

        oneNormalizer.normalize();
        manyNormalizer.normalize();

        expect(count).to.equal(2);
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
