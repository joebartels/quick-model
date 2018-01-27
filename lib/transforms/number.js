'use strict';

/**
  @class Transforms.numberTransform
*/
module.exports = {
  dataType: 'number',

  serializer: {

    /**
      @method serialize
      @param deserialized The serialized value
      @param attribute Hash of details about the attribute. Defined on Model
      @return The serialized value
    */
    serialize(value /*, attribute */) {
      return isNumber(value) ? Number(value) : null;
    }
  },

  deserializer: {

    /**
      @method deserialize
      @param value The serialized value
      @param attribute Hash of details about the attribute. Defined on Model
      @return The deserialized value
    */
    deserialize(value /*, attribute */) {
      return isNumber(value) ? Number(value) : null;
    }
  },

  validator: {
    /**
      Validates the value.
      If `true` is returned it is considered valid.
      If `false` is returned it is considered invalid.
      If a String is returned it is considered invalid and the string is used
      as the error message.

      @method validator.validate
      @param {Any} value
      @param {Object} attribute
      @return {Boolean|String}
    */
    validate(value, attribute) { // eslint-disable-line no-unused-vars
      return true;
    }
  }
};

function isNumber(value) {
  return value === value &&
          value !== null &&
          value !== Infinity &&
          value !== -Infinity &&
          !isNaN(value);
}
