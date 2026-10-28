import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import {
  activeIndex,
  chapterForPanel,
  scrollForOffset,
  scrollLength,
  trackPosition,
} from "./chapter-utils.js";
import { createRailStatus } from "./rail-status.js";

gsap.registerPlugin(ScrollTrigger);

const HORIZONTAL_CLASS = "chapters-horizontal";
const HORIZONTAL_QUERY =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
// "not all and (a) and (b)" negates the whole query, so exactly one condition matches.
const VERTICAL_QUERY = `not all and ${HORIZONTAL_QUERY}`;
// How long the track stops on a project with a capture while the capture scrolls from top to
// bottom, in screens of scroll (1 = 100vh). Projects with a placeholder never stop; a project
// can override it with `pauseScreens` in projects.js.
const CAPTURE_PAUSE_SCREENS = 1;
// Placeholder drift across a panel's pass through the viewport, in % of the layer's width.
const PARALLAX_RANGE = 8;
// The hero's scroll hint glides to Ch.1 with Lenis: 1.2s, ease-in-out (cubic).
const GLIDE = {
  duration: 1.2,
  easing: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
};

// Set only while the horizontal layout (and so Lenis) is active.
let glideToWork = null;

/**
 * Glides to the start of Ch.1 with the page's Lenis instance and calls onComplete when it
 * lands. Returns false when Lenis isn't running (below lg or with reduced motion), so the
 * caller can fall back to native scrolling.
 */
export function scrollToWork(onComplete) {
  if (!glideToWork) return false;
  glideToWork(onComplete);
  return true;
}

