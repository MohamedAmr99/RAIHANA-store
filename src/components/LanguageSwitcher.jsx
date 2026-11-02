import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("app_lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-dark hover:text-gold transition-colors duration-300"
      aria-label="Toggle language"
    >
      <Globe size={18} />
      <span>{i18n.language === "en" ? "عربي" : "EN"}</span>
    </button>
  );
};

export default LanguageSwitcher;
