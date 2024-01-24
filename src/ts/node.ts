import type { AABB, Vec2 } from "@geomm/api";
import {
  add,
  clamp,
  normalize,
  radians,
  rotate,
  scale,
  sub,
  vec2,
} from "@geomm/maths";
import { volumeField, type SoftBody } from "./softbody";

export type Spring = {
  idx: number;
  length: number;
  stiffness: number;
};

export type Node = {
  pos: Vec2;
  mass: number;
  springs: Spring[];
  damping: number;
  momentum: Vec2;
  globalMomentum: Vec2;
};

export const createNode = (
  ops: Pick<Node, "pos" | "mass" | "springs" | "damping">
) => {
  const { pos, mass, springs, damping } = ops;
  const momentum = vec2(0, 0);
  const globalMomentum = vec2(0, 0);
  return { pos, mass, springs, damping, momentum, globalMomentum };
};

export const calculateGlobal = (node: Node, sb: SoftBody) => {
  /* The vector math here recovers the average
 orbital momentum from the sb angular momentum. */
  const _pos = sub(node.pos, sb.pos);
  let _angular = rotate(_pos, radians(sb.angularMomentum.z));
  _angular = sub(_angular, _pos);
  _angular = scale(_angular, 1 / sb.averageDistance);
  node.globalMomentum = add(sb.linearMomentum, _angular);
};

export const applyDamping = (node: Node) => {
  // Apply spring damping to node momentum, conserving sb momentum.
  node.momentum = sub(node.momentum, node.globalMomentum);
  node.momentum = scale(node.momentum, 1 - node.damping);
  node.momentum = add(node.momentum, node.globalMomentum);
};

export const integrateExternal = (node: Node, force: Vec2) => {
  node.momentum = add(node.momentum, force);
};

export const updateNode = (node: Node) => {
  node.pos = add(node.pos, node.momentum);
};

export const boundaryCollide = (node: Node, friction: number, bounds: AABB) => {
  const { center, halfWidth, halfHeight } = bounds;
  const min = vec2(center.x - halfWidth, center.y - halfHeight);
  const max = vec2(center.x + halfWidth, center.y + halfHeight);
  // Check if node is outside bounds of simulation.
  if (node.pos.x < min.x || node.pos.x > max.x) {
    // Flip momentum in appropriate direction if it is.
    node.momentum.x *= -1;
    // Apply boundary friction to momentum.
    node.momentum = scale(node.momentum, 1 - friction);
  }

  // Repeat for horizontal walls of boundary.
  if (node.pos.y < min.y || node.pos.y > max.y) {
    node.momentum.y *= -1;
    node.momentum = scale(node.momentum, 1 - friction);
  }

  /* In addition to flipping momentum and applying friction,
  constrain pos to within bounds of simulation to prevent clipping errors. */
  node.pos.x = clamp(node.pos.x, min.x, max.x);
  node.pos.y = clamp(node.pos.y, min.y, max.y);
};

export const boundaryCollideExternal = (
  node: Node,
  friction: number,
  bounds: AABB,
  thickness: number
) => {
  const { center, halfWidth, halfHeight } = bounds;
  const min = vec2(center.x - halfWidth, center.y - halfHeight);
  const max = vec2(center.x + halfWidth, center.y + halfHeight);
  const { x, y } = node.pos;
  if (y > min.y && y < max.y) {
    if (x > min.x && x < min.x + thickness) {
      node.pos.x = min.x;
      node.momentum.x *= -1;
      node.momentum = scale(node.momentum, 1 - friction);
    }
    if (x < max.x && x > max.x - thickness) {
      node.pos.x = max.x;
      node.momentum.x *= -1;
      node.momentum = scale(node.momentum, 1 - friction);
    }
  }
  if (x > min.x && x < max.x) {
    if (y > min.y && y < min.y + thickness) {
      node.pos.y = min.y;
      node.momentum.y *= -1;
      node.momentum = scale(node.momentum, 1 - friction);
    }
    if (y < max.y && y > max.y - thickness) {
      node.pos.y = max.y;
      node.momentum.y *= -1;
      node.momentum = scale(node.momentum, 1 - friction);
    }
  }
};

// Very simplistic and inacurrate but visually convincing collision.
export const collideObjectNode = (
  node: Node,
  object: SoftBody,
  normal: Vec2,
  damping: number,
  force: number
) => {
  const scalar = volumeField(object, node.pos);
  // Check if node is inside the object.
  if (scalar < 0) {
    node.momentum = sub(node.momentum, node.globalMomentum);
    /* Push node away from softbody, in the direction of the nodes normal,
    as scaled by the distance from the surface of the softbody. */
    node.momentum = sub(node.momentum, scale(normal, force * -scalar));
    node.momentum = scale(node.momentum, 1 - damping);
    node.momentum = add(node.momentum, node.globalMomentum);
  }
};

export const integrateSprings = (node: Node, nodes: Node[]) => {
  // For every spring of node node;
  for (let i = 0; i < node.springs.length; i++) {
    const goalSpring = node.springs[i];
    const goalNode = nodes[goalSpring.idx];

    /* Calculate goal pos between the two masses
       by finding the unit normal vector between the masses,
       scaling it by the spring length,
       then adding the location of the current node.

       By Hooke's law, the force exerted by the spring should
       be directly propotional to the distance between the
       mass and the rest point of the spring.

       If you alter node code slightly,
       changing the falloff law to the inverse square law,
       node becomes a newtonian gravity sim. */
    const goalPos = add(
      goalNode.pos,
      scale(normalize(sub(node.pos, goalNode.pos)), goalSpring.length)
    );

    /* Find acceleration vector (goalVector) by subtracting
       the current node's pos from the goal pos. */
    // Scale the acceleration vector by the stiffness coefficient.
    // Second half of Newton's second law of motion.
    const goalVector = scale(
      scale(sub(goalPos, node.pos), goalSpring.stiffness),
      1 / node.mass
    );

    // Integrate acceleration into momentum.
    node.momentum = add(node.momentum, goalVector);
  }
};
