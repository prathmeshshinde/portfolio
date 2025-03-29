import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Posting from "../assets/posting.png";
import Anify from "../assets/anify.png";
import PowerIndex from "../assets/power.png";
import CovidTracker from "../assets/covidtracker.png";
import ReactUIX from "../assets/reactuix.png";

interface ProjectProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  githubLink?: string;
  liveLink?: string;
  index: number;
}

const ProjectCard = ({
  title,
  description,
  image,
  tags,
  githubLink,
  liveLink,
  index,
}: ProjectProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.2 }}
    viewport={{ once: true }}
    className="bg-gradient-to-br from-white/95 to-accent/30 dark:from-secondary/30 dark:to-background/90 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
  >
    <div
      className="aspect-video relative bg-gradient-to-tr from-white/80 to-white/90 dark:from-background/80 dark:to-background/60 flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    ></div>

    <div className="p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
        {title}
      </h3>

      <p className="text-foreground/70">{description}</p>

      <div className="flex flex-wrap gap-2 pt-2">
        {tags.map((tag, idx) => (
          <Badge key={idx} variant="secondary" className="rounded-full">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        {githubLink && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-2 rounded-full"
          >
            <a href={githubLink} target="_blank" rel="noopener noreferrer">
              <Github size={16} />
              <span>Code</span>
            </a>
          </Button>
        )}

        {liveLink && (
          <Button asChild size="sm" className="gap-2 rounded-full">
            <a href={liveLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} />
              <span>Live Demo</span>
            </a>
          </Button>
        )}
      </div>
    </div>
  </motion.div>
);

const Projects = () => {
  const projects = [
    {
      title: "React UIX Component Library",
      description:
        "A reusable React component library designed to streamline UI development. Built and published custom components like Button, Alert, and Card with TypeScript for type safety. Optimized the build process using Rollup. Ensured best practices for component design and package publishing on npm.",
      image: ReactUIX,
      tags: ["Reusable components", "React.js", "CSS"],
      githubLink: "https://github.com/prathmeshshinde/react-uix",
      liveLink: "https://www.npmjs.com/package/react-uix",
    },
    {
      title: "Posting App",
      description:
        "A fully functional social media app with authentication via Firebase. Features like, dislike, and bookmark posts. Users can edit and update profiles.",
      image: Posting,
      tags: ["Firebase", "React.js", "Ant Design"],
      githubLink: "https://github.com/prathmeshshinde/postingWeb",
      liveLink: "https://posting-web.vercel.app/",
    },
    {
      title: "Anify App",
      description:
        "An app that allows anime lovers to make Spotify playlists based on their favorite animes using Spotify API and Tailwind CSS for styling.",
      image: Anify,
      tags: ["Spotify API", "Tailwind CSS", "React.js"],
      githubLink: "https://github.com/prathmeshshinde/Anify",
      liveLink: "https://anify-anime.vercel.app/",
    },
    {
      title: "Power Index",
      description:
        "A system that allows users to check various countries' power depending on the country's Army, Navy, and Air Force. Built using React.js and Firebase.",
      image: PowerIndex,
      tags: ["React.js", "Firebase", "react-router"],
      githubLink: "https://github.com/prathmeshshinde/powerindex",
      liveLink: "https://powerindex-cf70b.web.app/",
    },
    {
      title: "CovidTracker",
      description:
        "Shows total COVID cases, recovered, and deaths by country. Built using React.js, CSS, and Chart.js.",
      image: CovidTracker,
      tags: ["React.js", "CSS", "Chart.js"],
      githubLink: "https://github.com/prathmeshshinde/covidtracker",
      liveLink: "https://covidtracker-beta.vercel.app/",
    },
  ];

  return (
    <section id="projects" className="py-20 px-6 md:px-12">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full mb-4">
            Projects
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">My Recent Work</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              description={project.description}
              image={project.image}
              tags={project.tags}
              githubLink={project.githubLink}
              liveLink={project.liveLink}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
