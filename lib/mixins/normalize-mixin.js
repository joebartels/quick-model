'use strict';

const passThrough = require('../../utils/pass-through');
const nullifyUndefined = require('../../utils/nullify-undefined');

module.exports = {

  normalizeAttribute(attribute, rawData = {}, normalizedData = {}) {
    const rawKey = attribute.name;
    const normalizer = this.normalizerFor(attribute);
    const value = nullifyUndefined(normalizer.normalize(rawData[rawKey]));

    normalizedData[rawKey] = value;
  },

  normalizeRelationship(relationship, rawData = {}, normalizedData = {}) {
    const rawKey = relationship.name;
    const normalizer = this.normalizerFor(relationship);
    const value = nullifyUndefined(normalizer.normalize(rawData[rawKey]));

    normalizedData[rawKey] = value;
  },
  /**
    Finds the correct serializer, given a attribute or relationship

    @method serializerFor
    @param {Object|Function} serializable An attribute or relationship
    @return {Object} { serialize }
  */
  normalizerFor(normalizable) {
    let normalizer;

    if (normalizable && normalizable.__relationship) {
      normalizer = this.serializers[normalizable.name];
    } else if (normalizable && normalizable.__attribute) {
      normalizer = normalizable.normalizer;
    }

    return normalizer || { normalize: passThrough };
  }
};
