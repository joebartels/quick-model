'use strict';

const number = require('./number');
const { expect }  = require('chai');

const {
  serializer: { serialize },
  deserializer: { deserialize },
  normalizer: { normalize },
} = number;

describe('NumberTransform', function() {
  it('#serialize', function() {
    expect(serialize(456)).to.equal(456);
    expect(serialize('-123')).to.equal(-123);
    expect(serialize('123')).to.equal(123);
    expect(serialize('abc')).to.equal(null);
    expect(serialize()).to.equal(null);
    expect(serialize(null)).to.equal(null);
    expect(serialize(true)).to.equal(1);
    expect(serialize(false)).to.equal(0);
  });

  it('#deserialize', function() {
    expect(deserialize(456)).to.equal(456);
    expect(deserialize('-123')).to.equal(-123);
    expect(deserialize('123')).to.equal(123);
    expect(deserialize('abc')).to.equal(null);
    expect(deserialize()).to.equal(null);
    expect(deserialize(null)).to.equal(null);
    expect(deserialize(true)).to.equal(1);
    expect(deserialize(false)).to.equal(0);
  });

  it('#normalize', function() {
    expect(normalize(456)).to.equal(456);
    expect(normalize('-123')).to.equal(-123);
    expect(normalize('123')).to.equal(123);
    expect(normalize('abc')).to.equal(null);
    expect(normalize()).to.equal(null);
    expect(normalize(null)).to.equal(null);
    expect(normalize(true)).to.equal(1);
    expect(normalize(false)).to.equal(0);
  });
});
