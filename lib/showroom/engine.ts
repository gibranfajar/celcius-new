import * as THREE from "three";
import { gsap } from "gsap";
import { createLook, LOOK_HEIGHT, type LookModel } from "./look";
import {
  MEAN_RX,
  gridPlacements,
  showcaseFit,
  showcasePlacement,
  stepFor,
  type Placement,
} from "./layout";

export type LayoutMode = "showcase" | "grid";

export interface ShowroomEvents {
  /** A look was clicked / tapped. */
  onSelect?: (index: number) => void;
}

export interface Showroom {
  /** Pause / resume pointer interaction (e.g. while a detail panel is open). */
  setInteractive(on: boolean): void;
  /** Slide the whole scene aside so a side panel does not cover it. */
  setPanelOpen(open: boolean): void;
  /** Animate every look to the requested layout (single scene, no remount). */
  setLayout(mode: LayoutMode, animate?: boolean): void;
  /** Step the carousel by whole looks (showcase mode only). */
  step(direction: 1 | -1): void;
  /**
   * Turn the carousel to a position along the looks: 0 is the first look in
   * front, 1 the second, 1.5 halfway between them (showcase mode only).
   */
  follow(position: number): void;
  /**
   * Like follow, but turns there smoothly. While it turns, follow calls for
   * the same position (the page catching up) don't cut it short.
   */
  glideTo(position: number): void;
  dispose(): void;
}

interface Slot {
  /** Animated by GSAP / the layout. Origin = centre of the body. */
  group: THREE.Group;
  human: LookModel;
  /** 0 = floating showcase, 1 = grid (tweened per look by GSAP). */
  blend: { v: number };
  /** Stored coordinates for the grid mode (recomputed on resize). */
  grid: Placement;
}

const FOV = 30;
const CAM_DIST = 13;
const CAM_SHOWCASE = new THREE.Vector3(0, 1.5, CAM_DIST);
const LOOK_SHOWCASE = new THREE.Vector3(0, 0.1, 0);
const CAM_GRID = new THREE.Vector3(0, 0, CAM_DIST);
const LOOK_GRID = new THREE.Vector3(0, 0, 0);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const BODY_CENTRE = LOOK_HEIGHT / 2;

