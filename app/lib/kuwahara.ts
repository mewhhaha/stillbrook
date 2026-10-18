const vertexSource = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Four overlapping regions: https://smil.cmm.minesparis.psl.eu/doc/group___addon_kuwahara_filter.html
const fragmentSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D image;
uniform vec2 stepSize;
uniform int radius;
varying vec2 uv;
vec4 region(vec2 direction) {
  vec3 sum = vec3(0.0);
  vec3 squares = vec3(0.0);
  float weight = 0.0;
  for (int y = 0; y <= 4; y++) {
    for (int x = 0; x <= 4; x++) {
      if (x <= radius && y <= radius) {
        vec4 sampleColor = texture2D(image, uv + vec2(float(x), float(y)) * direction * stepSize);
        sum += sampleColor.rgb * sampleColor.a;
        squares += sampleColor.rgb * sampleColor.rgb * sampleColor.a;
        weight += sampleColor.a;
      }
    }
  }
  vec3 mean = sum / max(weight, 0.0001);
  vec3 variance = max(squares / max(weight, 0.0001) - mean * mean, vec3(0.0));
  if (weight == 0.0) return vec4(mean, 4.0);
  return vec4(mean, variance.r + variance.g + variance.b);
}
void main() {
  float alpha = texture2D(image, uv).a;
  if (alpha == 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec4 best = region(vec2(-1.0, -1.0));
  vec4 candidate = region(vec2(1.0, -1.0));
  if (candidate.a < best.a) best = candidate;
  candidate = region(vec2(-1.0, 1.0));
  if (candidate.a < best.a) best = candidate;
  candidate = region(vec2(1.0, 1.0));
  if (candidate.a < best.a) best = candidate;
  gl_FragColor = vec4(best.rgb, alpha);
}`;

type Renderer = {
  gl: WebGLRenderingContext;
  texture: WebGLTexture;
  stepSize: WebGLUniformLocation | null;
  radius: WebGLUniformLocation | null;
};

let surface: HTMLCanvasElement | undefined;
let renderer: Renderer | undefined;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function getRenderer() {
  if (renderer && !renderer.gl.isContextLost()) return renderer;
  if (!surface) {
    surface = document.createElement("canvas");
    surface.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      renderer = undefined;
    });
    surface.addEventListener("webglcontextrestored", () => {
      renderer = undefined;
    });
  }
  const gl = surface.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl || gl.isContextLost()) return undefined;
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  let ready = false;
  try {
    if (!vertex || !fragment || !program || !buffer || !texture) return undefined;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    renderer = { gl, texture, stepSize: gl.getUniformLocation(program, "stepSize"), radius: gl.getUniformLocation(program, "radius") };
    ready = true;
    return renderer;
  } finally {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    if (!ready) {
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    }
  }
}

/** Paint once; callers keep the source image visible when WebGL or image access fails. */
export function renderKuwahara(image: HTMLImageElement, target: HTMLCanvasElement): boolean {
  if (!image.complete || !image.naturalWidth || !image.naturalHeight) return false;
  const bounds = image.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) return false;
  try {
    const state = getRenderer();
    const output = target.getContext("2d");
    if (!state || !surface || !output) return false;
    const { gl, texture } = state;
    const density = Math.min(window.devicePixelRatio || 1, 1.5);
    const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight), Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight) * density);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    if (surface.width !== width) surface.width = width;
    if (surface.height !== height) surface.height = height;
    gl.viewport(0, 0, width, height);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform2f(state.stepSize, 1 / width, 1 / height);
    const radius = Math.max(1, Math.min(4, Math.round(Math.max(width, height) / 200)));
    gl.uniform1i(state.radius, radius);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (gl.isContextLost() || gl.getError() !== gl.NO_ERROR) return false;
    target.width = width;
    target.height = height;
    output.drawImage(surface, 0, 0);
    return true;
  } catch {
    return false;
  }
}
