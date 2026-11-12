/**
 * All portfolio content lives here — edit this file to update the site.
 */
import portrait from "@/assets/image.png";
import reactUixShot from "@/assets/reactuix.png";
import postingShot from "@/assets/posting.png";
import anifyShot from "@/assets/anify.png";
import powerIndexShot from "@/assets/power.png";
import covidTrackerShot from "@/assets/covidtracker.png";

export const profile = {
  name: "Prathmesh Shinde",
  /** Stylised logotype used in the header and footer. */
  logotype: "प्रthmesh Shinde",
  role: "Frontend Developer",
  summary:
    "A results-driven Frontend Developer with expertise in React, TypeScript, and modern web technologies. I create exceptional user experiences with a focus on clean, maintainable code.",
  footerTagline:
    "Building fast, accessible web experiences with React and TypeScript — with a focus on clean, maintainable code.",
  email: "prathmeshshinde1008@gmail.com",
  phone: { display: "+91 83559 19607", href: "tel:+918355919607" },
  resumeUrl: "https://drive.google.com/file/d/1s48_GhcEeD850bEfff1fqmjYT7XNY2s9/view?usp=sharing",
  github: { username: "prathmeshshinde", url: "https://github.com/prathmeshshinde" },
  linkedin: "https://www.linkedin.com/in/prathmesh-shinde-4b474336a/",
  portrait: {
    src: portrait,
    width: 1690,
    height: 1694,
    alt: "Illustration of a developer writing code at a desk",
  },
  availability: {
    label: "Open to work",
    detail: "Freelance & full-time",
    note: "Currently available for freelance work and full-time positions. Feel free to reach out if you have a question or just want to say hi!",
  },
} as const;

export const navigation = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export const about = {
  intro:
    "Frontend developer building React and TypeScript interfaces — from enterprise healthcare platforms to health insurance products.",
  paragraphs: [
    "I'm a results-driven Frontend Developer with a strong commitment to delivering exceptional code quality. Over time, I have honed my technical expertise and gained valuable experience in Frontend development.",
    "My strong communication and teamwork skills enable seamless collaboration, while my self-motivation ensures high-quality outcomes. As a fast learner, I quickly adapt to emerging technologies and project needs, consistently driving innovation and success.",
    "I'm currently a Software Developer at Riomed, building healthcare management modules for Cellmauser — an enterprise platform for EMR workflows, appointment scheduling and billing — with React, TypeScript, Redux and MUI. Before that, I spent two years at Smartwork Ideas building health insurance products with React and Next.js.",
  ],
} as const;

export const stats = [
  { value: 5, suffix: "", label: "Projects shipped & live" },
  { value: 2, suffix: "", label: "Companies worked with" },
  { value: 30, suffix: "+", label: "Technologies in my toolkit" },
  { value: 1, suffix: "", label: "Open-source library on npm" },
] as const;

/** Scrolling chips under the hero. */
export const marqueeSkills = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Redux",
  "React Hook Form",
  "Tailwind CSS",
  "Material UI",
  "Ant Design",
  "Bootstrap",
  "Firebase",
  "Jest",
  "Cypress",
  "Vite",
  "Webpack",
  "Nx",
  "Figma",
  "Git & GitHub",
  "Azure DevOps",
  "Postman",
  "HTML & CSS",
  "Rollup",
  "Chart.js",
] as const;

export const services = [
  {
    title: "Frontend Development",
    description:
      "Pixel-perfect, responsive interfaces in React and TypeScript, built straight from Figma designs and tuned for performance.",
  },
  {
    title: "Component Libraries",
    description:
      "Reusable, typed UI components — from Ant Design–based product screens to react-uix, my own library bundled with Rollup and published on npm.",
  },
  {
    title: "Testing & Quality",
    description:
      "Unit, integration, and end-to-end coverage with Jest and Cypress, so features ship with confidence and stay maintainable.",
  },
  {
    title: "API Integration",
    description:
      "Secure token-based authentication, Firebase back-ends, third-party APIs, and front-end mock APIs that keep teams unblocked.",
  },
] as const;

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  /** Wrap a phrase in double asterisks to bold it, e.g. "cut load time by **40%**". */
  highlights: readonly string[];
  stack?: readonly string[];
  url?: string;
}

