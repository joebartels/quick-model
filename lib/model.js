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

  serialize(data, options = {}, serialized = {}) {
    if (typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.serialize(item, options));
    }

    const serializeAttribute = (attribute) => {
      Model.serializeAttribute(
        attribute,
        this,
        data,
        serialized
      );
    };

    const serializeRelationship = (relationship) => {
      Model.serializeRelationship(
        relationship,
        this,
        data,
        serialized
      );
    };

    this.eachAttribute(serializeAttribute);
    this.eachRelationship(serializeRelationship);

    return serialized;
  }

  /**
    Consumed when using `model.serialize(raw_data)`

    Returns the key for accessing an attribute on NON-serialized data.

    E.g.
    An attribute from the database may come with the key: "ACCOUNT_NUM".
    But on your model it's defined as "account_number".

    For this scenario:
    `keyForNonSerializedAttribute()` will accept the param "account_number"
    and should return "ACCOUNT_NUM"

    ```js
    keyForNonSerializedAttribute(attributeName) {
      if (attributeName === 'account_number') {
        return 'ACCOUNT_NUM';
      }

      return attributeName;
    }
    ```

    @method keyForNonSerializedAttribute
    @param {String} attributeName The attribute name, as defined on the model.
  */
  keyForNonSerializedAttribute(attribute) {
    return attribute.name;
  }

  /**
    Consumed when using `model.serialize(raw_data)`

    Returns the key used for representing a serialized attribute.

    E.g.
    An attribute from the database may come in the form: "ACCOUNT_NUM",
    on your model it's defined as "account_number",
    and when serializing to the client, you want the key to be "accountNumber"

    For this scenario:
    `keyForSerializedAttribute` will accept the param "account_number"
    and should return "accountNumber".


    ```js
    keyForSerializedAttribute(attributeName) {
      if (attributeName === 'account_number') {
        return 'accountNumber';
      }

      return attributeName;
    }
    ```

    @method keyForSerializedAttribute
    @param {String} attributeName The attribute name, as defined on the model.
  */
  keyForSerializedAttribute(attribute, serializedValue) {
    return attribute.name;
  }


  /**
    Consumed when using `model.serialize(raw_data)`

    Returns the key for accessing a relationship on NON-serialized data.

    E.g.
    A relationship from the database may come with the key: "CHILDREN_IDS".
    But on your model it's defined as "children".

    For this scenario:
    `keyForNonSerializedRelationship()` will accept the param "children"
    and should return "CHILDREN_IDS"

    ```js
    keyForNonSerializedRelationship(relationshipName) {
      if (relationshipName === 'children') {
        return 'CHILDREN_IDS';
      }

      return relationshipName;
    }
    ```

    @method keyForNonSerializedRelationship
    @param {String} relationshipName The relationship name, as defined on the model.
  */
  keyForNonSerializedRelationship(relationship) {
    return relationship.name;
  }

  /**
    Consumed when using `model.serialize(raw_data)`

    Returns the key used for representing a serialized relationship.

    E.g.
    A relationship from the database may come in the form: "CHILDREN",
    on your model it's defined as "children",
    and when serializing to the client, you want the key to be "children_ids"
    if it's just an Array of ids, and "children" otherwise (assuming embedded object)

    For this scenario:
    `keyForSerializedRelationship` will accept the params:
    "children", { relationship }, value

    ```js
    keyForSerializedRelationship(relationshipName, relationship, value) {
      if (relationshipName === 'children' && Array.isArray(value)) {
        if (value.every(val => typeof val === 'string')) {
          return 'children_ids';
        } else {
          return 'children'
        }
      }
      return relationshipName;
    }
    ```

    @method keyForSerializedRelationship
    @param {String} relationshipName The attribute name, as defined on the model.
  */
  keyForSerializedRelationship(relationship, value) {
    return relationship.name;
  }


  /**
    Properly accesses raw value, serializes, and assigns serialized key/value
    to the passed in `serialized` Object.

    @static serializeAttribute
    @param {Object} attribute hash containing details about the attribute
    @param {String} attributeName as defined on the model
    @param {Object} model the model from which serialize() was invoked
    @param {Object} serialized a hash where the serialized result will be placed
    @param {Object} data a hash where the non-serialized data exists
    @return undefined
  */
  static serializeAttribute(
    attribute,
    model,
    data = {},
    serialized = {}
  ) {
    const nonSerializedKey = model.keyForNonSerializedAttribute(attribute);
    const serializedValue = attribute
                            .serializer
                            .serialize(data[nonSerializedKey]);

    const serializedKey = model.keyForSerializedAttribute(
      attribute,
      serializedValue
    );

    serialized[serializedKey] = serializedValue;
  }

  static serializeRelationship(
    relationship,
    model,
    data = {},
    serialized = {}
  ) {
    const nonSerializedKey = model.keyForNonSerializedRelationship(relationship);
    const serializedValue = relationship
                            .model
                            .serialize(data[nonSerializedKey], relationship);

    const serializedKey = model.keyForSerializedRelationship(
      relationship,
      serializedValue
    );

    serialized[serializedKey] = serializedValue;
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
}

module.exports = Model;
