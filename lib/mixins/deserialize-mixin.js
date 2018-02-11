'use strict';

const passThrough = require('../../utils/pass-through');
const nullifyUndefined = require('../../utils/nullify-undefined');

module.exports = {

  deserializeAttribute(attribute, rawData = {}, deserializedData = {}) {
    const rawKey = this.keyForNonDeserializedAttribute(attribute);
    const deserializer = this.deserializerFor(attribute);

    const value = this.normalizeDeserializedAttributeValue(
      attribute,
      deserializer.deserialize(rawData[rawKey])
    );
    const deserializedKey = this.keyForDeserializedAttribute(attribute, value);

    if (typeof value !== 'undefined' ) {
      deserializedData[deserializedKey] = value;
    }
  },

  deserializeRelationship(relationship, rawData = {}, deserializedData = {}) {
    const rawKey = this.keyForNonDeserializedRelationship(relationship);
    const deserializer = this.deserializerFor(relationship);

    const value = this.normalizeDeserializedRelationshipValue(
      relationship,
      deserializer.deserialize(rawData[rawKey])
    );
    const deserializedKey = this.keyForDeserializedRelationship(relationship, value);

    if (typeof value !== 'undefined' ) {
      deserializedData[deserializedKey] = value;
    }
  },

  keyForNonDeserializedAttribute(attribute) {
    return attribute.name;
  },

  // eslint-disable-next-line no-unused-vars
  keyForDeserializedAttribute(attribute, serializedValue) {
    return attribute.name;
  },

  keyForNonDeserializedRelationship(relationship) {
    return relationship.name;
  },

  // eslint-disable-next-line no-unused-vars
  keyForDeserializedRelationship(relationship, serializedValue) {
    return relationship.name;
  },

  /**
    Finds the correct serializer, given a attribute or relationship

    @method deserializerFor
    @param {Object|Function} deserializable An attribute or relationship
    @return {Object} { deserialize }
  */
  deserializerFor(deserializable) {
    let deserializer;

    if (deserializable && deserializable.__relationship) {
      deserializer = this.serializers[deserializable.name];
    } else if (deserializable && deserializable.__attribute) {
      deserializer = deserializable.deserializer;
    }

    return deserializer || { deserialize: passThrough };
  },

  normalizeDeserializedAttributeValue(attribute, value) {
    return nullifyUndefined(value);
  },

  normalizeDeserializedRelationshipValue(relationship, value) {
    if (!Array.isArray(value) && relationship.__kind === 'many') {
      return [];
    }

    return nullifyUndefined(value);
  }
};
