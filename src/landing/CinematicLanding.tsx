import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from 'framer-motion';

import PremiumHero from "./PremiumHero";
import { ArrowRight, User } from 'lucide-react';
import './CinematicLanding.css';

interface CinematicLandingProps {
  onGetStarted: () => void;
}

export const CinematicLanding: React.FC<CinematicLandingProps> = ({
  onGetStarted,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loadedCount, setLoadedCount] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ============================================
  // PRELOAD CINEMATIC FRAMES
  // ============================================
  useEffect(() => {
    const totalFrames = 50;
    const loadedImages: HTMLImageElement[] = [];
    let loaded = 0;

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const indexStr = String(i).padStart(3, '0');

      // FIXED FOR GITHUB PAGES
      img.src = `${import.meta.env.BASE_URL}images/frames/ezgif-frame-${indexStr}.jpg`;

      img.onload = () => {
        loaded++;

        setLoadedCount(loaded);

        if (loaded === totalFrames) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        // Count failed images so loading doesn't get stuck
        loaded++;

        setLoadedCount(loaded);

        if (loaded === totalFrames) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };

      loadedImages.push(img);
    }
  }, []);

  // ============================================
  // SCROLL PROGRESS
  // ============================================
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothScrollProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 150,
    mass: 0.5,
  });

  // ============================================
  // CANVAS COVER DRAWING
  // ============================================
  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement
  ) => {
    const canvas = ctx.canvas;

    const cw = canvas.width;
    const ch = canvas.height;

    const iw = img.width;
    const ih = img.height;

    if (iw === 0 || ih === 0) return;

    const wr = cw / iw;
    const hr = ch / ih;

    const ratio = Math.max(wr, hr);

    const x = (cw - iw * ratio) / 2;
    const y = (ch - ih * ratio) / 2;

    ctx.clearRect(0, 0, cw, ch);

    ctx.drawImage(
      img,
      0,
      0,
      iw,
      ih,
      x,
      y,
      iw * ratio,
      ih * ratio
    );
  };

  // ============================================
  // DRAW CURRENT FRAME
  // ============================================
  const drawFrame = (index: number) => {
    if (!canvasRef.current || images.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');

    if (!ctx) return;

    const imgIndex = Math.min(
      images.length - 1,
      Math.max(0, index)
    );

    const img = images[imgIndex];

    if (img && img.complete) {
      drawImageCover(ctx, img);
    }
  };

  // ============================================
  // CANVAS RESIZE
  // ============================================
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;

      canvasRef.current.width =
        window.innerWidth * window.devicePixelRatio;

      canvasRef.current.height =
        window.innerHeight * window.devicePixelRatio;

      const currentIdx = Math.min(
        images.length - 1,
        Math.max(
          0,
          Math.floor(
            smoothScrollProgress.get() *
              (images.length - 1)
          )
        )
      );

      drawFrame(currentIdx);
    };

    window.addEventListener('resize', handleResize);

    if (isLoaded) {
      handleResize();
    }

    return () =>
      window.removeEventListener(
        'resize',
        handleResize
      );
  }, [isLoaded, images]);

  // ============================================
  // DRAW FRAME ON SCROLL
  // ============================================
  useMotionValueEvent(
    smoothScrollProgress,
    'change',
    (latest) => {
      if (images.length === 0) return;

      const frameIndex = Math.min(
        images.length - 1,
        Math.max(
          0,
          Math.floor(latest * images.length)
        )
      );

      drawFrame(frameIndex);
    }
  );

  // ============================================
  // INITIAL FRAME
  // ============================================
  useEffect(() => {
    if (isLoaded && images.length > 0) {
      setTimeout(() => {
        drawFrame(0);
      }, 100);
    }
  }, [isLoaded, images]);

  // ============================================
  // TYPOGRAPHY CHOREOGRAPHY
  // ============================================
  const scrollIndicatorOpacity = useTransform(
    smoothScrollProgress,
    [0, 0.05],
    [0.8, 0]
  );

  const heroOpacity = useTransform(
  smoothScrollProgress,
  [0, 0.12, 0.16],
  [1, 1, 0]
  );