export function createShowroom(
  container: HTMLElement,
  /** The full-body cut-out of each look, in showroom order. */
  images: string[],
  initial: LayoutMode = "showcase",
  events: ShowroomEvents = {},
): Showroom {
  const COUNT = images.length;
  const STEP = stepFor(COUNT);

  // ---- renderer / scene -----------------------------------------------------
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  // A full-screen canvas redrawn every frame: past 1.5x the extra pixels
  // cost the GPU far more than they add to soft photo cut-outs.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcfd3da, 16, 34);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

  // The looks are unlit photo cut-outs, so the scene needs no lights.

  // ---- one persistent instance per look --------------------------------------
  const slots: Slot[] = images.map((image, i) => {
    const human = createLook(image, i * 1.37, renderer);
    human.root.position.y = -BODY_CENTRE; // pivot the slot around the body centre
    const group = new THREE.Group();
    group.add(human.root);
    scene.add(group);
    return {
      group,
      human,
      blend: { v: initial === "grid" ? 1 : 0 },
      grid: { x: 0, y: 0, z: 0, s: 1, yaw: 0 },
    };
  });

  // ---- shared state ----------------------------------------------------------
  const carousel = { rot: 0 };
  const cam = { v: initial === "grid" ? 1 : 0 };
  const shift = { v: 0 }; // world units the camera slides sideways
  let interactive = true;
  let target: LayoutMode = initial;
  let width = 1;
  let height = 1;
  let aspect = 1;
  let fit: ReturnType<typeof showcaseFit> = { x: 1, s: 1, fadeBelow: null };

  // Visible size of the z = 0 plane when the camera sits at its grid position.
  const planeH = () => 2 * CAM_DIST * Math.tan(THREE.MathUtils.degToRad(FOV / 2));

  function relayout() {
    aspect = width / Math.max(height, 1);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    fit = showcaseFit(aspect, planeH(), COUNT);
    const g = gridPlacements(COUNT, planeH() * aspect, planeH());
    slots.forEach((s, i) => (s.grid = g[i]));
  }

  function resize() {
    const r = container.getBoundingClientRect();
    width = Math.max(r.width, 1);
    height = Math.max(r.height, 1);
    renderer.setSize(width, height, false);
    relayout();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // Drawing a frame nobody sees still costs a full-screen render, which
  // starves the rest of the page while it scrolls: skip it off screen.
  let onScreen = true;
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
  });
  io.observe(container);

  // ---- per-frame: write transforms straight onto the 3D objects --------------
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();

  function frame(time: number) {
    if (!onScreen) return;

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const m = slot.blend.v;
      const a = showcasePlacement(i, COUNT, carousel.rot, fit);
      const b = slot.grid;
      const bob = Math.sin(time * 0.8 + i * 1.3) * 0.12 * (1 - m);
      const lift = Math.sin(Math.PI * m) * 0.25; // soft arc while travelling
      slot.group.position.set(
        lerp(a.x, b.x, m),
        lerp(a.y, b.y, m) + bob + lift,
        lerp(a.z, b.z, m),
      );
      slot.group.scale.setScalar(lerp(a.s, b.s, m));
      slot.group.rotation.y = lerp(a.yaw, b.yaw, m);
      // the grid always shows every look
      slot.human.setOpacity(lerp(a.o ?? 1, 1, m));
      slot.human.update(time);
    }

    camPos.lerpVectors(CAM_SHOWCASE, CAM_GRID, cam.v);
    camLook.lerpVectors(LOOK_SHOWCASE, LOOK_GRID, cam.v);
    camPos.x += shift.v;
    camLook.x += shift.v;
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    renderer.render(scene, camera);
  }
  const tick = (time: number) => frame(time);
  gsap.ticker.add(tick);

  // ---- transformation --------------------------------------------------------
  const blends = slots.map((s) => s.blend);

  function setLayout(mode: LayoutMode, animate = true) {
    target = mode;
    const toGrid = mode === "grid";
    gsap.killTweensOf(blends);
    gsap.killTweensOf(cam);
    gsap.killTweensOf(carousel);

    // Back at the first look in front, so the floating composition is restored.
    const home = Math.round(carousel.rot / (Math.PI * 2)) * Math.PI * 2;

    if (!animate) {
      blends.forEach((b) => (b.v = toGrid ? 1 : 0));
      cam.v = toGrid ? 1 : 0;
      if (toGrid) carousel.rot = home;
      return;
    }

    gsap.to(blends, {
      v: toGrid ? 1 : 0,
      duration: 1.5,
      ease: "power3.inOut",
      stagger: { each: 0.04, from: 0 },
      overwrite: true,
    });
    gsap.to(cam, {
      v: toGrid ? 1 : 0,
      duration: 1.7,
      ease: "power3.inOut",
    });
    if (toGrid) {
      gsap.to(carousel, { rot: home, duration: 1.5, ease: "power3.inOut" });
    }
  }
  if (initial === "grid") carousel.rot = 0;

  // ---- carousel: drag + keyboard ---------------------------------------------
  const el = renderer.domElement;
  let dragging = false;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0; // radians / second

  const worldPerPx = () => (planeH() * aspect) / width;

  function snap(extra = 0) {
    const goal = Math.round((carousel.rot + extra) / STEP) * STEP;
    gsap.to(carousel, {
      rot: goal,
      duration: 0.95,
      ease: "power3.out",
      overwrite: true,
    });
  }

  // ---- picking (alpha-aware, so empty space around a person is not clickable)
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pick(clientX: number, clientY: number): number {
    const r = el.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const meshes = slots.map((s) => s.human.figure);
    const hits = raycaster.intersectObjects(meshes, false); // nearest first
    for (const h of hits) {
      const i = meshes.indexOf(h.object as THREE.Mesh);
      const human = slots[i].human;
      if (h.uv && h.object.visible && human.opacity > 0.5 && human.isSolidAt(h.uv)) return i;
    }
    return -1;
  }

  const baseCursor = () => (!interactive ? "default" : target === "showcase" ? "grab" : "default");

  /** Rotate the carousel so look `i` is in front, by the shortest way. */
  function bringToFront(i: number) {
    const full = Math.PI * 2;
    const want = -i * STEP;
    const goal = want + Math.round((carousel.rot - want) / full) * full;
    gsap.to(carousel, { rot: goal, duration: 0.9, ease: "power3.inOut", overwrite: true });
  }

  let downX = 0;
  let downY = 0;
  let downT = 0;
  let travelled = 0;

  function onDown(e: PointerEvent) {
    if (!interactive) return;
    downX = e.clientX;
    downY = e.clientY;
    downT = performance.now();
    travelled = 0;
    if (target !== "showcase") return;
    dragging = true;
    lastX = e.clientX;
    lastT = downT;
    velocity = 0;
    gsap.killTweensOf(carousel);
    el.setPointerCapture(e.pointerId);
  }
  function onMove(e: PointerEvent) {
    if (!dragging) {
      if (interactive && e.buttons === 0) {
        el.style.cursor = pick(e.clientX, e.clientY) >= 0 ? "pointer" : baseCursor();
      }
      return;
    }
    travelled = Math.max(travelled, Math.hypot(e.clientX - downX, e.clientY - downY));
    if (travelled > 6) el.style.cursor = "grabbing";
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dTheta = (dx * worldPerPx()) / (MEAN_RX * fit.x);
    carousel.rot += dTheta;
    const dt = Math.max((now - lastT) / 1000, 0.001);
    velocity = lerp(velocity, dTheta / dt, 0.4);
    lastX = e.clientX;
    lastT = now;
  }
  function onUp(e: PointerEvent) {
    if (!interactive) return;
    const wasDragging = dragging;
    dragging = false;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);

    const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
    const isClick = e.type === "pointerup" && moved < 6 && performance.now() - downT < 600;
    if (isClick) {
      const i = pick(e.clientX, e.clientY);
      if (i >= 0) {
        if (target === "showcase") bringToFront(i);
        events.onSelect?.(i);
        el.style.cursor = "pointer";
        return;
      }
    }
    el.style.cursor = baseCursor();
    if (wasDragging) snap(Math.max(Math.min(velocity, 6), -6) * 0.18);
  }

  // A sideways trackpad swipe turns the carousel. Up/down scrolling is left
  // alone, so the page still scrolls past the showroom.
  let wheelSnap: gsap.core.Tween | null = null;
  function onWheel(e: WheelEvent) {
    if (!interactive || target !== "showcase") return;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    gsap.killTweensOf(carousel);
    const delta = e.deltaX;
    const unit = e.deltaMode === 1 ? 16 : 1; // lines -> px
    carousel.rot -= (delta * unit * 0.0016) * (STEP / 0.7);
    wheelSnap?.kill();
    wheelSnap = gsap.delayedCall(0.16, () => snap());
  }
  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  el.style.touchAction = "pan-y";
  el.style.cursor = baseCursor();

  /** The angle for `position`, on the nearest turn to where the carousel is. */
  function angleFor(position: number) {
    const full = Math.PI * 2;
    const want = -position * STEP;
    return want + Math.round((carousel.rot - want) / full) * full;
  }

  let glide: gsap.core.Tween | null = null;
  let glideTarget = NaN;

  function follow(position: number) {
    if (target !== "showcase" || dragging) return;
    if (glide?.isActive() && Math.abs(position - glideTarget) < 0.01) return;
    glide = null;
    // set straight away, so the carousel moves exactly with the page
    gsap.killTweensOf(carousel);
    carousel.rot = angleFor(position);
  }

  function glideTo(position: number) {
    if (target !== "showcase") return;
    glideTarget = position;
    glide = gsap.to(carousel, {
      rot: angleFor(position),
      duration: 0.9,
      ease: "power3.out",
      overwrite: true,
    });
  }

  function step(direction: 1 | -1) {
    if (!interactive || target !== "showcase") return;
    const goal = Math.round(carousel.rot / STEP) * STEP + direction * STEP;
    gsap.to(carousel, {
      rot: goal,
      duration: 0.9,
      ease: "power3.inOut",
      overwrite: true,
    });
  }

  const setLayoutWithCursor = (mode: LayoutMode, animate?: boolean) => {
    setLayout(mode, animate);
    el.style.cursor = baseCursor();
  };

  return {
    setLayout: setLayoutWithCursor,
    step,
    follow,
    glideTo,
    setInteractive(on: boolean) {
      interactive = on;
      if (!on) {
        dragging = false;
        wheelSnap?.kill();
      }
      el.style.cursor = baseCursor();
    },
    setPanelOpen(open: boolean) {
      // Only slide aside on wide screens where the panel sits next to the scene.
      const w = open && aspect > 1.15 ? planeH() * aspect * 0.12 : 0;
      gsap.to(shift, { v: w, duration: 0.9, ease: "power3.inOut", overwrite: true });
    },
    dispose() {
      gsap.ticker.remove(tick);
      gsap.killTweensOf(blends);
      gsap.killTweensOf(cam);
      gsap.killTweensOf(carousel);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      wheelSnap?.kill();
      gsap.killTweensOf(shift);
      slots.forEach((s) => s.human.dispose());
      renderer.dispose();
      el.remove();
    },
  };
}
