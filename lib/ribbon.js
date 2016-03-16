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

  // Step 3: Choose the intersection closest to the starting point
  // for each rectangle
  const leftStarts = [leftSegments[0].from];
  const rightStarts = [rightSegments[0].from];
  const leftEnds = [];
  const rightEnds = [];

  const stubs = [];
  const capSupports = [];

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

      stubs.push([
        leftIntersections[i],
        centerSegment.to,
        add(centerSegment.to, multiply(offset2, width)),
        add(leftIntersections[i], multiply(offset2, width*2)),
      ]);
      stubs.push([
        centerSegment.to,
        leftIntersections[i],
        add(leftIntersections[i], multiply(offset1, width*2)),
        add(centerSegment.to, multiply(offset1, width)),
      ]);

      capSupports.push([
        add(centerSegment.to, multiply(offset2, width)),
        centerSegment.to,
        add(centerSegment.to, multiply(offset1, width)),
      ]);

    } else {
      const offset1 = norm(cross([0,0,1], centerSegment.direction));
      const offset2 = norm(cross([0,0,1], nextCenterSegment.direction));
      leftEnds[i] = add(rightIntersections[i], multiply(offset1, width*2));
      rightEnds[i] = rightIntersections[i];
      leftStarts[i + 1] = add(rightIntersections[i], multiply(offset2, width*2));
      rightStarts[i + 1] = rightIntersections[i];

      stubs.push([
        rightIntersections[i],
        centerSegment.to,
        add(centerSegment.to, multiply(offset1, width)),
        add(rightIntersections[i], multiply(offset1, width*2)),
      ]);
      stubs.push([
        centerSegment.to,
        rightIntersections[i],
        add(rightIntersections[i], multiply(offset2, width*2)),
        add(centerSegment.to, multiply(offset2, width)),
      ]);

      capSupports.push([
        add(centerSegment.to, multiply(offset1, width)),
        centerSegment.to,
        add(centerSegment.to, multiply(offset2, width)),
      ]);
    }
  }

  leftEnds.push(leftSegments[leftSegments.length - 1].to);
  rightEnds.push(rightSegments[rightSegments.length - 1].to);

  const rectangles = [];

  for (let i = 0, il = leftStarts.length; i < il; ++i) {
    rectangles.push([
      leftStarts[i],
      rightStarts[i],
      rightEnds[i],
      leftEnds[i],
    ]);
  }

  // Generate triangles & outline

  const triangles = [];
  const outline = [];

  rectangles.forEach((r) => {
    triangles.push([r[0], r[1], r[2]]);
    triangles.push([r[0], r[2], r[3]]);
    outline.push(r[1]);
    outline.push(r[2]);
    outline.push(r[3]);
    outline.push(r[0]);
  });
  // Stubs are convex polygons
  stubs.forEach((c) => {
    triangles.push([c[0], c[1], c[2]]);
    triangles.push([c[0], c[2], c[3]]);
    outline.push(c[2]);
    outline.push(c[3]);
  });
  const sliceAngle = 10;
  capSupports.forEach((cs) => {
    let startAngle = Math.atan2(cs[2][1] - cs[1][1], cs[2][0] - cs[1][0])/Math.PI*180;
    let endAngle = Math.atan2(cs[0][1] - cs[1][1], cs[0][0] - cs[1][0])/Math.PI*180;
    startAngle = startAngle < 0 ? startAngle + 360 : startAngle;
    endAngle = endAngle < 0 ? endAngle + 360 : endAngle;
    endAngle = endAngle === 0 ? 360 : endAngle;
    console.log('startAngle', startAngle);
    console.log('endAngle', endAngle);

    const radialPoints = [cs[2]];
    const numSlices = Math.floor((endAngle - startAngle)/sliceAngle);
    const numIntermediatePoints = numSlices - 1;
    const rotationAngle = (endAngle - startAngle)/numSlices/180*Math.PI;
    // The point to rotate
    const p = sub(cs[2], cs[1]);
    for (let i = 0; i < numIntermediatePoints; ++i) {
      const theta = rotationAngle*(i + 1);
      radialPoints.push(add([
          p[0]*Math.cos(theta) - p[1]*Math.sin(theta),
          p[1]*Math.cos(theta) + p[0]*Math.sin(theta),
          0
        ], cs[1]));
    }
    radialPoints.push(cs[0]);

    for (let i = 0; i < radialPoints.length - 1; ++i) {
      triangles.push([radialPoints[i], radialPoints[i+1], cs[1]]);
    }
  });

  // Generate outline

  return {
    triangles: triangles,
    outline: outline,
  };
};
