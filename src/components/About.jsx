import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
        {/* Image Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full md:w-1/2 relative"
        >
          <div className="relative aspect-4/5 rounded-tl-[100px] rounded-br-[100px] overflow-hidden shadow-2xl">
            <img
              src="images/render-2.jpg"
              alt="Luxury Perfume Bottles"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-dark/60 via-transparent to-transparent"></div>
          </div>
          {/* Decorative Border */}
          <div className="absolute -inset-4 border-2 border-gold/30 rounded-tl-[110px] rounded-br-[110px] -z-10 hidden md:block"></div>
        </motion.div>

        {/* Text Side */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full md:w-1/2 flex flex-col"
        >
          <div className="mb-8">
            <span className="text-gold uppercase tracking-widest text-sm font-semibold mb-2 block">
              {t("about_subtitle")}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-dark mb-6">
              {t("about_title")}
            </h2>
            <div className="w-20 h-[2px] bg-gold mb-8"></div>
          </div>

          <div className="space-y-6 text-gray-600 font-light leading-relaxed text-lg">
            <p>{t("about_p1")}</p>
            <p>{t("about_p2")}</p>
            <div className="p-6 bg-warm-white border-l-4 border-gold italic">
              <p className="font-medium text-dark mb-2">{t("about_p3")}</p>
              <p>{t("about_p4")}</p>
            </div>
            <p className="text-xl font-serif text-dark mt-8 border-t border-gray-100 pt-8">
              {t("about_footer")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
