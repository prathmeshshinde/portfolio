import { motion } from "framer-motion";
import { ChevronDown, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroImage from "@/assets/image.png";

const Hero = () => {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center pt-24 pb-16 px-6 md:px-12"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 space-y-6"
          >
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full mb-4"
              >
                Frontend Developer
              </motion.span>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
              >
                Hi, I'm <span className="text-primary">Prathmesh Shinde</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-lg md:text-xl text-foreground/80 max-w-2xl"
              >
                A results-driven Frontend Developer with expertise in React,
                TypeScript, and modern web technologies. I create exceptional
                user experiences with a focus on clean, maintainable code.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                asChild
                className="rounded-full px-6 py-6 h-auto hover:scale-105 transition-transform"
              >
                <a href="#contact">Get in Touch</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-6 py-6 h-auto hover:scale-105 transition-transform"
              >
                <a href="#projects">View Projects</a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="flex items-center gap-4 pt-4"
            >
              <a
                href="https://github.com/prathmeshshinde"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                <Github size={24} />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/prathmesh-shinde-4b474336a/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                <Linkedin size={24} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="mailto:prathmeshshinde1008@gmail.com"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                <Mail size={24} />
                <span className="sr-only">Email</span>
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-full md:w-2/5 aspect-square max-w-md"
          >
            <img
              src={HeroImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="hidden md:flex absolute bottom-10 left-1/2 transform -translate-x-1/2 flex-col items-center"
        >
          <span className="text-sm text-foreground/60 mb-2">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown size={24} className="text-primary" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
