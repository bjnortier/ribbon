'use strict';

const chai = require('chai');
const assert = chai.assert;

const lib = require('../../');
const ribbon = lib.ribbon;

describe('ribbon', () => {

  it('N shape', () => {
    const polygon = [
      [0, 0, 0],
      [0, 10, 0],
      [10, 0, 0],
      [10, 10, 0],
    ];
    assert.deepEqual(ribbon(polygon, {width: 1}));
  });

});
