import costaBallenaBuilder320 from "../assets/captures/costa-ballena-builder-full-320.webp";
import costaBallenaBuilder480 from "../assets/captures/costa-ballena-builder-full-480.webp";
import costaBallenaMobileFlow1440 from "../assets/captures/costa-ballena-case-01-mobile-flow-full-1440.webp";
import costaBallenaMobileFlow960 from "../assets/captures/costa-ballena-case-01-mobile-flow-full-960.webp";
import costaBallenaAiChat1440 from "../assets/captures/costa-ballena-case-02-ai-chat-full-1440.webp";
import costaBallenaAiChat960 from "../assets/captures/costa-ballena-case-02-ai-chat-full-960.webp";
import costaBallenaHomeDesktop1440 from "../assets/captures/costa-ballena-case-03-home-desktop-full-1440.webp";
import costaBallenaHomeDesktop960 from "../assets/captures/costa-ballena-case-03-home-desktop-full-960.webp";
import costaBallenaDiscover1440 from "../assets/captures/costa-ballena-case-04-discover-desktop-full-1440.webp";
import costaBallenaDiscover960 from "../assets/captures/costa-ballena-case-04-discover-desktop-full-960.webp";
import costaBallenaConfirm320 from "../assets/captures/costa-ballena-confirm-full-320.webp";
import costaBallenaConfirm480 from "../assets/captures/costa-ballena-confirm-full-480.webp";
import costaBallenaHome320 from "../assets/captures/costa-ballena-home-full-320.webp";
import costaBallenaHome460 from "../assets/captures/costa-ballena-home-full-460.webp";
import globalCigarExpress1440 from "../assets/captures/global-cigar-express-full-1440.webp";
import globalCigarExpress960 from "../assets/captures/global-cigar-express-full-960.webp";
import pacificEcosolutions1440 from "../assets/captures/pacific-ecosolutions-full-1440.webp";
import pacificEcosolutions960 from "../assets/captures/pacific-ecosolutions-full-960.webp";
import vetegram1440 from "../assets/captures/vetegram-full-1440.webp";
import vetegram960 from "../assets/captures/vetegram-full-960.webp";

export const PROJECT_STATUSES = ["live", "demo", "concept", "design"];

// Captures: `src` maps each width to its file (scripts/process-captures.mjs generates them),
// `width`/`height` are the largest version's size.
// - `image`: one full-page capture.
// - `screens` (optional): mobile screens shown side by side instead of `image`.
// - `pauseScreens` (optional): this project's Home pause, in screens of scroll.
// - `captureNote` (optional): a note shown under the capture on the case page.
// - `gallery` (optional): boards for the case page, each with its caption. An entry with
//   `image: null` is a board still missing; the page shows it as a visible TODO.
export const projects = [
  {
    slug: "costa-ballena-experience-builder",
    name: "Costa Ballena Experience Builder",
    status: "concept",
    statusLabel: "Concept case study",
    description:
      "An AI-guided platform for building personal experiences in Costa Ballena, not itineraries.",
    tags: ["Product design", "UX strategy", "AI UX", "Figma"],
    caseUrl: "/work/costa-ballena-experience-builder",
    image: null,
    // The screens are short, so the Home pause is shorter than the default (1 screen).
    pauseScreens: 0.4,
    screens: [
      {
        src: { 320: costaBallenaHome320, 460: costaBallenaHome460 },
        width: 460,
        height: 1400,
        alt: "Costa Ballena app, Home screen",
      },
      {
        src: { 320: costaBallenaBuilder320, 480: costaBallenaBuilder480 },
        width: 480,
        height: 1461,
        alt: "Costa Ballena app, Builder screen",
      },
      {
        src: { 320: costaBallenaConfirm320, 480: costaBallenaConfirm480 },
        width: 480,
        height: 1461,
        alt: "Costa Ballena app, Confirm screen",
      },
    ],
    gallery: [
      {
        caption: "01 — Final UI: Mobile, the primary flow",
        image: {
          src: {
            960: costaBallenaMobileFlow960,
            1440: costaBallenaMobileFlow1440,
          },
          width: 1440,
          height: 1024,
          alt: "Final UI board: five mobile screens of the primary flow, from Home to Confirm",
        },
      },
      {
        caption: "02 — AI Chat: Guide",
        image: {
          src: { 960: costaBallenaAiChat960, 1440: costaBallenaAiChat1440 },
          width: 1440,
          height: 1024,
          alt: "AI Chat guide board: the conversational assistant inside the experience builder",
        },
      },
      {
        caption: "03 — Home (Desktop)",
        image: {
          src: {
            960: costaBallenaHomeDesktop960,
            1440: costaBallenaHomeDesktop1440,
          },
          width: 1440,
          height: 1881,
          alt: "Home screen, desktop version",
        },
      },
      {
        caption: "04 — Discover (Desktop)",
        image: {
          src: { 960: costaBallenaDiscover960, 1440: costaBallenaDiscover1440 },
          width: 1440,
          height: 1188,
          alt: "Discover screen, desktop version, with filters and results",
        },
      },
    ],
  },
  {
    slug: "vetegram",
    name: "Vetegram",
    status: "live",
    statusLabel: "Live site",
    description:
      "A veterinary-tech landing page migrated to React and Tailwind. Mobile Lighthouse performance went from 86 to 93, and accessibility violations from 1 to 0.",
    tags: ["React", "Tailwind CSS", "Accessibility", "AI-assisted development"],
    caseUrl: "/work/vetegram",
    image: {
      src: { 960: vetegram960, 1440: vetegram1440 },
      width: 1440,
      height: 4443,
      alt: "Vetegram landing page, full-page screenshot",
    },
  },
  {
    slug: "global-cigar-express",
    name: "Global Cigar Express",
    status: "demo",
    statusLabel: "Demo, password-protected",
    description:
      "A premium cigar store on Shopify, designed for Asian buyers first.",
    tags: ["Shopify", "UX / CRO", "Liquid + Tailwind", "Figma"],
    caseUrl: "/work/global-cigar-express",
    image: {
      src: { 960: globalCigarExpress960, 1440: globalCigarExpress1440 },
      width: 1440,
      height: 3871,
      alt: "Global Cigar Express storefront demo, full-page screenshot",
    },
    // Shown under the capture on the case page.
    captureNote: "Demo environment. Testimonials are placeholder content.",
  },
  {
    slug: "pacific-ecosolutions",
    name: "Pacific EcoSolutions",
    status: "design",
    statusLabel: "Design only, never launched",
    description:
      "A landing page for an AI and web agency, adapted from a UI kit. The venture did not move past the design stage.",
    tags: ["UI design", "Responsive", "UI kit adaptation", "Figma"],
    caseUrl: "/work/pacific-ecosolutions",
    // A Figma export: the venture never launched, so the alt says design, not site.
    image: {
      src: { 960: pacificEcosolutions960, 1440: pacificEcosolutions1440 },
      width: 1440,
      height: 6900,
      alt: "Pacific EcoSolutions landing page design, full page (Figma)",
    },
  },
];

/** The project after `slug` in the list, wrapping back to the first one. */
export function nextProject(slug, list = projects) {
  const index = list.findIndex((project) => project.slug === slug);
  return list[(index + 1) % list.length];
}
