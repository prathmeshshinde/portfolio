
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillCategoryProps {
  title: string;
  skills: string[];
  className?: string;
}

const SkillCategory = ({ title, skills, className }: SkillCategoryProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className={cn("bg-gradient-to-br from-white/80 to-secondary/40 dark:from-secondary/20 dark:to-background/80 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all", className)}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ul className="space-y-2">
      {skills.map((skill, index) => (
        <motion.li 
          key={index}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-primary" />
          <span>{skill}</span>
        </motion.li>
      ))}
    </ul>
  </motion.div>
);

const About = () => {
  const languages = ["TypeScript", "JavaScript", "HTML/CSS"];
  const frameworks = ["React", "Redux", "Material UI", "TailwindCSS"];
  const tools = ["Git", "GitHub", "Jest", "Cypress", "Figma"];
  const databases = ["Firebase"];

  return (
    <section id="about" className="py-20 px-6 md:px-12">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full mb-4">About Me</span>
          <h2 className="text-3xl md:text-4xl font-bold">My Background & Skills</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">Who am I?</h3>
            <p className="text-foreground/80 leading-relaxed">
              I'm a results-driven Frontend Developer with a strong commitment to delivering exceptional code quality. Over time, I have honed my technical expertise and gained valuable experience in Frontend development.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              My strong communication and teamwork skills enable seamless collaboration, while my self-motivation ensures high-quality outcomes. As a fast learner, I quickly adapt to emerging technologies and project needs, consistently driving innovation and success.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              I'm currently working as a Frontend Developer Intern at AlgoBulls where I've been developing components for an AI-backed algorithmic trading platform using TypeScript and Ant Design.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SkillCategory title="Languages" skills={languages} />
            <SkillCategory title="Frameworks" skills={frameworks} />
            <SkillCategory title="Tools" skills={tools} />
            <SkillCategory title="Databases" skills={databases} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
