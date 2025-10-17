import { StyleSheet, PixelRatio } from "react-native";
import { Canvas, useCanvasEffect } from "react-native-wgpu";

export function MainScene() {
  const ref = useCanvasEffect(async () => {
    console.log("Initializing WebGPU...");

    // Setup WebGPU
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      console.error("No WebGPU adapter found");
      return;
    }

    const device = await adapter.requestDevice();
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    const context = ref.current!.getContext("webgpu")!;
    const canvas = context.canvas as HTMLCanvasElement;

    // Set canvas size with pixel ratio
    canvas.width = canvas.clientWidth * PixelRatio.get();
    canvas.height = canvas.clientHeight * PixelRatio.get();

    console.log("Canvas size:", canvas.width, "x", canvas.height);
    console.log("Client size:", canvas.clientWidth, "x", canvas.clientHeight);
    console.log("Pixel ratio:", PixelRatio.get());

    if (canvas.width === 0 || canvas.height === 0) {
      console.error("Canvas has zero dimensions!");
      return;
    }

    context.configure({
      device,
      format: presentationFormat,
      alphaMode: "opaque",
    });

    // Generate sphere geometry
    const generateSphere = (radius: number, segments: number) => {
      const vertices: number[] = [];
      const indices: number[] = [];

      // Generate vertices
      for (let lat = 0; lat <= segments; lat++) {
        const theta = (lat * Math.PI) / segments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= segments; lon++) {
          const phi = (lon * 2 * Math.PI) / segments;
          const sinPhi = Math.sin(phi);
          const cosPhi = Math.cos(phi);

          const x = cosPhi * sinTheta;
          const y = cosTheta;
          const z = sinPhi * sinTheta;

          // Position
          vertices.push(x * radius, y * radius, z * radius);

          // Color (based on position, creating a gradient)
          const r = (x + 1) * 0.5;
          const g = (y + 1) * 0.5;
          const b = (z + 1) * 0.5;
          vertices.push(r, g, b);
        }
      }

      // Generate indices
      for (let lat = 0; lat < segments; lat++) {
        for (let lon = 0; lon < segments; lon++) {
          const first = lat * (segments + 1) + lon;
          const second = first + segments + 1;

          indices.push(first, second, first + 1);
          indices.push(second, second + 1, first + 1);
        }
      }

      return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices),
      };
    };

    const sphere = generateSphere(0.5, 20);
    const vertices = sphere.vertices;
    const indices = sphere.indices;
    const indexCount = indices.length;

    // Create vertex buffer
    const vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: 0x20 | 0x8, // VERTEX | COPY_DST
    });
    device.queue.writeBuffer(vertexBuffer, 0, vertices);

    // Create index buffer
    const indexBuffer = device.createBuffer({
      size: indices.byteLength,
      usage: 0x10 | 0x8, // INDEX | COPY_DST
    });
    device.queue.writeBuffer(indexBuffer, 0, indices);

    // Shader code - simple pass-through for testing
    const shaderCode = `
      struct VertexInput {
        @location(0) position : vec3<f32>,
        @location(1) color : vec3<f32>,
      }

      struct VertexOutput {
        @builtin(position) position : vec4<f32>,
        @location(0) color : vec3<f32>,
      }

      @vertex
      fn vertexMain(input : VertexInput) -> VertexOutput {
        var output : VertexOutput;
        output.position = vec4<f32>(input.position, 1.0);
        output.color = input.color;
        return output;
      }

      @fragment
      fn fragmentMain(input : VertexOutput) -> @location(0) vec4<f32> {
        return vec4<f32>(input.color, 1.0);
      }
    `;

    // Create shader module
    const shaderModule = device.createShaderModule({ code: shaderCode });

    // Create pipeline
    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: 24, // 6 floats per vertex (3 position + 3 color)
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format: "float32x3",
              },
              {
                shaderLocation: 1,
                offset: 12,
                format: "float32x3",
              },
            ],
          },
        ],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [{ format: presentationFormat }],
      },
      primitive: {
        topology: "triangle-list",
        cullMode: "none", // Disable culling for testing
      },
    });

    console.log("Setup complete, starting render loop...");

    let frameCount = 0;

    // Render function for animation loop
    const render = () => {
      try {
        frameCount++;

        // Create command encoder
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        // Render pass
        const renderPass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: textureView,
              clearValue: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });

        renderPass.setPipeline(pipeline);
        renderPass.setVertexBuffer(0, vertexBuffer);
        renderPass.setIndexBuffer(indexBuffer, "uint16");
        renderPass.drawIndexed(indexCount); // Draw only 3 indices (the triangle)
        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);
        context.present();

        requestAnimationFrame(render);
      } catch (error) {
        console.error("Render error:", error);
      }
    };

    // Start animation loop
    console.log("Starting first render...");
    render();
  });

  return <Canvas ref={ref} style={styles.canvas} />;
}

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

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
