'use strict';

module.exports = {
  dataType: 'string',

  serializer: {

    /**
      @method serialize
      @param deserialized The serialized value
      @param attributes
      @return The serialized value
    */
    serialize(value /*, attributes */) {
      if (typeof value === 'string') {
        return value;
      }
      if (typeof value === 'undefined' || value === null) {
        return null;
      }

      return String(value);
    }
  },

  deserializer: {

    /**
      @method deserialize
      @param value The serialized value
      @param attributes
      @return The deserialized value
    */
    deserialize(value /*, options */) {
      if (typeof value === 'string') {
        return value;
      }
      if (typeof value === 'undefined' || value === null) {
        return null;
      }

      return String(value);
    }
  }
};
