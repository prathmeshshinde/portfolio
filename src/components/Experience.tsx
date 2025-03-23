
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from 'lucide-react';

interface ExperienceItemProps {
  title: string;
  company: string;
  period: string;
  location: string;
  description: string[];
  delay?: number;
}

const ExperienceItem = ({ title, company, period, location, description, delay = 0 }: ExperienceItemProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay }}
    viewport={{ once: true }}
    className="relative border-l border-primary/30 pl-8 pb-12"
  >
    <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary -translate-x-[9px]" />
    
    <div className="space-y-3">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <h4 className="text-lg text-primary">{company}</h4>
      </div>
      
      <div className="flex flex-wrap gap-3 text-sm text-foreground/60">
        <div className="flex items-center gap-1">
          <Calendar size={16} />
          <span>{period}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={16} />
          <span>{location}</span>
        </div>
      </div>
      
      <ul className="space-y-2 mt-4">
        {description.map((item, index) => (
          <motion.li 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: delay + (index * 0.1) }}
            viewport={{ once: true }}
            className="relative pl-6 before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/50"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  </motion.div>
);

const Experience = () => {
  const experiences = [
    {
      title: "Frontend Developer Intern",
      company: "AlgoBulls",
      period: "Jan 2024—Present",
      location: "Remote",
      description: [
        "Worked on the front end of an AI-backed algorithmic trading platform with TypeScript and Ant Design.",
        "Created reusable components from scratch and contributed to redesigning the AlgoBulls Odyssey (Marketplace).",
        "Collaborating with the backend team to test the product. Writing JEST unit, integration tests, and E2E tests with Cypress.",
        "Building pixel-perfect web pages using Ant Design and ReactJS based on Figma designs.",
        "Designing mock APIs on the front end so they can be connected to the back end."
      ]
    },
    {
      title: "Frontend Developer Intern",
      company: "Search IN",
      period: "Mar 2023—Jun 2023",
      location: "Remote",
      description: [
        "Developed the front end of a web app for hiring healthcare workers. Workers can create their resumes within the platform and apply for various jobs.",
        "Implemented a secure authentication system for seamless session management using access and refresh tokens.",
        "I was responsible for the complete resume section, where users can fill in their data and create a full resume."
      ]
    }
  ];

  return (
    <section id="experience" className="py-20 px-6 md:px-12 bg-secondary/50">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full mb-4">Experience</span>
          <h2 className="text-3xl md:text-4xl font-bold">Work Experience</h2>
        </motion.div>

        <div className="relative">
          {experiences.map((exp, index) => (
            <ExperienceItem
              key={index}
              title={exp.title}
              company={exp.company}
              period={exp.period}
              location={exp.location}
              description={exp.description}
              delay={index * 0.2}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
