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
  }

};

function isNumber(value) {
  return value === value &&
          value !== null &&
          value !== Infinity &&
          value !== -Infinity &&
          !isNaN(value);
}
