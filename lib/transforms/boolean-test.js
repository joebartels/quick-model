'use strict';

const { expect } = require('chai');

const {
  serializer: { serialize },
  deserializer: { deserialize },
  normalizer: { normalize }
} = require('./boolean');

describe('BooleanTransform', function() {

  it('#serialize', function() {
    expect(serialize()).to.equal(false);
    expect(serialize('')).to.equal(false);
    expect(serialize(null)).to.equal(false);
    expect(serialize(false)).to.equal(false);
    expect(serialize(true)).to.equal(true);
    expect(serialize('true')).to.equal(true);
    expect(serialize('false')).to.equal(false);
    expect(serialize('1')).to.equal(true);
    expect(serialize('0')).to.equal(false);
    expect(serialize(1)).to.equal(true);
    expect(serialize(0)).to.equal(false);
  });

  it('#deserialize', function() {
    expect(deserialize()).to.equal(false);
    expect(deserialize('')).to.equal(false);
    expect(deserialize(null)).to.equal(false);
    expect(deserialize(true)).to.equal(true);
    expect(deserialize(false)).to.equal(false);
    expect(deserialize('true')).to.equal(true);
    expect(deserialize('false')).to.equal(false);
    expect(deserialize('1')).to.equal(true);
    expect(deserialize('0')).to.equal(false);
    expect(deserialize(1)).to.equal(true);
    expect(deserialize(0)).to.equal(false);
  });

  it('#normalize', function() {
    expect(normalize()).to.equal(false);
    expect(normalize('')).to.equal(false);
    expect(normalize(null)).to.equal(false);
    expect(normalize(true)).to.equal(true);
    expect(normalize(false)).to.equal(false);
    expect(normalize('true')).to.equal(true);
    expect(normalize('false')).to.equal(false);
    expect(normalize('1')).to.equal(true);
    expect(normalize('0')).to.equal(false);
    expect(normalize(1)).to.equal(true);
    expect(normalize(0)).to.equal(false);
  });

});