const heroY = useTransform(
  smoothScrollProgress,
  [0, 0.16],
  [0, -80]
);

  const introOpacity = useTransform(
    smoothScrollProgress,
    [0, 0.15, 0.18],
    [1, 1, 0]
  );

  const introY = useTransform(
    smoothScrollProgress,
    [0, 0.18],
    [0, -60]
  );

  const expOpacity = useTransform(
    smoothScrollProgress,
    [0.22, 0.26, 0.36, 0.40],
    [0, 1, 1, 0]
  );

  const expY = useTransform(
    smoothScrollProgress,
    [0.22, 0.40],
    [40, -40]
  );

  const skillOpacity = useTransform(
    smoothScrollProgress,
    [0.42, 0.46, 0.56, 0.60],
    [0, 1, 1, 0]
  );

  const skillY = useTransform(
    smoothScrollProgress,
    [0.42, 0.60],
    [40, -40]
  );

  const projOpacity = useTransform(
    smoothScrollProgress,
    [0.62, 0.66, 0.76, 0.80],
    [0, 1, 1, 0]
  );

  const projY = useTransform(
    smoothScrollProgress,
    [0.62, 0.80],
    [40, -40]
  );

  const storyOpacity = useTransform(
    smoothScrollProgress,
    [0.81, 0.84, 0.88, 0.91],
    [0, 1, 1, 0]
  );

  const storyY = useTransform(
    smoothScrollProgress,
    [0.81, 0.91],
    [40, -40]
  );

  // ============================================
  // ASSEMBLY CARDS
  // ============================================
  const assemblyOpacity = useTransform(
    smoothScrollProgress,
    [0.88, 0.91, 0.95, 0.97],
    [0, 1, 1, 0]
  );

  const photoX = useTransform(
    smoothScrollProgress,
    [0.88, 0.92],
    [-200, 0]
  );

  const photoY = useTransform(
    smoothScrollProgress,
    [0.88, 0.92],
    [-100, 0]
  );

  const nameX = useTransform(
    smoothScrollProgress,
    [0.88, 0.92],
    [200, 0]
  );

  const nameY = useTransform(
    smoothScrollProgress,
    [0.88, 0.92],
    [-100, 0]
  );

  const skillsX = useTransform(
    smoothScrollProgress,
    [0.88, 0.92],
    [200, 0]
  );

  const skillsY = useTransform(
    smoothScrollProgress,
    [0.88, 0.92],
    [200, 0]
  );

  const expX = useTransform(
    smoothScrollProgress,
    [0.88, 0.92],
    [-250, 0]
  );

  const expYNode = useTransform(
    smoothScrollProgress,
    [0.88, 0.92],
    [200, 0]
  );

  const projectX = useTransform(
    smoothScrollProgress,
    [0.88, 0.92],
    [0, 0]
  );

  const projectY = useTransform(
    smoothScrollProgress,
    [0.88, 0.92],
    [300, 0]
  );

  // ============================================
  // CANVAS VEIL
  // ============================================
  const canvasVeilOpacity = useTransform(
    smoothScrollProgress,
    [0.93, 0.97],
    [0, 1]
  );

  // ============================================
  // FINAL CTA
  // ============================================
  const finalCtaOpacity = useTransform(
    smoothScrollProgress,
    [0.96, 0.98],
    [0, 1]
  );

  const finalCtaY = useTransform(
    smoothScrollProgress,
    [0.96, 0.98],
    [30, 0]
  );

  return (
    <>
    <div
      className="landing-container"
      ref={containerRef}
    >
      {/* ============================================
          LOADING SCREEN
      ============================================ */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="cinematic-loader"
            exit={{
              opacity: 0,
              transition: {
                duration: 0.8,
                ease: 'easeInOut',
              },
            }}
          >
            <div className="loader-status">
              Preparing Digital Environment
            </div>

            <div className="loader-bar-bg">
              <motion.div
                className="loader-bar-fill"
                style={{
                  width: `${(loadedCount / 50) * 100}%`,
                }}
              />
            </div>

            <div className="loader-percentage">
              {Math.floor(
                (loadedCount / 50) * 100
              )}
              %
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================
          PINNED SCROLL CANVAS
      ============================================ */}
      {isLoaded && (
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="cinematic-canvas"
          />

          <motion.div
            className="canvas-veil"
            style={{
              opacity: canvasVeilOpacity,
            }}
          />
        </div>
      )}

      {/* ============================================
          SCROLL INDICATOR
      ============================================ */}
      {isLoaded && (
        <motion.div
          className="scroll-indicator"
          style={{
            opacity: scrollIndicatorOpacity,
          }}
        >
          <span>
            SCROLL TO CREATE IDENTITY
          </span>

          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
        </motion.div>
      )}

      {/* ============================================
          OVERLAY ELEMENTS
      ============================================ */}


      {isLoaded && (
  <motion.div
    className="hero-intro-layer"
    style={{
      opacity: heroOpacity,
      y: heroY,
    }}
  >
    <div className="hero-content">

      <div className="hero-small">
        TURN YOUR EXPERIENCE INTO A DIGITAL IDENTITY
      </div>

      <h1 className="hero-main-title">
        MAKE YOUR
        <br />

        <span className="hero-outline">
          visual.
        </span>

        <br />

        IDENTITY
      </h1>

      <p className="hero-description">
        Transform your resume into an interactive
        portfolio that feels like you.
      </p>

      <button
        className="hero-build-btn"
        onClick={onGetStarted}
      >
        BUILD MY PORTFOLIO →
      </button>

    </div>
  </motion.div>
)}

      {isLoaded && (
        <div className="overlay-viewport">

          {/* MOMENT 1 */}
          <motion.div
            className="moment-wrapper"
            style={{
              opacity: introOpacity,
              y: introY,
            }}
          >
            <div className="subtle-pre">
              Create Your Digital Identity
            </div>

            <h1 className="editorial-title">
              Not a resume.
              <br />

              <span className="editorial-serif">
                Your story.
              </span>
            </h1>
          </motion.div>

          {/* MOMENT 2 */}
          <motion.div
            className="moment-wrapper"
            style={{
              opacity: expOpacity,
              y: expY,
            }}
          >
            <div className="subtle-pre">
              Narrate The Timeline
            </div>

            <h1 className="editorial-title">
              Your
              <br />

              <span className="editorial-serif">
                experience.
              </span>
            </h1>
          </motion.div>

          {/* MOMENT 3 */}
          <motion.div
            className="moment-wrapper"
            style={{
              opacity: skillOpacity,
              y: skillY,
            }}
          >
            <div className="subtle-pre">
              Expose The Core Mechanics
            </div>

            <h1 className="editorial-title">
              Your
              <br />

              <span className="editorial-serif">
                skills.
              </span>
            </h1>
          </motion.div>

          {/* MOMENT 4 */}
          <motion.div
            className="moment-wrapper"
            style={{
              opacity: projOpacity,
              y: projY,
            }}
          >
            <div className="subtle-pre">
              Exhibit The Form
            </div>

            <h1 className="editorial-title">
              Your
              <br />

              <span className="editorial-serif">
                projects.
              </span>
            </h1>
          </motion.div>

          {/* MOMENT 5 */}
          <motion.div
            className="moment-wrapper"
            style={{
              opacity: storyOpacity,
              y: storyY,
            }}
          >
            <div className="subtle-pre">
              Unify The Presence
            </div>

            <h1 className="editorial-title ">
              Your
              <br />

              <span className="editorial-serif">
                identity.
              </span>
            </h1>
          </motion.div>

          {/* ============================================
              MOMENT 6 - IDENTITY FRAGMENTS
          ============================================ */}
          <motion.div
            className="assembly-grid"
            style={{
              opacity: assemblyOpacity,
            }}
          >
            {/* PROFILE PHOTO */}
            <motion.div
              className="fragment-card f-photo"
              style={{
                x: photoX,
                y: photoY,
              }}
            >
              <div className="f-photo-box">
                <User
                  size={32}
                  strokeWidth={1}
                />
              </div>

              <div>
                <div className="fragment-label">
                  PROFILE PHOTO
                </div>

                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  IDENTITY.JPG
                </div>
              </div>
            </motion.div>

            {/* BIOGRAPHY */}
            <motion.div
              className="fragment-card f-name"
              style={{
                x: nameX,
                y: nameY,
              }}
            >
              <div className="fragment-label">
                BIOGRAPHY
              </div>

              <h2
                style={{
                  fontSize: '1rem',
                  marginBottom: '0.25rem',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                LUCAS STERLING
              </h2>

              <p
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                }}
              >
                Spatial Interaction Architect
              </p>
            </motion.div>

            {/* SKILLS */}
            <motion.div
              className="fragment-card f-skills"
              style={{
                x: skillsX,
                y: skillsY,
              }}
            >
              <div className="fragment-label">
                CAPABILITIES
              </div>

              <div>
                <span className="f-skill-tag">
                  WebGL
                </span>

                <span className="f-skill-tag">
                  React
                </span>

                <span className="f-skill-tag">
                  Creative Engineering
                </span>

                <span className="f-skill-tag">
                  Interaction Design
                </span>
              </div>
            </motion.div>

            {/* EXPERIENCE */}
            <motion.div
              className="fragment-card f-experience"
              style={{
                x: expX,
                y: expYNode,
              }}
            >
              <div className="fragment-label">
                HISTORY
              </div>

              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                AETHER LABS
              </div>

              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                }}
              >
                Lead Creative Engineer (2024 - Present)
              </div>
            </motion.div>

            {/* PROJECT */}
            <motion.div
              className="fragment-card f-project"
              style={{
                x: projectX,
                y: projectY,
              }}
            >
              <div className="fragment-label">
                LATEST WORK
              </div>

              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                ETHEREAL DREAMSCAPE
              </div>

              <p
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.2rem',
                }}
              >
                Immersive audio-reactive particles.
              </p>
            </motion.div>
          </motion.div>

          {/* ============================================
              MOMENT 7 - FINAL CTA
          ============================================ */}
          <motion.div
            className="final-hero-wrapper"
            style={{
              opacity: finalCtaOpacity,
              y: finalCtaY,
            }}
          >
            <div className="subtle-pre">
              The Gateway Open
            </div>

            <h1
              className="editorial-title"
              style={{
                fontSize:
                  'clamp(2.5rem, 6vw, 6.5rem)',
              }}
            >
              Your work
              <br />

              deserves a place.
              <br />

              <span className="editorial-serif">
                Build yours.
              </span>
            </h1>

            <div className="final-hero-btn">
              <button
                className="cinematic-btn accent"
                onClick={onGetStarted}
              >
                Get Started
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>

        </div>
      )}
    </div>
    
    <motion.div
  style={{
    opacity: finalCtaOpacity,
    pointerEvents: "auto",
    position: "relative",
    zIndex: 100,
  }}
>
  <PremiumHero onGetStarted={onGetStarted} />
</motion.div>

</>
  );
};