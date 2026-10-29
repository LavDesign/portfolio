export const hero = {
  titleWords: ["Digital", "Experience", "Builder"],
  stack: ["UX", "FRONTEND", "CMS"],
  statement: "I design the experience, then build it.",
  lead: "UX, frontend and CMS, with 20+ years of experience, using AI to extend what I can make. Based in Costa Rica, working remotely.",
  ctaPrimary: { label: "Hire me", href: "/contact?type=hire" },
  ctaSecondary: { label: "Work with me", href: "/contact?type=project" },
  // Links to #work, the start of Ch.1; the "↓" comes from LinkArrow.
  scrollHint: "Scroll to see selected work",
};

export const contact = {
  title: "Let's build something.",
  doors: [
    {
      title: "Hiring?",
      text: "I'm open to remote roles in UX engineering, design engineering and digital experience.",
      cta: hero.ctaPrimary,
      variant: "primary",
    },
    {
      title: "Have a project?",
      text: "Websites, stores and interfaces, designed and built end to end.",
      cta: hero.ctaSecondary,
      variant: "secondary",
    },
  ],
  availability: "Working remotely.",
  // Dialog shown on /contact once Formspree confirms the message was sent.
  success: {
    title: "Message sent.",
    text: "Thanks. I'll get back to you soon.",
    close: "Close",
  },
};

// Ch.1 Selected work, Ch.2 Twenty years, Ch.3 How I work with AI, Ch.4 Contact.
export const chapterCount = 4;
