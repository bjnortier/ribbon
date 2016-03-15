'use strict';

const joi = require('joi');
const v3 = require('vecks').vec3;
const add = v3.add;
const sub = v3.sub;
const cross = v3.cross;
const multiply = v3.multiply;
const norm = v3.norm;
const neg = v3.neg;
const length = v3.length;

const intersect2d = require('./intersect2d');

class LineSegment {

  constructor(from, to) {
    this.from = from;
    this.to = to;
    this.direction = norm(sub(to, from));
    this.length = length(sub(to, from));
  }

}

/* Create a ribbon for the given polygon
 *
 * First the ribbon will be calculated ignoring all Z
 * values, then the Z values will be adjusted. The capped
 * corners are flat in this implementation.
 */
module.exports = function(polygon, options) {
  const throwErr = (err) => {
    if (err) { throw new Error(err); }
  };
  var polygonSchema = joi.array().min(2).required();
  var optionsSchema = joi.object().required().keys({
    width: joi.required()
  });
  joi.validate(polygon, polygonSchema, throwErr);
  joi.validate(options, optionsSchema, throwErr);

  const width = options.width;

  // Step 1: Offset each segment to the left and right (to the left
  // and right of a line going in the +Y direciton looking from above)

  // Convert to a more usable line segments
  const centerSegments = [];
  for (let i = 0, il = polygon.length; i < il - 1; ++i) {
    const a = polygon[i];
    const b = polygon[i + 1];
    centerSegments.push(new LineSegment(a, b));
  }

  const leftSegments = [];
  const rightSegments = [];
  for (let i = 0, il = centerSegments.length; i < il; ++i) {
    const centerSegment = centerSegments[i];
    const offsetDir = norm(cross([0,0,1], centerSegment.direction));
    leftSegments.push(new LineSegment(
      add(centerSegment.from, multiply(offsetDir, width)),
      add(centerSegment.to, multiply(offsetDir, width))));
    rightSegments.push(new LineSegment(
      add(centerSegment.from, multiply(offsetDir, -width)),
      add(centerSegment.to, multiply(offsetDir, -width))));
  }

  // Step 2: Find the intersections of the offset segments
  const leftIntersections = [];
  const rightIntersections = [];
  for (let i = 0, il = centerSegments.length; i < il - 1; ++i) {
    const leftA = leftSegments[i];
    const leftB = leftSegments[i + 1];
    const rightA = rightSegments[i];
    const rightB = rightSegments[i + 1];
    const left3D = intersect2d([leftA.from, leftA.to], [leftB.from, leftB.to]);
    const right3D = intersect2d([rightA.from, rightA.to], [rightB.from, rightB.to]);
    left3D[2] = 0;
    right3D[2] = 0;
    leftIntersections.push(left3D);
    rightIntersections.push(right3D);
  }

  console.log(leftIntersections);
  console.log(rightIntersections);

  // Step 3: Choose the intersection closest to the starting point
  // for each rectangle
  const leftStarts = [leftSegments[0].from];
  const rightStarts = [rightSegments[0].from];
  const leftEnds = [];
  const rightEnds = [];
  for (let i = 0, il = centerSegments.length; i < il - 1; ++i) {
    const centerSegment = centerSegments[i];
    const nextCenterSegment = centerSegments[i + 1];
    const leftStart = leftStarts[i];
    const rightStart = rightStarts[i];

    // console.log('leftStart', leftStart);
    // console.log('rightStart', rightStart);

    const leftIsShorter =
      length(sub(leftIntersections[i], leftStart)) <
      length(sub(rightIntersections[i], rightStart));
    if (leftIsShorter) {
      const offset1 = neg(norm(cross([0,0,1], centerSegment.direction)));
      const offset2 = neg(norm(cross([0,0,1], nextCenterSegment.direction)));
      leftEnds[i] = leftIntersections[i];
      rightEnds[i] = add(leftIntersections[i], multiply(offset1, width*2));
      leftStarts[i + 1] = leftIntersections[i];
      rightStarts[i + 1] = add(leftIntersections[i], multiply(offset2, width*2));

      // console.log('leftEnds', leftEnds);
      // console.log('rightEnds', rightEnds);
      // console.log('leftStarts', leftStarts);
      // console.log('rightStarts', rightStarts);

    } else {
      const offset1 = norm(cross([0,0,1], centerSegment.direction));
      const offset2 = norm(cross([0,0,1], nextCenterSegment.direction));
      leftEnds[i] = add(rightIntersections[i], multiply(offset1, width*2));
      rightEnds[i] = rightIntersections[i];
      leftStarts[i + 1] = add(rightIntersections[i], multiply(offset2, width*2));
      rightStarts[i + 1] = rightIntersections[i];

      // console.log('leftEnds', leftEnds);
      // console.log('rightEnds', rightEnds);
      // console.log('leftStarts', leftStarts);
      // console.log('rightStarts', rightStarts);
    }
  }

  leftEnds.push(leftSegments[leftSegments.length - 1]);
  rightEnds.push(rightSegments[rightSegments.length - 1]);

  const rectangles = [];
  for (let i = 0, il = leftStarts.length; i < il; ++i) {
    rectangles.push([
      leftStarts[i],
      rightStarts[i],
      rightEnds[i],
      leftEnds[i],
    ]);
  }

  const triangles = [];

  rectangles.forEach((r) => {
    triangles.push([r[0], r[1], r[2]]);
    triangles.push([r[0], r[2], r[3]]);
  });

  return triangles;
};
