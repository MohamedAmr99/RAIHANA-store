import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const buttonRef = useRef(null);

  // --- Typing Animation State ---
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const fullText = t("hero_title");
  const period = 2000; // Duration between cycles
  const [delta, setDelta] = useState(() => 200 - Math.random() * 100);

  const tick = useCallback(() => {
    let updatedText = isDeleting
      ? fullText.substring(0, displayText.length - 1)
      : fullText.substring(0, displayText.length + 1);

    setDisplayText(updatedText);

    if (isDeleting) {
      setDelta((prevDelta) => prevDelta / 1.5); // Faster deleting
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setDelta(period); // Wait before start deleting
    } else if (isDeleting && updatedText === "") {
      setIsDeleting(false);
      setDelta(300); // Wait before start typing again
    }
  }, [displayText, isDeleting, fullText, period]);

  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, delta);

    return () => clearInterval(ticker);
  }, [tick, delta]);

  // --- Animation Values ---
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - (rect.left + rect.width / 2)) * 0.4);
    mouseY.set((e.clientY - (rect.top + rect.height / 2)) * 0.4);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const scrollToCategories = () => {
    const element = document.getElementById("categories");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative w-full h-svh flex flex-col items-center justify-center overflow-hidden bg-[#050505]"
    >
      {/* Background Layer */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 w-full h-full overflow-hidden"
      >
        <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 blur-[120px] rounded-full animate-spotlight"></div>
        </div>

        <video
          poster="/images/render-1.jpg"
          preload="auto"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50 scale-105"
        >
          <source src="/videos/women.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-transparent to-black/90 z-2"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-60 z-2"></div>
      </motion.div>

      {/* Content Layer */}
      <div className="z-10 text-center px-6 max-w-5xl flex flex-col items-center">
        {/* Decorative Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-8 px-5 py-2 border border-gold/20 rounded-full bg-black/40 backdrop-blur-xl group hover:border-gold/40 transition-colors duration-500"
        >
          <span className="text-gold text-[10px] uppercase tracking-[0.5em] font-medium italic">
            {t("luxury_experience")}
          </span>
        </motion.div>

        {/* Typing Title - Plain White */}
        <div className="min-h-[120px] md:min-h-[180px] flex items-center justify-center">
          <motion.h1
            className="text-5xl md:text-8xl font-serif text-white tracking-tight leading-tight"
            style={{ textShadow: "0 0 50px rgba(0,0,0,0.8)" }}
          >
            {displayText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="inline-block w-2 h-[1em] bg-gold ml-2 align-middle"
            />
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-lg md:text-2xl text-white/60 mb-14 font-light max-w-2xl leading-relaxed tracking-wide"
        >
          {t("hero_subtitle")}
        </motion.p>

        {/* Magnetic CTA Button */}
        <motion.div
          ref={buttonRef}
          onMouseLeave={handleMouseLeave}
          style={{ x: springX, y: springY }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="relative"
        >
          <button
            onClick={scrollToCategories}
            className="group relative px-16 py-5 overflow-hidden rounded-sm bg-gold/10 backdrop-blur-md border border-gold/30 hover:border-gold transition-all duration-700"
          >
            <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out"></div>
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <span className="relative z-10 text-white group-hover:text-black text-xs uppercase tracking-[0.4em] font-semibold transition-colors duration-700">
              {t("explore_collection")}
            </span>
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 z-10 cursor-pointer text-white/30 hover:text-gold transition-all duration-500"
        onClick={scrollToCategories}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-px h-16 bg-linear-to-b from-transparent via-gold/40 to-transparent"></div>
          <span
            className="text-[9px] uppercase tracking-[0.6em] rotate-180 opacity-60"
            style={{ writingMode: "vertical-rl" }}
          >
            {t("scroll")}
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

{
  /* <motion.div 
        style={{ y }}
        className="absolute inset-0 w-full h-full"
      >
        <img 
          src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop" 
          alt="Luxury Perfume" 
          className="w-full h-full object-cover opacity-60"
        />
        {/* Soft Dark Gradient Overlay */
}
// <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-warm-white"></div>
// </motion.div> */}

