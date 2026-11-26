import * as THREE from "three";

/** World height of every look (feet at y = 0 inside the look's root). */
export const LOOK_HEIGHT = 1.8;

/**
 * The image through Next's image optimizer, which serves it from this site's
 * own origin. WebGL can only use an image from another origin when that
 * server allows it (CORS), which the backend's storage may not; the
 * optimizer keeps the transparency (WebP/PNG).
 */
function sameOriginImage(url: string): string {
  if (url.startsWith("/")) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=1080&q=90`;
}

const SEGMENTS = 14; // vertical subdivisions, used for the idle sway

export interface LookModel {
  /** Root group, origin at the feet centre, facing +Z. */
  root: THREE.Group;
  /** The textured plane (used for picking). */
  figure: THREE.Mesh;
  /** True when the pixel under `uv` is part of the person, not transparent. */
  isSolidAt(uv: THREE.Vector2): boolean;
  /** Advance the idle animation. `t` is in seconds. */
  update(t: number): void;
  /** Fade the look (and its shadow) in or out: 0 hidden .. 1 solid. */
  setOpacity(opacity: number): void;
  /** The current opacity; a look that is mostly faded can't be clicked. */
  readonly opacity: number;
  dispose(): void;
}

function softShadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(0,0,0,0.55)");
  g.addColorStop(0.55, "rgba(0,0,0,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * One persistent, upright full-body figure built from a transparent cut-out.
 * The plane is subdivided so the idle animation can sway the upper body while
 * the feet stay planted.
 */
export function createLook(
  imageUrl: string,
  phase: number,
  renderer: THREE.WebGLRenderer,
): LookModel {
  const root = new THREE.Group();
  const disposables: { dispose(): void }[] = [];

  // geometry: unit width, height LOOK_HEIGHT, origin at the bottom centre
  const geo = new THREE.PlaneGeometry(1, LOOK_HEIGHT, 1, SEGMENTS);
  geo.translate(0, LOOK_HEIGHT / 2, 0);
  disposables.push(geo);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const baseX = Float32Array.from({ length: pos.count }, (_, i) => pos.getX(i));

  const mat = new THREE.MeshBasicMaterial({
    transparent: true,
    alphaTest: 0.04,
    toneMapped: false, // keep the photo colours untouched
  });
  disposables.push(mat);

  const figure = new THREE.Mesh(geo, mat);
  figure.visible = false; // until the texture is ready: no pop of a white card
  let loaded = false;
  let opacity = 1;
  figure.frustumCulled = false;
  root.add(figure);

  const shadowTex = softShadowTexture();
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.8,
  });
  const shadowGeo = new THREE.PlaneGeometry(1, 1);
  disposables.push(shadowTex, shadowMat, shadowGeo);
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.004;
  shadow.renderOrder = -1;
  root.add(shadow);

  let disposed = false;
  let width = 0.7;
  let alpha: { data: Uint8ClampedArray; w: number; h: number } | null = null;
  const onTexture = (tex: THREE.Texture) => {
    if (disposed) {
      tex.dispose();
      return;
    }
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    mat.map = tex;
    mat.needsUpdate = true;
    disposables.push(tex);

    const img = tex.image as { width: number; height: number };
    width = (img.width / img.height) * LOOK_HEIGHT;
    figure.scale.x = width;
    shadow.scale.set(Math.max(width * 1.5, 0.9), 0.9, 1);
    loaded = true;
    figure.visible = opacity > 0.01;

    // Keep the alpha channel around so clicks on empty space pass through.
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(tex.image as CanvasImageSource, 0, 0);
      alpha = {
        data: ctx.getImageData(0, 0, c.width, c.height).data,
        w: c.width,
        h: c.height,
      };
    }
  };

  // The image is fetched through this site (see sameOriginImage) so WebGL
  // may use it; if that fails, straight from its own address.
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  loader.load(sameOriginImage(imageUrl), onTexture, undefined, () => {
    if (!disposed) loader.load(imageUrl, onTexture);
  });

  function isSolidAt(uv: THREE.Vector2) {
    if (!alpha) return false;
    const x = Math.min(alpha.w - 1, Math.max(0, Math.floor(uv.x * alpha.w)));
    const y = Math.min(alpha.h - 1, Math.max(0, Math.floor((1 - uv.y) * alpha.h)));
    return alpha.data[(y * alpha.w + x) * 4 + 3] > 40;
  }

  function update(t: number) {
    const p = phase;
    const sway = Math.sin(t * 0.8 + p);
    const sway2 = Math.sin(t * 1.3 + p * 1.7);
    const breathe = Math.sin(t * 1.6 + p);

    // Weight-shift sway: feet planted, shoulders / head drift sideways.
    for (let i = 0; i < pos.count; i++) {
      const h = pos.getY(i) / LOOK_HEIGHT; // 0 feet .. 1 head
      const k = h * h;
      pos.setX(i, baseX[i] + (sway * 0.018 + sway2 * 0.006) * k);
    }
    pos.needsUpdate = true;

    // breathing (anchored at the feet) + the faintest turn of the body
    figure.scale.y = 1 + breathe * 0.006;
    figure.rotation.y = Math.sin(t * 0.5 + p) * 0.05;
  }
  update(0);

  function setOpacity(next: number) {
    if (next === opacity) return;
    opacity = next;
    mat.opacity = next;
    shadowMat.opacity = 0.8 * next;
    figure.visible = loaded && next > 0.01;
    shadow.visible = next > 0.01;
  }

  return {
    root,
    figure,
    isSolidAt,
    update,
    setOpacity,
    get opacity() {
      return opacity;
    },
    dispose() {
      disposed = true;
      disposables.forEach((d) => d.dispose());
    },
  };
}
