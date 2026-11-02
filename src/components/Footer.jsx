import { Instagram, MapPin, MessageCircle, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../hooks/useSettings';

const Footer = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  return (
    <footer className="bg-dark text-warm-white py-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
        <div className="text-center md:text-left flex flex-col items-center md:items-start gap-4">
          <h2 className="text-3xl font-serif text-gold tracking-widest">{t("footer_brand")}</h2>
          <p className="text-gray-400 font-light max-w-sm text-sm">
            {t("footer_desc")}
          </p>
        </div>

        <div className="flex flex-col items-center md:items-start gap-4">
          <h3 className="text-lg uppercase tracking-widest border-b border-gold pb-2 mb-2">{t("visit_us")}</h3>
          <div className="flex items-center gap-3 text-gray-400 text-sm hover:text-gold transition-colors duration-300">
            <MapPin size={18} />
            <p>{t("address")}</p>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-sm hover:text-gold transition-colors duration-300">
            <Mail size={18} />
            <a href="mailto:info@rehanaperfumes.com">info@rehanaperfumes.com</a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-6">
            <a aria-label="Visit us on Instagram" href={settings.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="p-3 border border-white/20 rounded-full hover:bg-gold hover:border-gold hover:text-dark hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-300 transform hover:-translate-y-1">
              <Instagram size={20} />
            </a>
            <a 
              href={`https://wa.me/${settings.whatsappNumber}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 border border-white/20 rounded-full hover:bg-[#25D366] hover:border-[#25D366] hover:shadow-[0_0_15px_rgba(37,211,102,0.4)] transition-all duration-300 transform hover:-translate-y-1"
              aria-label="Chat with us on WhatsApp"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gold/30 text-center text-sm text-gray-400 font-light tracking-wider">
        <p>{t("copyright")}</p>
      </div>
    </footer>
  );
};

export default Footer;
