'use strict';

const assert = require('assert');

class Model {

  constructor(properties) {
    let property;
    this._attributes = new Map();
    this._relationships = new Map();

    // assign each attribute and relationship to their respective maps
    // for iteration using `.eachAttribute` and `.eachRelationship`
    for (let key in properties) {
      property = properties[key];

      if (property.__primaryKey) {
        property.name = key;
        this.primaryKey = property; // gets frozen as attribute
      }

      if (property.__attribute) {
        property.name = key;
        this._attributes.set(key, Object.freeze(property))
      }

      if (property.__relationship) {
        property.name = key;
        this._relationships.set(key, Object.freeze(property))
      }

      // already iterating - may as well imitate Object.assign in this loop
      this[key] = property;
    }
  }

  eachAttribute(cb) {
    this._attributes.forEach(cb);
  }

  eachRelationship(cb) {
    this._relationships.forEach(cb);
  }

  /**
    Asserts the existence of serializer.serialize and deserializer.deserialize
    method and merges any additional options into a new object.
    The new object is frozen and returned.

    @method attr
    @param {Object|Function}
    @param {Object|Function}
    @return {Object}
  */
  static attr(transform, options) {
    transform = Object.assign(
      { name: null, __attribute: true },
      transform,
      options
    );

    assert(
      transform.serializer &&
      typeof transform.serializer.serialize === 'function',
      'attr() must be provided a `serializer.serialize` function'
    );

    assert(
      transform.deserializer &&
      typeof transform.deserializer.deserialize === 'function',
      'attr() must be provided a `deserializer.deserialize` function'
    );

    return Object.seal(transform);
  }

  static one(model, options) {
    assert(
      model instanceof Model,
      'one(model) must be provided a `Model` instance'
    );

    let transform = Object.assign(
      { model, name: null, __relationship: true, __kind: 'one' },
      options
    );

    return Object.seal(transform);
  }

  static many(model, options) {
    assert(
      model instanceof Model,
      'many(model) must be provided a `Model` instance'
    );

    let transform = Object.assign(
      { model, name: null, __relationship: true, __kind: 'many' },
      options
    );

    return Object.seal(transform);
  }

  static primaryKey(transform, options) {
    options = Object.assign({}, options, { __primaryKey: true });

    return Model.attr(transform, options)
  }
}

module.exports = Model;
