import { motion } from "framer-motion";
import "./PremiumHero.css";

interface Props {
  onGetStarted: () => void;
}

const subtitleLines = [
  "Upload your resume.",
  "Choose a template.",
  "Let AI build your portfolio.",
  "Customize everything.",
  "Share it with the world."
];

export default function PremiumHero({
  onGetStarted,
}: Props) {
  return (
    <section className="premium-hero">

      <div className="hero-content">

        {/* Badge */}

        <motion.div
          className="hero-badge"
          initial={{
            opacity: 0,
            scale: 0.8,
            filter: "blur(12px)"
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
          }}
          viewport={{
            once: false,
            amount: 0.5
          }}
          transition={{
            duration: 0.6
          }}
        >
          ✦ Built with Gemini AI
        </motion.div>

        {/* Heading */}

        <h1 className="hero-title">

          <motion.span
            initial={{
              opacity: 0,
              y: 60,
              filter: "blur(10px)"
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)"
            }}
            viewport={{
              once: false
            }}
            transition={{
              duration: 0.8
            }}
          >
            Turn Your Resume
          </motion.span>

          <motion.span
            initial={{
              opacity: 0,
              y: 60,
              filter: "blur(10px)"
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)"
            }}
            viewport={{
              once: false
            }}
            transition={{
              delay: 0.2,
              duration: 0.8
            }}
          >
            Into A Portfolio
          </motion.span>

          <motion.span
            initial={{
              opacity: 0,
              y: 60,
              filter: "blur(10px)"
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)"
            }}
            viewport={{
              once: false
            }}
            transition={{
              delay: 0.4,
              duration: 0.8
            }}
          >
            That Gets Noticed.
          </motion.span>

        </h1>

        {/* Subtitle */}

        <div className="hero-subtitle">

          {subtitleLines.map((line, index) => (

            <motion.p
              key={line}
              initial={{
                opacity: 0,
                x: -40
              }}
              whileInView={{
                opacity: 1,
                x: 0
              }}
              viewport={{
                once: false
              }}
              transition={{
                delay: 0.7 + index * 0.15,
                duration: 0.5
              }}
            >
              {line}
            </motion.p>

          ))}

        </div>

        {/* Button */}

        <motion.button
          className="hero-btn"
          onClick={onGetStarted}
          initial={{
            opacity: 0,
            y: 40
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: false
          }}
          transition={{
            delay: 1.5,
            duration: 0.6
          }}
          whileHover={{
            y: -4,
            scale: 1.04
          }}
          whileTap={{
            scale: 0.96
          }}
        >
          Start Building →
        </motion.button>

      </div>

    </section>
  );
}