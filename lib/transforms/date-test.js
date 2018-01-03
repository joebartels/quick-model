const { expect } = require('chai');

const {
  serializer: { serialize },
  deserializer: { deserialize }
} = require('./date');


describe('DateTransform', function() {

  it('#serialize', function() {
    let newDate = new Date('Jan 2 2018 23:59');
    let dateStr = newDate.toISOString();

    expect(serialize(newDate + '')).to.equal(dateStr, 'date string to date string');
    expect(serialize(newDate)).to.equal(dateStr, 'date to a string');
    expect(serialize(dateStr)).to.equal(dateStr, 'string to a string');
    expect(serialize()).to.equal(null);
    expect(serialize('')).to.equal(null);
    expect(serialize(null)).to.equal(null);
    expect(serialize(true)).to.equal(null);
    expect(serialize(false)).to.equal(null);
    expect(serialize('invalid')).to.equal(null);
  });

  it('#deserialize', function() {
    let newDate = new Date('Jan 1, 2017 13:01');
    let dateStr = newDate.toString();

    expect(deserialize(newDate)).to.be.an.instanceof(Date);
    expect(deserialize(newDate + '')).to.be.an.instanceof(Date);
    expect(deserialize(undefined)).to.be.null;
    expect(deserialize(null)).to.be.null;
    expect(deserialize('')).to.be.null;
    expect(deserialize(true)).to.be.null;
    expect(deserialize(false)).to.be.null;
    expect(deserialize('invalid')).to.be.null;

    expect(deserialize(newDate) + '').to.equal(dateStr);
    expect(deserialize(newDate + '') + '').to.equal(dateStr);
    expect(deserialize(undefined)).to.be.null;
    expect(deserialize('')).to.be.null;
    expect(deserialize(null)).to.be.null;
    expect(deserialize(true)).to.be.null;
    expect(deserialize(false)).to.be.null;
    expect(deserialize('invalid')).to.be.null;
  });
});
