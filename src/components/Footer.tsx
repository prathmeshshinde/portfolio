
import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-12 px-6 md:px-12 bg-foreground/5">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-center">
          <motion.a
            href="#home"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-8 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
          >
            <ChevronUp size={20} />
            <span className="sr-only">Go to top</span>
          </motion.a>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-lg font-semibold mb-2">Prathmesh Shinde</p>
            <p className="text-foreground/60 mb-6">Frontend Developer</p>
            <p className="text-sm text-foreground/50">
              &copy; {new Date().getFullYear()} • All Rights Reserved
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
