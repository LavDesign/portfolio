import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import {
  activeIndex,
  chapterForPanel,
  chapterLabel,
  scrollForOffset,
} from "./chapter-utils.js";

gsap.registerPlugin(ScrollTrigger);

const HORIZONTAL_CLASS = "chapters-horizontal";
const HORIZONTAL_QUERY =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
// "not all and (a) and (b)" negates the whole query, so exactly one condition matches.
const VERTICAL_QUERY = `not all and ${HORIZONTAL_QUERY}`;

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
  const railStatus = doc.querySelector("[data-rail-status]");
  const railDefault = railStatus?.textContent.trim() ?? "";

  const setRail = (text) => {
    if (railStatus && railStatus.textContent !== text) {
      railStatus.textContent = text;
    }
  };

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

    const distance = () => track.scrollWidth - section.clientWidth;

    // Offset of an element along the track, unaffected by the track's transform.
    const trackOffset = (element) =>
      element.getBoundingClientRect().left - track.getBoundingClientRect().left;

    // The page ends with Ch.4 on screen, so at progress 1 keep its label.
    const updateRail = (self) => {
      if (!self.isActive && self.progress < 1) return setRail(railDefault);
      const position = self.progress * distance() + section.clientWidth / 2;
      const panel = activeIndex(panels.map(trackOffset), position);
      setRail(chapterLabel(chapterForPanel(panel, panelCounts), total));
    };

    const scroll = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: true,
        start: "top top",
        end: () => `+=${distance()}`,
        invalidateOnRefresh: true,
        onToggle: updateRail,
        onUpdate: updateRail,
      },
    });

    // Parallax: the screenshot drifts against the panel, within its 10% overscan.
    track.querySelectorAll("[data-parallax]").forEach((layer) => {
      gsap.fromTo(
        layer,
        { xPercent: -8 },
        {
          xPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: layer.parentElement,
            containerAnimation: scroll,
            start: "left right",
            end: "right left",
            scrub: true,
          },
        },
      );
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

      const { start, end } = scroll.scrollTrigger;
      const offset = trackOffset(panel);
      lenis.scrollTo(
        scrollForOffset({ start, end, distance: distance(), offset }),
        { duration: 0.6 },
      );
    };

    const stopScroll = () => lenis.stop();
    const startScroll = () => lenis.start();

    track.addEventListener("focusin", onFocusIn);
    doc.addEventListener("menu:open", stopScroll);
    doc.addEventListener("menu:close", startScroll);

    // gsap.matchMedia reverts the tweens and ScrollTriggers; this undoes the rest.
    return () => {
      track.removeEventListener("focusin", onFocusIn);
      doc.removeEventListener("menu:open", stopScroll);
      doc.removeEventListener("menu:close", startScroll);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      root.classList.remove(HORIZONTAL_CLASS);
      setRail(railDefault);
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
          setRail(active === -1 ? railDefault : chapterLabel(active, total));
        },
      }),
    );

    return () => setRail(railDefault);
  }
}
