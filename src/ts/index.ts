import type { Vec2 } from "@geomm/api";
import { appendEl, createEl } from "@geomm/dom";
import {
  PI,
  SQRT2,
  TWO_PI,
  add,
  cos,
  distance,
  floor,
  randRange,
  random,
  rotate,
  scale,
  sin,
  sub,
  vec2,
} from "@geomm/maths";
import { boundaryCollideExternal, createNode, type Spring } from "./node";
import {
  type SoftBody,
  calculateAttributes,
  calculateSurface,
  collideObject,
  createSoftBody,
  dampUpdateBoundary,
  integrateForces,
  resetAttributes,
} from "./softbody";
import { aabb } from "@geomm/geometry";

const { clientWidth: width, clientHeight: height } = document.documentElement;
const SIZE = vec2(width, height);
const GRAVITY = vec2(0, 0.01);
const BOUNDARY_FRICTION = 0.6; // Damping of momentum on collision with boundary.
const COLLISON_DAMPING = 0.7; // Damping of momentum on collision with object.
const COLLISION_FORCE = 100; // Magnitude of force repeling softbody nodes on collision.
const MOUSE_PULL = 0.0001; // Strength of mouse force.
const DAMP = 0.1; // SOFtbody node damping.
const STIFF = 0.1; // Softbody spring stiffness.
const MASS = 10; // SOFTBody node mass.
const N_BODIES = 6;

let mousePos = vec2(0, 0);
let mouseDown = false;
let bounds = aabb(vec2(SIZE.x / 2, SIZE.y / 2), SIZE.x / 2, SIZE.y / 2);

const obs = aabb(vec2(SIZE.x / 2, SIZE.y / 2), 300, 100);
const OBS_THICK = 10;

let c: HTMLCanvasElement | undefined;
let ctx: CanvasRenderingContext2D | undefined;

const init = () => {
  c = createEl("canvas", {
    width: SIZE.x,
    height: SIZE.y,
  }) as HTMLCanvasElement;
  ctx = c.getContext("2d") as CanvasRenderingContext2D;
  const parent = document.getElementById("background") as HTMLElement;
  if (!parent) return false;
  appendEl(c, parent);
  handleResize();
  return true;
};
// Function to create a square softbody.
const createCircle = (
  damping: number,
  mass: number,
  stiffness: number,
  node_count: number,
  size: number,
  position: Vec2,
  radius: number,
  color: string
) => {
  // Create empty array for the nodes.
  const nodes = new Array(node_count);
  const inc = TWO_PI / nodes.length;
  for (let i = 0; i < nodes.length; i++) {
    const springs: Spring[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i != j) {
        // Create a spring from each node to every other node.
        springs.push({ idx: j, length: 0, stiffness });
      }
      const p = add(
        vec2(cos(inc * i) * radius, sin(inc * i) * radius),
        position
      );
      nodes[i] = createNode({ pos: p, mass, damping, springs });
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const currentNode = nodes[i];
    const springs = currentNode.springs;
    for (let j = 0; j < springs.length; j++) {
      const spring = springs[j];
      const d = distance(currentNode.pos, nodes[spring.idx].pos);
      spring.length = d;
      spring.stiffness = (spring.stiffness / d) * SQRT2 * size;
    }
  }

  return createSoftBody(nodes, color);
};

// Function to create a square softbody.
const createSquare = (
  damping: number,
  mass: number,
  stiffness: number,
  node_count: number,
  size: number,
  position: Vec2,
  rotation: number,
  color: string
) => {
  // Create empty array for the nodes.
  const nodes = new Array(node_count);
  for (let i = 0; i < nodes.length; i++) {
    const springs: Spring[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i != j) {
        // Create a spring from each node to every other node.
        springs.push({ idx: j, length: 0, stiffness });
      }
    }

    /* Create a vector based on the size of the square,
    move it up or down to generate points on a side of the square,
    and rotate it when generating a different side. */
    const normal = vec2(size / 2, 0);
    const scalar = (4 * i) / nodes.length;
    const y = (scalar % 1) * size - size / 2;
    const side = (PI / 2) * floor(scalar % 4);
    const p = add(rotate(add(normal, vec2(0, y)), side + rotation), position);

    // Create and add a node to the softbody nodes array.
    nodes[i] = createNode({ pos: p, mass, damping, springs });
  }

  /* return nodes */

  /* Loop over springs and alter stiffness and
  length based on the points they're attached to.

  Implementing softbody goals would be a better approach,
  but is beyond the scope of this project. */
  for (let i = 0; i < nodes.length; i++) {
    const currentNode = nodes[i];
    const springs = currentNode.springs;
    for (let j = 0; j < springs.length; j++) {
      const spring = springs[j];
      const d = distance(currentNode.pos, nodes[spring.idx].pos);
      spring.length = d;
      spring.stiffness = (spring.stiffness / d) * SQRT2 * size;
    }
  }

  return createSoftBody(nodes, color);
};

const createFixedSquare = (position: Vec2, width: number, height: number) => {
  return {
    pos: position,
    width,
    height,
    aabb: aabb(position, width / 2, height / 2),
  };
};