export const experience: readonly Experience[] = [
  {
    company: "Riomed",
    role: "Software Developer",
    period: "July 2025 – Present",
    location: "Pune, India",
    highlights: [
      "Engineered healthcare management modules using **React.js, TypeScript, Redux, and MUI**, improving overall UI responsiveness by **35%**.",
      "Optimized state management and rendering logic with Redux, **cutting unnecessary re-renders by 40%** and improving page load performance for large clinical datasets.",
      "Integrated RESTful APIs for real-time patient data workflows, ensuring **99%+ data accuracy** across appointment and treatment modules.",
      "Architected scalable, reusable component libraries, **reducing duplicate code by 30%** and accelerating new feature delivery cycles by 25%.",
      "Contributed to drag-and-drop configuration and dynamic table rendering modules, improving UI/UX customization for multi-specialty healthcare users.",
      "Participated in peer code reviews and enforced frontend coding standards, reducing technical debt.",
      "**Key Project:** Cellmauser – Enterprise healthcare platform covering EMR workflows, appointment scheduling, billing, and configurable clinical data management.",
    ],
    stack: ["React", "TypeScript", "Redux", "Material UI", "REST APIs"],
  },
  {
    company: "Smartwork Ideas Pvt Ltd.",
    role: "Software Developer",
    period: "May 2023 – June 2025",
    location: "Pune, India",
    highlights: [
      "**Health Insurance Modules:** Collaborated with cross-functional teams to develop and maintain health insurance modules, focusing on health insurance plans, claims processing, and policy management.",
      "Enhanced user interfaces for policyholders and administrators using **React.js**, improving usability and accessibility.",
      "Developed server-side rendered applications using **Next.js** to enhance SEO and improve performance for health insurance modules.",
      "Integrated third-party APIs for real-time data fetching, including medical records and premium calculations.",
      "Designed interactive dashboards for policy comparison, premium calculations, and claim tracking.",
      "Participated in Agile ceremonies including daily stand-ups, sprint planning, and retrospectives to deliver high-quality features on schedule.",
      "**Key Achievements:** Improved claims processing time by **30%** through efficient API design; successfully deployed a new health insurance module within tight deadlines.",
    ],
    stack: ["React", "Next.js", "Third-party APIs"],
  },
];

/** Skills grid on the About page. On wide screens it is 3 columns; `wide` cards span 2. */
export const skillGroups = [
  {
    title: "Frameworks & Libraries",
    items: [
      "React",
      "Next.js",
      "Redux",
      "React Hook Form",
      "React Router",
      "Material UI",
      "Ant Design",
      "Tailwind CSS",
      "Bootstrap",
      "Chart.js",
    ],
    wide: true,
  },
  { title: "Languages", items: ["TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3"], wide: false },
  { title: "APIs & Back-end", items: ["REST APIs", "Postman", "Firebase", "Spotify Web API"], wide: false },
  { title: "Build Tools", items: ["Vite", "Webpack", "Babel", "Rollup", "Nx"], wide: true },
  { title: "Testing & Code Quality", items: ["Jest", "Cypress", "ESLint", "Prettier"], wide: false },
  { title: "Version Control & Collaboration", items: ["Git", "GitHub", "Azure DevOps", "Jira", "Slack"], wide: false },
  { title: "Design & Dev Tools", items: ["Figma", "VS Code", "npm", "Yarn"], wide: false },
] as const;

export interface Project {
  title: string;
  description: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  tags: readonly string[];
  repoUrl: string;
  liveUrl: string;
  /** Shown when GitHub's API is unavailable. */
  fallbackLanguage?: string;
  featured?: boolean;
}

export const projects: readonly Project[] = [
  {
    title: "React UIX Component Library",
    description:
      "A reusable React component library designed to streamline UI development. Built and published custom components like Button, Alert, and Card with TypeScript for type safety, optimised the build with Rollup, and followed best practices for component design and npm publishing.",
    image: reactUixShot,
    imageWidth: 972,
    imageHeight: 659,
    tags: ["Reusable components", "React.js", "TypeScript", "Rollup"],
    repoUrl: "https://github.com/prathmeshshinde/react-uix",
    liveUrl: "https://www.npmjs.com/package/react-uix",
    fallbackLanguage: "TypeScript",
    featured: true,
  },
  {
    title: "Posting App",
    description:
      "A fully functional social media app with authentication via Firebase. Like, dislike, and bookmark posts, and edit and update your profile.",
    image: postingShot,
    imageWidth: 1897,
    imageHeight: 973,
    tags: ["Firebase", "React.js", "Ant Design"],
    repoUrl: "https://github.com/prathmeshshinde/postingWeb",
    liveUrl: "https://posting-web.vercel.app/",
  },
  {
    title: "Anify App",
    description:
      "Lets anime lovers create Spotify playlists based on their favourite anime, using the Spotify API with Tailwind CSS for styling.",
    image: anifyShot,
    imageWidth: 1898,
    imageHeight: 976,
    tags: ["Spotify API", "Tailwind CSS", "React.js"],
    repoUrl: "https://github.com/prathmeshshinde/Anify",
    liveUrl: "https://anify-anime.vercel.app/",
  },
  {
    title: "Power Index",
    description:
      "Compare the military power of countries by Army, Navy, and Air Force. Built using React.js and Firebase.",
    image: powerIndexShot,
    imageWidth: 1891,
    imageHeight: 991,
    tags: ["React.js", "Firebase", "React Router"],
    repoUrl: "https://github.com/prathmeshshinde/powerindex",
    liveUrl: "https://powerindex-cf70b.web.app/",
  },
  {
    title: "CovidTracker",
    description:
      "Shows total COVID cases, recoveries, and deaths by country. Built using React.js, CSS, and Chart.js.",
    image: covidTrackerShot,
    imageWidth: 1920,
    imageHeight: 984,
    tags: ["React.js", "CSS", "Chart.js"],
    repoUrl: "https://github.com/prathmeshshinde/covidtracker",
    liveUrl: "https://covidtracker-beta.vercel.app/",
  },
];
