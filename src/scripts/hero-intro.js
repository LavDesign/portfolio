import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// Set by an inline script in Hero.astro so the animated parts don't flash before the intro.
const PENDING_CLASS = "hero-intro-pending";

export async function initHeroIntro(doc = document) {
  const root = doc.documentElement;
  const title = doc.querySelector("[data-hero-title]");

  // Wait for Geist so the lines are measured with the final font.
  await doc.fonts.ready;

  // The inline fallback timeout already revealed everything; animating now would flash.
  if (!title || !root.classList.contains(PENDING_CLASS)) return;

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // The h1 keeps its own aria-label and this wrapper is aria-hidden, so SplitText adds no ARIA.
    const split = SplitText.create(title, {
      type: "lines",
      mask: "lines",
      aria: "none",
    });

    gsap
      .timeline({ onComplete: () => split.revert() })
      .from(split.lines, {
        yPercent: 100,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
      })
      .from(
        doc.querySelectorAll("[data-hero-fade]"),
        { autoAlpha: 0, duration: 0.3, ease: "power1.out", stagger: 0.06 },
        "-=0.2",
      );

    return () => split.revert();
  });

  // The from() tweens have already applied their start state, so revealing now doesn't flash.
  root.classList.remove(PENDING_CLASS);
}
