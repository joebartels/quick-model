'use strict';

/**
  @class Transform.String
*/
module.exports = {
  dataType: 'json',

  serializer: {

    /**
      Server -> Serialize -> DB

      Stringifies an object

      @method serialize
      @param deserialized The serialized value
      @param attribute
      @return The serialized value
    */
    serialize(value /*, attribute */) {
      if (typeof value === 'undefined' || value === null) {
        return '{}';
      }

      if (typeof value === 'object') {
        return JSON.stringify(value);
      }

      if (typeof value === 'string') {
        try {
          return JSON.stringify(JSON.parse(value));
        } catch (err) {
          return '{}';
        }
      }

      return '{}';
    }
  },

  deserializer: {

    /**
      Client -> Server -> Deserialize -> Validate -> ...

      @method deserialize
      @param value The serialized value
      @param attribute
      @return The deserialized value
    */
    deserialize(value /*, attribute */) {
      if (value && typeof value === 'object') {
        return value;
      }

      if (value === null) {
        return {};
      }

      try {
        return JSON.parse(value);
      } catch(err) {
        return {};
      }
    }
  }
};