export function initChapters(doc = document) {
  const section = doc.querySelector("[data-chapters]");
  const track = section?.querySelector("[data-chapters-track]");
  if (!section || !track) return;

  const root = doc.documentElement;
  const chapters = [...track.querySelectorAll("[data-chapter]")];
  const panels = [...track.querySelectorAll("[data-panel]")];
  const panelCounts = chapters.map(
    (chapter) => chapter.querySelectorAll("[data-panel]").length,
  );
  const total = Number(section.dataset.chapterTotal);
  // set(index) shows "CH.n / total"; set(null) restores "© 2026".
  const rail = createRailStatus(doc.querySelector("[data-rail-status]"), total);

  const mm = gsap.matchMedia();

  mm.add(
    { horizontal: HORIZONTAL_QUERY, vertical: VERTICAL_QUERY },
    ({ conditions }) =>
      conditions.horizontal ? setupHorizontal() : setupVertical(),
  );

  function setupHorizontal() {
    root.classList.add(HORIZONTAL_CLASS);

    const lenis = new Lenis();
    const tick = (time) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const captures = [...track.querySelectorAll("[data-capture]")];
    // One pause per panel, however many captures it holds (Costa Ballena has three screens).
    const pausePanels = [
      ...new Set(captures.map((capture) => capture.closest("[data-panel]"))),
    ];
    const pauseOf = captures.map((capture) =>
      pausePanels.indexOf(capture.closest("[data-panel]")),
    );
    const layers = [...track.querySelectorAll("[data-parallax]")];

    // Offset of an element along the track, unaffected by the track's transform.
    const trackOffset = (element) =>
      element.getBoundingClientRect().left - track.getBoundingClientRect().left;

    // Layout measurements, refreshed whenever ScrollTrigger refreshes (load, resize).
    let geometry;
    const measure = () => {
      const distance = track.scrollWidth - section.clientWidth;
      geometry = {
        distance,
        // The track stops with each capture's panel flush with the section's left edge.
        pauses: pausePanels.map((panel) =>
          Math.min(trackOffset(panel), distance),
        ),
        // A project can set its own length (`pauseScreens` in projects.js).
        pauseLength: window.innerHeight * CAPTURE_PAUSE_SCREENS,
        pauseLengths: pausePanels.map(
          (panel) =>
            window.innerHeight *
            Number(panel.dataset.pauseScreens || CAPTURE_PAUSE_SCREENS),
        ),
        panelOffsets: panels.map(trackOffset),
        // px each capture moves to show its bottom edge in its clipping box. Every capture
        // in a panel shares the pause, so they all reach their bottom at the same time.
        shifts: captures.map((capture) =>
          Math.max(
            capture.offsetHeight - capture.parentElement.clientHeight,
            0,
          ),
        ),
        frames: layers.map(({ parentElement: frame }) => ({
          offset: trackOffset(frame),
          width: frame.offsetWidth,
        })),
      };
    };
    measure();

    const render = (self) => {
      const scrolled = self.scroll() - self.start;
      const { travel, pauses } = trackPosition(scrolled, geometry);
      track.style.transform = `translate3d(${-travel}px, 0, 0)`;

      captures.forEach((capture, index) => {
        const progress = pauses[pauseOf[index]];
        capture.style.transform = `translateY(${-progress * geometry.shifts[index]}px)`;
      });

      // Parallax: each placeholder drifts against its frame, within its 10% overscan, from
      // when the frame enters on the right until it leaves on the left.
      const viewport = section.clientWidth;
      layers.forEach((layer, index) => {
        const { offset, width } = geometry.frames[index];
        const passed = (viewport - (offset - travel)) / (viewport + width);
        const progress = Math.min(Math.max(passed, 0), 1);
        layer.style.transform = `translateX(${(progress * 2 - 1) * PARALLAX_RANGE}%)`;
      });

      // The page ends with Ch.4 on screen, so at progress 1 keep its label.
      if (!self.isActive && self.progress < 1) return rail.set(null);
      const panel = activeIndex(geometry.panelOffsets, travel + viewport / 2);
      rail.set(chapterForPanel(panel, panelCounts));
    };

    const scroll = ScrollTrigger.create({
      trigger: section,
      pin: true,
      start: "top top",
      end: () => `+=${scrollLength(geometry)}`,
      onRefreshInit: measure,
      onRefresh: render,
      onToggle: render,
      onUpdate: render,
    });

    // Keyboard: bring an off-screen panel into view when focus lands inside it.
    const onFocusIn = (event) => {
      const panel = event.target.closest("[data-panel]");
      if (!panel) return;

      const panelRect = panel.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const visible =
        panelRect.left >= sectionRect.left - 1 &&
        panelRect.right <= sectionRect.right + 1;
      if (visible) return;

      const { start, end } = scroll;
      const offset = trackOffset(panel);
      lenis.scrollTo(scrollForOffset({ start, end, offset, ...geometry }), {
        duration: 0.6,
      });
    };

    // +1px: at exactly `start` the trigger isn't active yet and the rail would keep "© 2026".
    glideToWork = (onComplete) =>
      lenis.scrollTo(scroll.start + 1, { ...GLIDE, onComplete });

    const stopScroll = () => lenis.stop();
    const startScroll = () => lenis.start();

    track.addEventListener("focusin", onFocusIn);
    doc.addEventListener("menu:open", stopScroll);
    doc.addEventListener("menu:close", startScroll);

    // gsap.matchMedia reverts the ScrollTrigger and its pin; this undoes the rest.
    return () => {
      [track, ...captures, ...layers].forEach((element) => {
        element.style.transform = "";
      });
      track.removeEventListener("focusin", onFocusIn);
      doc.removeEventListener("menu:open", stopScroll);
      doc.removeEventListener("menu:close", startScroll);
      glideToWork = null;
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      root.classList.remove(HORIZONTAL_CLASS);
      rail.set(null);
    };
  }

  function setupVertical() {
    const triggers = chapters.map((chapter) =>
      ScrollTrigger.create({
        trigger: chapter,
        start: "top center",
        end: "bottom center",
        onToggle: () => {
          const active = triggers.findIndex((trigger) => trigger.isActive);
          rail.set(active === -1 ? null : active);
        },
      }),
    );

    return () => rail.set(null);
  }
}
