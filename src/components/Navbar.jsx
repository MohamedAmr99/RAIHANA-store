import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="absolute top-0 w-full z-50 bg-warm-white/80 backdrop-blur-md border-b border-dark/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="shrink-0 flex items-center">
            <Link
              to="/"
              className="text-2xl font-serif tracking-widest text-dark hover:text-gold transition-colors duration-300"
            >
              RAIHANA
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex sm:space-x-8 items-center mr-6">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:text-dark hover:border-gold border-b-2 px-1 pt-1 text-sm font-medium uppercase tracking-widest transition-colors duration-300"
              >
                {t("home")}
              </Link>
              <Link
                to="/perfumes"
                className="border-transparent text-gray-500 hover:text-dark hover:border-gold border-b-2 px-1 pt-1 text-sm font-medium uppercase tracking-widest transition-colors duration-300"
              >
                {t("perfumes")}
              </Link>
              <Link
                to="/incense"
                className="border-transparent text-gray-500 hover:text-dark hover:border-gold border-b-2 px-1 pt-1 text-sm font-medium uppercase tracking-widest transition-colors duration-300"
              >
                {t("incense_nav")}
              </Link>
              <Link
                to="/diffusers"
                className="border-transparent text-gray-500 hover:text-dark hover:border-gold border-b-2 px-1 pt-1 text-sm font-medium uppercase tracking-widest transition-colors duration-300"
              >
                {t("diffusers_nav")}
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />

              {/* Mobile Menu Toggle */}
              <button
                aria-label="Toggle mobile menu"
                className="sm:hidden text-dark p-2 hover:text-gold transition-colors"
                onClick={toggleMenu}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-warm-white border-b border-dark/5 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col space-y-6 text-center">
              <Link
                to="/"
                onClick={closeMenu}
                className="text-dark hover:text-gold font-medium uppercase tracking-widest text-sm transition-colors"
              >
                {t("home")}
              </Link>
              <Link
                to="/perfumes"
                onClick={closeMenu}
                className="text-dark hover:text-gold font-medium uppercase tracking-widest text-sm transition-colors"
              >
                {t("perfumes")}
              </Link>
              <Link
                to="/incense"
                onClick={closeMenu}
                className="text-dark hover:text-gold font-medium uppercase tracking-widest text-sm transition-colors"
              >
                {t("incense_nav")}
              </Link>
              <Link
                to="/diffusers"
                onClick={closeMenu}
                className="text-dark hover:text-gold font-medium uppercase tracking-widest text-sm transition-colors"
              >
                {t("diffusers_nav")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
