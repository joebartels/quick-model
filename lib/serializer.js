'use strict';

const assert = require('assert')

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
      // could also use filter to remove falsey values but to avoid iterating 2x
      // TODO: move into util/mapCompact
      let list = [];
      for (let i = 0; i < data.length; i++) {
        let item = this.serialize(data[i], options);
        if (item) { list.push(item); }
      }

      return list;
    }

    const serializeAttribute = attribute => {
      this.serializeAttribute(attribute, data, serialized);
    };

    const serializeRelationship = relationship => {
      this.serializeRelationship(relationship, data, serialized);
    };

    this.model.eachAttribute(serializeAttribute);
    this.model.eachRelationship(serializeRelationship);

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
      return data.map(item => this.deserialize(item, options));
    }

    const deserializeAttribute = attribute => {
      this.deserializeAttribute(attribute, data, deserialized);
    };

    const deserializeRelationship = relationship => {
      this.deserializeRelationship(relationship, data, deserialized);
    };

    this.model.eachAttribute(deserializeAttribute);
    this.model.eachRelationship(deserializeRelationship);

    return deserialized;
  }

  serializeAttribute(attribute, rawData = {}, serializedData = {}) {
    const rawKey = this.keyForNonSerializedAttribute(attribute);
    const value = this.normalizeSerializedAttributeValue(
      attribute,
      attribute.serializer.serialize(rawData[rawKey])
    );
    const serializedKey = this.keyForSerializedAttribute(attribute, value);

    if (typeof value !== 'undefined' ) {
      serializedData[serializedKey] = value;
    }
  }

  serializeRelationship(relationship, rawData = {}, serializedData = {}) {
    const rawKey = this.keyForNonSerializedRelationship(relationship);
    const serializer = this.serializerFor(relationship) ||
                       Serializer.defaultRelationshipSerializer();

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
    const value = this.normalizeDeserializedAttributeValue(
      attribute,
      attribute.deserializer.deserialize(rawData[rawKey])
    );
    const deserializedKey = this.keyForDeserializedAttribute(attribute, value);

    if (typeof value !== 'undefined' ) {
      deserializedData[deserializedKey] = value;
    }
  }

  deserializeRelationship(relationship, rawData = {}, deserializedData = {}) {
    const rawKey = this.keyForNonSerializedRelationship(relationship);
    const value = this.normalizeDeserializedRelationshipValue(
      relationship,
      relationship.model.deserialize(rawData[rawKey])
    );
    const deserializedKey = this.keyForDeserializedRelationship(relationship, value);

    if (typeof value !== 'undefined' ) {
      deserializedData[deserializedKey] = value;
    }
  }

  keyForNonDeserializedAttribute(attribute) {
    return attribute.name;
  }

  keyForDeserializedAttribute(attribute, serializedValue) {
    return attribute.name;
  }

  keyForNonDeserializedRelationship(relationship) {
    return relationship.name;
  }

  keyForDeserializedRelationship(relationship, serializedValue) {
    return relationship.name;
  }

  keyForNonSerializedAttribute(attribute) {
    return attribute.name;
  }

  keyForSerializedAttribute(attribute, serializedValue) {
    return attribute.name;
  }

  keyForNonSerializedRelationship(relationship) {
    return relationship.name;
  }

  keyForSerializedRelationship(relationship, serializedValue) {
    return relationship.name;
  }

  serializerFor(relationship) {
    return this.serializers[relationship.name];
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
  static defaultRelationshipSerializer() {
    return {
      serialize(data) { return data; }
    };
  }
}

module.exports = Serializer;
