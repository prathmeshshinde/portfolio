import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Laptop,
  ExternalLink,
} from "lucide-react";
import { Button } from "./ui/button";

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "prathmeshshinde1008@gmail.com",
      href: "mailto:prathmeshshinde1008@gmail.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+91 9699867574",
      href: "tel:+919699867574",
    },
    // {
    //   icon: MapPin,
    //   label: "Location",
    //   value: "Navi Mumbai, India",
    //   href: "https://maps.google.com/?q=Navi+Mumbai,India",
    // },
  ];

  const socialLinks = [
    {
      icon: Github,
      label: "GitHub",
      href: "https://github.com/prathmeshshinde",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/prathmesh-shinde-4b474336a/",
    },
  ];

  const animationCard = (index: number) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay: index * 0.1 },
    viewport: { once: true },
  });

  return (
    <section id="contact" className="py-20 px-6 md:px-12 bg-secondary/50">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full mb-4">
            Contact
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">Get In Touch</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-semibold">
              Let's talk about your project
            </h3>
            <p className="text-foreground/70">
              I'm interested in frontend development opportunities where I can
              contribute, learn, and grow. Feel free to reach out if you have a
              question or just want to say hi!
            </p>

            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  {...animationCard(index)}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  className="flex items-center gap-4 p-3 hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>

            <div className="pt-4">
              <p className="text-foreground/70 mb-4">Find me on</p>
              <div className="flex gap-4">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    {...animationCard(index)}
                    className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/70 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <link.icon size={20} />
                    <span className="sr-only">{link.label}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center"
          >
            <div className="mb-6">
              <Laptop size={80} className="text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">
                Ready to work together?
              </h3>
              <p className="text-foreground/70 mb-6">
                I'm currently available for freelance work and full-time
                positions. If you're looking for a developer who cares about the
                details, let's connect!
              </p>
            </div>
            <Button asChild className="gap-2">
              <a
                href="https://drive.google.com/file/d/1Gn_l7jFGegRPUasJSsYlyAO9OKEH7XX5/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={16} />
                <span>View Resume</span>
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