const bodies: SoftBody[] = [];
for (let i = 0; i < N_BODIES; i++) {
  const body = createCircle(
    DAMP,
    MASS,
    STIFF,
    32,
    200,
    vec2(randRange(0, SIZE.x), randRange(100, 120)),
    random() * 100 + 50,
    `#${floor(random() * 16777215).toString(16)}`
  );

  bodies.push(body);
}

const drawBody = (
  ctx: CanvasRenderingContext2D,
  sb: SoftBody,
  {
    fill = true,
    points = false,
    normals = false,
  }: { fill?: boolean; points?: boolean; normals?: boolean } = {}
) => {
  ctx.fillStyle = sb.color;
  if (fill) {
    ctx.beginPath();
    ctx.moveTo(sb.nodes[0].pos.x, sb.nodes[0].pos.y);
    for (let i = 1; i < sb.nodes.length; i++) {
      ctx.lineTo(sb.nodes[i].pos.x, sb.nodes[i].pos.y);
    }
    ctx.closePath();
    ctx.fill();
  }
  if (points) {
    for (let i = 0; i < sb.nodes.length; i++) {
      const node = sb.nodes[i];
      ctx.beginPath();
      ctx.arc(node.pos.x, node.pos.y, 2, 0, PI * 2);
      ctx.closePath();
      ctx.fill();
    }
  }
  if (normals) {
    for (let i = 0; i < sb.nodes.length; i++) {
      const { pos } = sb.nodes[i];
      const radius = sb.radii[i];
      const normal = add(pos, scale(sb.normals[i], radius / 2));
      ctx.strokeStyle = "#f00";
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(normal.x, normal.y);
      ctx.closePath();
      ctx.stroke();
    }
  }
};

const updateBody = (sb: SoftBody, bodies: SoftBody[]) => {
  const mouseForce = mouseDown
    ? scale(sub(mousePos, sb.pos), MOUSE_PULL)
    : vec2(0, 0);

  sb.externalForce = add(sb.externalForce, GRAVITY);
  sb.externalForce = add(sb.externalForce, mouseForce);

  integrateForces(sb);
  resetAttributes(sb);
  calculateAttributes(sb);
  calculateSurface(sb);
  for (let i = 0; i < sb.nodes.length; i++) {
    const currentNode = sb.nodes[i];
    boundaryCollideExternal(currentNode, BOUNDARY_FRICTION, obs, OBS_THICK);
  }
  dampUpdateBoundary(sb, BOUNDARY_FRICTION, bounds);

  for (let i = 0; i < bodies.length; i++) {
    const other = bodies[i];
    if (other != sb) {
      collideObject(sb, other, COLLISON_DAMPING, COLLISION_FORCE);
    }
  }
};

const drawAABB = (ctx: CanvasRenderingContext2D, aabb: AABB, offset = 0) => {
  const { center, halfWidth, halfHeight } = aabb;
  ctx.strokeStyle = "#f00";
  ctx.beginPath();
  ctx.moveTo(center.x - halfWidth + offset, center.y - halfHeight + offset);
  ctx.lineTo(center.x + halfWidth - offset, center.y - halfHeight + offset);
  ctx.lineTo(center.x + halfWidth - offset, center.y + halfHeight - offset);
  ctx.lineTo(center.x - halfWidth + offset, center.y + halfHeight - offset);
  ctx.closePath();
  ctx.stroke();
};

const step = () => {
  ctx.clearRect(0, 0, SIZE.x, SIZE.y);

  bodies.forEach((body) => {
    updateBody(body, bodies);
    drawAABB(ctx, obs);
    drawAABB(ctx, obs, OBS_THICK);
    drawBody(ctx, body, { fill: true, points: false, normals: false });
  });

  requestAnimationFrame(step);
};

window.addEventListener("resize", () => {
  const { clientWidth: width, clientHeight: height } = document.documentElement;
  SIZE.x = width;
  SIZE.y = height;
  c.width = SIZE.x;
  c.height = SIZE.y;
});

window.addEventListener("click", () => requestAnimationFrame(step));

window.addEventListener("mousemove", (e) => {
  mousePos = vec2(e.clientX, e.clientY);
});

window.addEventListener("mousedown", () => {
  mouseDown = true;
});

window.addEventListener("mouseup", () => {
  mouseDown = false;
});

const handleResize = () => {
  const { clientWidth: width, clientHeight: height } = document.documentElement;
  SIZE.x = width;
  SIZE.y = height;
  bounds = aabb(vec2(SIZE.x / 2, SIZE.y / 2), SIZE.x / 2, SIZE.y / 2);
};

window.addEventListener("resize", () => handleResize());

const getScreenHeight = () => {
  const body = document.body;
  const html = document.documentElement;

  const height = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );

  return height;
};

const colorA = [30, 30, 30];
const colorB = [90, 90, 90];

window.addEventListener("scroll", () => {
  const height = getScreenHeight();
  const scroll = window.scrollY;
  const maxScroll = height - SIZE.y;
  GRAVITY.y = (0.5 - scroll / maxScroll) * 0.05;

  const color = colorA.map((c, i) => {
    const diff = colorB[i] - c;
    const ratio = scroll / maxScroll;
    return floor(c + diff * ratio);
  });
  const rgb = `rgb(${color.map((c) => c.toString()).join(", ")})`;
  document.body.style.backgroundColor = rgb;
});

init() && requestAnimationFrame(step);
