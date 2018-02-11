'use strict';

const passThrough = require('../../utils/pass-through');
const nullifyUndefined = require('../../utils/nullify-undefined');

module.exports = {

  serializeAttribute(attribute, rawData = {}, serializedData = {}) {
    const rawKey = this.keyForNonSerializedAttribute(attribute);
    const serializer = this.serializerFor(attribute);

    const value = this.normalizeSerializedAttributeValue(
      attribute,
      serializer.serialize(rawData[rawKey])
    );

    const serializedKey = this.keyForSerializedAttribute(attribute, value);

    if (typeof value !== 'undefined' ) {
      serializedData[serializedKey] = value;
    }
  },

  serializeRelationship(relationship, rawData = {}, serializedData = {}) {
    const rawKey = this.keyForNonSerializedRelationship(relationship);
    const serializer = this.serializerFor(relationship);

    const value = this.normalizeSerializedRelationshipValue(
      relationship,
      serializer.serialize(rawData[rawKey])
    );

    const serializedKey = this.keyForSerializedRelationship(relationship, value);

    if (typeof value !== 'undefined' ) {
      serializedData[serializedKey] = value;
    }
  },

  keyForNonSerializedAttribute(attribute) {
    return attribute.name;
  },

  // eslint-disable-next-line no-unused-vars
  keyForSerializedAttribute(attribute, serializedValue) {
    return attribute.name;
  },

  keyForNonSerializedRelationship(relationship) {
    return relationship.name;
  },

  // eslint-disable-next-line no-unused-vars
  keyForSerializedRelationship(relationship, serializedValue) {
    return relationship.name;
  },

  /**
    Finds the correct serializer, given a attribute or relationship

    @method serializerFor
    @param {Object|Function} serializable An attribute or relationship
    @return {Object} { serialize }
  */
  serializerFor(serializable) {
    let serializer;

    if (serializable && serializable.__relationship) {
      serializer = this.serializers[serializable.name];
    } else if (serializable && serializable.__attribute) {
      serializer = serializable.serializer;
    }

    return serializer || { serialize: passThrough };
  },

  normalizeSerializedAttributeValue(attribute, value) {
    return nullifyUndefined(value);
  },

  normalizeSerializedRelationshipValue(relationship, value) {
    if (!Array.isArray(value) && relationship.__kind === 'many') {
      return [];
    }

    return nullifyUndefined(value);
  }
};
