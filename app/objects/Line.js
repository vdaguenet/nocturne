import THREE from 'three';

export default class Line extends THREE.Object3D {
  constructor() {
    super();

    this.curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(6, 0, 5),
      new THREE.Vector3(14, 0, 5),
      new THREE.Vector3(20, 0, 0)
    );

    this.geom = new THREE.Geometry();
    this.geom.vertices = this.curve.getPoints(100);

    this.mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 8,
    });
    this.line = new THREE.Line(this.geom, this.mat);

    this.line.scale.set(3, 3, 3);
    this.line.position.set(-30, 0, 45);

    this.add(this.line);
  }
}