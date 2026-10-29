// Who LAV Design is. LAV = Luis Aguilar Vargas. Every mention of the name reads from here.
export const owner = {
  name: "Luis Aguilar Vargas",
  brand: "LAV Design",
  jobTitle: "Digital Experience Builder",
};

// "Luis Aguilar Vargas (LAV Design)", for descriptions.
export const ownerWithBrand = `${owner.name} (${owner.brand})`;

/** "<page> — Luis Aguilar Vargas | LAV Design". Without a page: the Home title. */
export function pageTitle(page) {
  return `${page ?? owner.name} — ${page ? owner.name : owner.jobTitle} | ${owner.brand}`;
}

export const nav = [
  { number: "01.", label: "Home", href: "/" },
  { number: "02.", label: "Work", href: "/work" },
  { number: "03.", label: "About", href: "/about" },
  { number: "04.", label: "Contact", href: "/contact" },
];

// Shown as text on /contact so it can be copied.
export const email = "lavdesign.luis@gmail.com";

export const social = [
  { label: "Email", href: `mailto:${email}` },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/luis-aguilar-33b83027/",
  },
  { label: "GitHub", href: "https://github.com/LavDesign" },
];

// JSON-LD for the Home. No address, phone or location on purpose.
// TODO (M7): add `url` once the production domain is set.
export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: owner.name,
  alternateName: owner.brand,
  jobTitle: owner.jobTitle,
  sameAs: social
    .filter((link) => ["LinkedIn", "GitHub"].includes(link.label))
    .map((link) => link.href),
};
