'use strict';

const chai = require('chai');
const assert = chai.assert;

const lib = require('../../');
const removeParallel2D = lib.removeParallel2D;

describe('remove parallel', () => {

  it('no parallel edges', () => {
    const poly = [
      [0, 0, 0],
      [0, 10, 0],
      [10, 0, 0],
      [10, 10, 0],
    ];
    assert.deepEqual(removeParallel2D(poly), poly);
  });

  it('remove one point', () => {
    const poly = [
      [0, 0, 0],
      [0, 10, 0],
      [0, 20, 0],
    ];
    assert.deepEqual(removeParallel2D(poly), [
      [0, 0, 0],
      [0, 20, 0],
    ]);
  });

  it('remove multiple points', () => {
    const poly = [
      [0, 0, 0],
      [0, 10, 0],
      [0, 11, 0],
      [0, 20, 0],
    ];
    assert.deepEqual(removeParallel2D(poly), [
      [0, 0, 0],
      [0, 20, 0],
    ]);
  });

});
