export const PROJECT_STATUSES = ["live", "demo", "concept", "design"];

// TODO: real screenshots are pending. Every `image` stays null until they're added.
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
    image: null,
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
    image: null,
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
    image: null,
  },
];

/** The project after `slug` in the list, wrapping back to the first one. */
export function nextProject(slug, list = projects) {
  const index = list.findIndex((project) => project.slug === slug);
  return list[(index + 1) % list.length];
}
