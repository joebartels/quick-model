'use strict';

const assert = require('assert')
const passThrough = require('../utils/pass-through');
const { mapCompact } = require('../utils/array');

class Serializer {
  constructor(options = {}) {
    assert(options && options.model, 'a { model } property must be supplied');

    // user can pass in serializers to operate on embedded relationships
    // key should match how relationship is defined on the { model }
    this.serializers = {};

    Object.assign(this, options);
  }

  serialize(data, options = {}, serialized = {}) {
    const dataType = typeof data;

    if (
      dataType === 'number' ||
      dataType === 'string' ||
      dataType === 'undefined' ||
      data === null
    ) {
      // Not processing Number or String:
      // assumption is that a Number or String indicates a primary key
      //
      // Not processing undefined or null:
      // assumption is that undefined/null values cannot be further serialized
      return data;
    }

    if (Array.isArray(data)) {
      return mapCompact(data, item => this.serialize(item, options));
    }

    const serializeAttribute = attribute => {
      this.serializeAttribute(attribute, data, serialized);
    };

    const serializeRelationship = relationship => {
      this.serializeRelationship(relationship, data, serialized);
    };

    this._attributeAndRelationshipLooper(
      serializeAttribute,
      serializeRelationship,
      options
    );

    return serialized;
  }

  deserialize(data, options = {}, deserialized = {}) {
    const dataType = typeof data;

    if (
      dataType === 'number' ||
      dataType === 'string' ||
      dataType === 'undefined' ||
      data === null
    ) {
      // Not processing Number or String:
      // assumption is that a Number or String indicates a primary key
      //
      // Not processing undefined or null:
      // assumption is that undefined/null values cannot be further serialized
      return data;
    }

    if (Array.isArray(data)) {
      return mapCompact(data, item => this.deserialize(item, options));
    }

    const deserializeAttribute = attribute => {
      this.deserializeAttribute(attribute, data, deserialized);
    };

    const deserializeRelationship = relationship => {
      this.deserializeRelationship(relationship, data, deserialized);
    };

    this._attributeAndRelationshipLooper(
      deserializeAttribute,
      deserializeRelationship,
      options
    );

    return deserialized;
  }

  /**
    Responsible for looping through the necessary attributes & relationships.
    Applies a callback function to each attribute & relationship.

    @method _attributeAndRelationshipLooper
    @param {Function} attributeCallback
    @param {Function} relationshipCallback
    @param {Object} options
    @return {undefined}
    @private
  */
  _attributeAndRelationshipLooper(
    attributeCallback,
    relationshipCallback,
    options = {}
  ) {
    if (options.only && Array.isArray(options.only)) {
      let attributeValue = key => this.model._attributes.get(key);
      let relationshipValue = key => this.model._relationships.get(key);

      let attributes = mapCompact(options.only, attributeValue);
      let relationships = mapCompact(options.only, relationshipValue);

      attributes.forEach(attributeCallback);
      relationships.forEach(relationshipCallback);
    } else {
      this.model.eachAttribute(attributeCallback);
      this.model.eachRelationship(relationshipCallback);
    }
  }

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
  }

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
  }

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
  }

  deserializeRelationship(relationship, rawData = {}, deserializedData = {}) {
    const rawKey = this.keyForNonSerializedRelationship(relationship);
    const deserializer = this.deserializerFor(relationship);

    const value = this.normalizeDeserializedRelationshipValue(
      relationship,
      deserializer.deserialize(rawData[rawKey])
    );
    const deserializedKey = this.keyForDeserializedRelationship(relationship, value);

    if (typeof value !== 'undefined' ) {
      deserializedData[deserializedKey] = value;
    }
  }

  keyForNonDeserializedAttribute(attribute) {
    return attribute.name;
  }

  // eslint-disable-next-line no-unused-vars
  keyForDeserializedAttribute(attribute, serializedValue) {
    return attribute.name;
  }

  keyForNonDeserializedRelationship(relationship) {
    return relationship.name;
  }

  // eslint-disable-next-line no-unused-vars
  keyForDeserializedRelationship(relationship, serializedValue) {
    return relationship.name;
  }

  keyForNonSerializedAttribute(attribute) {
    return attribute.name;
  }

  // eslint-disable-next-line no-unused-vars
  keyForSerializedAttribute(attribute, serializedValue) {
    return attribute.name;
  }

  keyForNonSerializedRelationship(relationship) {
    return relationship.name;
  }

  // eslint-disable-next-line no-unused-vars
  keyForSerializedRelationship(relationship, serializedValue) {
    return relationship.name;
  }

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
  }

  /**
    Finds the correct serializer, given a attribute or relationship

    @method serializerFor
    @param {Object|Function} serializable An attribute or relationship
    @return {Object} { serialize }
  */
  deserializerFor(deserializable) {
    let deserializer;

    if (deserializable && deserializable.__relationship) {
      deserializer = this.serializers[deserializable.name];
    } else if (deserializable && deserializable.__attribute) {
      deserializer = deserializable.deserializer;
    }

    return deserializer || { deserialize: passThrough };
  }

  normalizeSerializedAttributeValue(attribute, value) {
    return Serializer.nullifyUndefinedValue(value);
  }

  normalizeSerializedRelationshipValue(relationship, value) {
    if (typeof value === 'undefined' && relationship.__kind === 'many') {
      return [];
    }

    return Serializer.nullifyUndefinedValue(value);
  }

  normalizeDeserializedAttributeValue(attribute, value) {
    return Serializer.nullifyUndefinedValue(value);
  }

  normalizeDeserializedRelationshipValue(relationship, value) {
    if (typeof value === 'undefined' && relationship.__kind === 'many') {
      return [];
    }

    return Serializer.nullifyUndefinedValue(value);
  }

  static nullifyUndefinedValue(value) {
    if (typeof value === 'undefined') {
      return null;
    }
    return value;
  }

  // no thrills pass-through
  static defaultSerializer() {
    return {
      serialize(data) { return data; }
    };
  }

}

module.exports = Serializer;
