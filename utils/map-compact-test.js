const { assert, expect} = require('chai');

const mapCompact = require('./map-compact');

describe('utils/map-compact', function() {
  describe('with non array', function() {
    const throwError = () => {
      throw new Error('should not invoke me!');
    };

    it('returns empty array', function() {
      expect(mapCompact(null, throwError))
        .to.be.an('array').that.is.empty;

      expect(mapCompact(undefined, throwError))
        .to.be.an('array').that.is.empty;

      expect(mapCompact({}, throwError))
        .to.be.an('array').that.is.empty;

      expect(mapCompact(false, throwError))
        .to.be.an('array').that.is.empty;

      expect(mapCompact(true, throwError))
        .to.be.an('array').that.is.empty;

      expect(mapCompact('lolz', throwError))
        .to.be.an('array').that.is.empty;
    });
  });

  describe('with array', function() {
    describe('with all truthy values', function() {
      const evens = [2, 4, 6];
      const mapFn = val => { return (val % 2) === 0; }

      expect(mapCompact(evens, mapFn))
        .to.deep.equal([true, true, true]);
    });

    describe('with some falsey values', function() {
      const evens = [2, 4, 6, 4, 8];
      const mapFn = val => { return (val - 4); }

      expect(mapCompact(evens, mapFn))
        .to.deep.equal([-2, 2, 4]);
    });
  });
});
