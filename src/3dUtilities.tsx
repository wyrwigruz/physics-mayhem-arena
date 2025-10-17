function getTransformationMatrix(
  aspect: number,
  rotation: number
): Float32Array {
  const projectionMatrix = perspective(Math.PI / 4, aspect, 0.1, 100);
  const viewMatrix = lookAt([0, 0, 5], [0, 0, 0], [0, 1, 0]);
  const modelMatrix = rotateY(rotateX(identity(), rotation), rotation * 0.7);

  return multiply(multiply(projectionMatrix, viewMatrix), modelMatrix);
}

// Matrix math helper functions
function identity(): Float32Array {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const result = new Float32Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i * 4 + j] =
        a[i * 4 + 0] * b[0 * 4 + j] +
        a[i * 4 + 1] * b[1 * 4 + j] +
        a[i * 4 + 2] * b[2 * 4 + j] +
        a[i * 4 + 3] * b[3 * 4 + j];
    }
  }
  return result;
}

function perspective(
  fov: number,
  aspect: number,
  near: number,
  far: number
): Float32Array {
  const f = 1.0 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0,
  ]);
}

function lookAt(eye: number[], center: number[], up: number[]): Float32Array {
  const z = normalize([
    eye[0] - center[0],
    eye[1] - center[1],
    eye[2] - center[2],
  ]);
  const x = normalize(cross(up, z));
  const y = cross(z, x);

  return new Float32Array([
    x[0],
    y[0],
    z[0],
    0,
    x[1],
    y[1],
    z[1],
    0,
    x[2],
    y[2],
    z[2],
    0,
    -dot(x, eye),
    -dot(y, eye),
    -dot(z, eye),
    1,
  ]);
}

function rotateX(m: Float32Array, angle: number): Float32Array {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const rotation = new Float32Array([
    1,
    0,
    0,
    0,
    0,
    c,
    s,
    0,
    0,
    -s,
    c,
    0,
    0,
    0,
    0,
    1,
  ]);
  return multiply(m, rotation);
}

function rotateY(m: Float32Array, angle: number): Float32Array {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const rotation = new Float32Array([
    c,
    0,
    -s,
    0,
    0,
    1,
    0,
    0,
    s,
    0,
    c,
    0,
    0,
    0,
    0,
    1,
  ]);
  return multiply(m, rotation);
}

function normalize(v: number[]): number[] {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return [v[0] / len, v[1] / len, v[2] / len];
}

function cross(a: number[], b: number[]): number[] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot(a: number[], b: number[]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
