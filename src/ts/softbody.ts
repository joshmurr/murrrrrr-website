import type { AABB, Vec2, Vec3 } from "@geomm/api";
import {
  applyDamping,
  calculateGlobal,
  integrateExternal,
  integrateSprings,
  updateNode,
  type Node,
  boundaryCollide,
  collideObjectNode,
} from "./node";
import {
  HALF_PI,
  add,
  add3,
  cross3,
  distance,
  dot,
  floor,
  normalize,
  pow,
  rotate,
  scale,
  scale3,
  sub,
  vec2,
  vec3,
} from "@geomm/maths";

export type SoftBody = {
  nodes: Node[];
  color: string;
  pos: Vec2;
  linearMomentum: Vec2;
  angularMomentum: Vec3;
  externalForce: Vec2;
  mass: number;
  radii: number[];
  normals: Vec2[];
  averageDistance: number;
};

export const createSoftBody = (nodes: Node[], color: string) => {
  const pos = vec2(0, 0);
  const linearMomentum = vec2(0, 0);
  const angularMomentum = vec3(0, 0, 0);
  const externalForce = vec2(0, 0);
  const mass = 0;
  const averageDistance = 0;
  const radii = Array(nodes.length);
  const normals = Array(nodes.length);
  return {
    nodes,
    color,
    pos,
    linearMomentum,
    angularMomentum,
    externalForce,
    mass,
    radii,
    normals,
    averageDistance,
  };
};

export const resetAttributes = (sb: SoftBody) => {
  sb.linearMomentum = vec2(0, 0);
  sb.angularMomentum = vec3(0, 0, 0);
  sb.mass = 0;
  sb.pos = vec2(0, 0);
  sb.externalForce = vec2(0, 0);
  sb.averageDistance = 0;
  sb.radii = Array(sb.nodes.length);
  sb.normals = Array(sb.nodes.length);
};

export const calculateAttributes = (sb: SoftBody) => {
  /* These loops basically just sum & average a bunch of properties
  of the softbody nodes to find global softbody
  momentum, pos, mass, etc... */
  for (let i = 0; i < sb.nodes.length; i++) {
    const currentNode = sb.nodes[i];
    sb.linearMomentum = add(sb.linearMomentum, currentNode.momentum);
    sb.pos = add(sb.pos, currentNode.pos);
    sb.mass += currentNode.mass;
  }
  sb.linearMomentum = scale(sb.linearMomentum, 1 / sb.nodes.length);
  sb.mass /= sb.nodes.length;
  sb.pos = scale(sb.pos, 1 / sb.nodes.length);

  for (let i = 0; i < sb.nodes.length; i++) {
    const currentNode = sb.nodes[i];
    /* sb is the trickiest part,
    it calculates the angular momentum of the softbody
    by averaging the orbital momentum of each
    node around the softbody origin we calculated above. */
    sb.averageDistance += distance(sb.pos, currentNode.pos);
    const local_angular2 = sub(currentNode.pos, sb.pos);
    const local_angular = vec3(local_angular2.x, local_angular2.y, 0);
    sb.angularMomentum = add3(
      sb.angularMomentum,
      cross3(
        local_angular,
        vec3(currentNode.momentum.x, currentNode.momentum.y, 0)
      )
    );
  }
  sb.angularMomentum = scale3(sb.angularMomentum, 1 / sb.nodes.length);
  sb.averageDistance /= sb.nodes.length;
};

export const calculateSurface = (sb: SoftBody) => {
  const l = sb.nodes.length;
  for (let i = 0; i < l; i++) {
    /* Calculate normals between adjacent points and
    average them to find the normal at each node. */
    const prev = sb.nodes[i - 1 - l * floor((i - 1) / l)].pos;
    const curr = sb.nodes[i].pos;
    const next = sb.nodes[(i + 1) % l].pos;
    let normal = normalize(rotate(sub(prev, curr), HALF_PI));
    normal = add(normal, normalize(rotate(sub(curr, next), HALF_PI)));
    sb.normals[i] = normalize(normal);

    /* Simplisitic calculation of basis function radii,
    sufficient for roughly convex shapes whose points
    are roughly equidistant to the origin. */
    sb.radii[i] = distance(curr, sb.pos);
  }
};

export const volumeField = (sb: SoftBody, point: Vec2, reg = 1) => {
  /* Citation: http://www.3dgp.net/paper/2016/A%20Closed-Form%20Formulation%20of%20HRBF-Based%20Surface%20Reconstruction.pdf (pg. 5, eqn. 10)

  sb function returns a negative number if the point is inside the shape,
  positive if outside, 0 if exactly on the boundary.

  sb simulation leverages the properties of sb function to
  generate a repulsive force roughly proportional to the depth at which a
  node intersects a softbody.

  A simpler collision scheme may use the crossing number
  algorithm (point in polygon), used in the game Asteroids for example.

  It is also possible to find the closed form of the gradient of sb function
  for more sophisticated collision schemes. */

  let hrbf = 0;
  for (let i = 0; i < sb.nodes.length; i++) {
    const pos = sb.nodes[i].pos;
    const radius = sb.radii[i];
    const normal = sb.normals[i];
    const d = distance(point, pos);
    const d_scl = d / radius;
    if (0 <= d_scl && d_scl <= 1) {
      const r_sqr = pow(radius, 2);
      const v1 = scale(normal, r_sqr / (20 + reg * r_sqr));
      let v2 = sub(point, pos);
      v2 = scale(v2, (20 * pow(d - radius, 3)) / pow(radius, 5));
      hrbf -= dot(v1, v2);
    }
  }
  return hrbf;
};

// See scene and node constructors for details on what these do.
export const integrateForces = (sb: SoftBody) => {
  for (let i = 0; i < sb.nodes.length; i++) {
    const currentNode = sb.nodes[i];
    integrateExternal(currentNode, sb.externalForce);
    integrateSprings(currentNode, sb.nodes);
  }
};

export const dampUpdateBoundary = (
  sb: SoftBody,
  friction: number,
  bounds: AABB,
  inside = false
) => {
  for (let i = 0; i < sb.nodes.length; i++) {
    const currentNode = sb.nodes[i];
    calculateGlobal(currentNode, sb);
    applyDamping(currentNode);
    updateNode(currentNode);
    boundaryCollide(currentNode, friction, bounds, inside);
  }
};

export const collideObject = (
  sbA: SoftBody,
  sbB: SoftBody,
  damping: number,
  force: number
) => {
  for (let i = 0; i < sbA.nodes.length; i++) {
    collideObjectNode(sbA.nodes[i], sbB, sbA.normals[i], damping, force);
  }
};
