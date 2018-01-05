const Model = require('./model');
const { expect} = require('chai');

const {
  attr,
  one,
  many,
  primaryKey
} = Model;

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
        let model = () => {
          return new Model({
            foo: attr(transform)
          });
        };

        expect(model())
          .to.have.property('foo');

        expect(model())
          .to.have.property('_attributes')
          .and.to.have.key('foo');
      });

      it('assigns relationships to `_relationship`', function() {
        let model = () => {
          return new Model({
            foo: one(new Model()),
            baz: many(new Model())
          });
        };

        expect(model())
          .to.have.property('foo');

        expect(model())
          .to.have.property('baz');

        expect(model())
          .to.have.property('_relationships')
          .and.to.have.keys(['foo', 'baz']);
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

  describe('#primaryKey', function() {
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
      expect(primaryKey(transform))
        .to.be.sealed
        .and.to.not.be.extensible;
    });

    it('returns new transform object', function() {
      expect(primaryKey(transform))
        .to.not.equal(transform)

      expect(primaryKey(transform))
        .to.have.property('serializer')
        .and.to.respondTo('serialize')

      expect(primaryKey(transform))
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

      expect(primaryKey(transform, options))
        .to.have.property('foo');

      expect(primaryKey(transform, options))
        .to.have.property('deserializer')
        .and.to.have.property('deserialize')
        .and.to.equal(options.deserializer.deserialize)
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
