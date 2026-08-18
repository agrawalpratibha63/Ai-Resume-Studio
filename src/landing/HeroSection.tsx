import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import "./HeroSection.css";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({
  onGetStarted,
}: HeroSectionProps) {
  return (
    <section className="hero">

      <motion.div
        className="hero-badge"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        ✨ Built with Gemini AI &nbsp; | &nbsp; No Coding Required
      </motion.div>

      <motion.h1 className="hero-title">

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8 }}
        >
          Turn Your Resume
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .2, duration: .8 }}
        >
          Into A Portfolio
        </motion.div>

        <motion.div
          className="gradient-text"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .4, duration: .8 }}
        >
          That Gets Noticed.
        </motion.div>

      </motion.h1>

      <motion.p
        className="hero-description"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .8 }}
      >
        Upload your resume. Choose a template.
        <br />
        Let AI build your portfolio.
        <br />
        Customize everything.
        <br />
        Share it with the world.
      </motion.p>

      <motion.button
        className="hero-button"
        whileHover={{
          scale: 1.05,
          y: -3,
        }}
        whileTap={{ scale: .95 }}
        onClick={onGetStarted}
      >
        Start Building
        <ArrowRight size={18}/>
      </motion.button>

    </section>
  );
}