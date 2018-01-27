'use strict';

const TRUE = /^true$|^t$|^1$|^y$/i;

/**
  @class Transforms.booleanTransform
*/
module.exports = {
  dataType: 'boolean',

  serializer: {

    /**
      @method serialize
      @param value The deserialized value
      @return The serialized value
    */
    serialize(value /*, attribute */) {
      return toBool(value);
    }
  },

  deserializer: {

    /**
      Client -> validate -> deserialize -> DB

      @method deserialize
      @param value The serialized value
      @return The deserialized value
    */
    deserialize(value /*, attribute */) {
      return toBool(value);
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

function toBool(value, defaultValue = false) {
  let type = typeof value;

  if (type === 'boolean') {
    return value;
  } else if (type === 'string') {
    return value.match(TRUE) !== null;
  } else if (type === 'number') {
    return value === 1;
  }

  return defaultValue;
}
