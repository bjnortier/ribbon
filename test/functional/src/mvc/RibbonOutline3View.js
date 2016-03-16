'use strict';

const trip3 = require('trip.three');
const THREE = trip3.THREE;

class RibbonOutline3View extends trip3.View {

  constructor(model, scene, options) {
    super(model, scene, options);
  }

  render() {
    const geometry = new THREE.Geometry();
    geometry.vertices = this.model.ribbon.outline.map((p) => {
      return new THREE.Vector3(p[0], p[1], p[2]);
    });

    this.sceneObject.add(
      new THREE.LineSegments(geometry,
      new THREE.LineBasicMaterial({
        linewidth: 3,
        color: 0x006600
      })));
  }

}

module.exports = RibbonOutline3View;
