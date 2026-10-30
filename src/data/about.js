import { owner } from "./site.js";
import { timelineClosing } from "./timeline.js";

export const about = {
  story: `I’m ${owner.name}. ${owner.brand} is the name I work under — LAV stands for my initials. I started as a graphic designer in 2006. Over twenty years I moved into web design, front-end development and CMS work, building websites, AEM components, marketing emails and campaigns. Today I design digital experiences and build them, using AI to extend what I can make.`,
  skills: [
    {
      title: "Email and marketing technology",
      text: "Responsive HTML email, audience segmentation and campaign setup, on platforms like Marketo and ExactTarget. HTML5 banners.",
    },
    {
      title: "CMS and platforms",
      text: "Adobe AEM components, WordPress, Drupal and Shopify (Liquid).",
    },
    {
      title: "Design and frontend",
      text: "HTML, CSS, JavaScript, React, Tailwind, Figma and the Adobe suite.",
    },
  ],
  // Same approved line as the timeline's closing.
  skillsClosing: timelineClosing,
};
