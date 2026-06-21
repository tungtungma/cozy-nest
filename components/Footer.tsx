"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();

  const t = {
    en: {
      brandName: "Tung Ma Soup",
      brandDesc: "Hong Kong's premier destination for authentic, premium dried seafood. Tradition and quality in every selection.",
      quickLinks: "Quick Links",
      aboutUs: "About Us",
      products: "Products",
      contact: "Contact",
      faq: "FAQ",
      contactUs: "Contact Us",
      copyright: "All rights reserved.",
    },
    zh: {
      brandName: "桐媽靚湯",
      brandDesc: "香港最優質的乾海味精選。傳統與優質的結合。",
      quickLinks: "快速連結",
      aboutUs: "關於我們",
      products: "產品",
      contact: "聯絡",
      faq: "常見問題",
      contactUs: "聯絡我們",
      copyright: "保留所有權利。",
    },
  };

  const text = t[language];

  return (
    <footer className="bg-gradient-to-r from-umber-deep via-umber to-umber-deep text-cream py-20 md:py-24">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 mb-16">
          <div>
            <h3 className={`font-caveat font-bold mb-6 ${language === "zh" ? "font-brush text-3xl" : "text-3xl"}`}>
              {text.brandName}
            </h3>
            <p className="font-lora text-cream/70 text-base leading-relaxed">
              {text.brandDesc}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-caveat font-semibold text-cream/90 mb-6 tracking-wide">
              {text.quickLinks}
            </h4>
            <ul className="space-y-3 font-lora text-base">
              <li>
                <a href="#" className="text-cream/70 hover:text-terracotta-light transition-colors duration-300">
                  {text.aboutUs}
                </a>
              </li>
              <li>
                <a href="#" className="text-cream/70 hover:text-terracotta-light transition-colors duration-300">
                  {text.products}
                </a>
              </li>
              <li>
                <a href="#" className="text-cream/70 hover:text-terracotta-light transition-colors duration-300">
                  {text.contact}
                </a>
              </li>
              <li>
                <a href="#" className="text-cream/70 hover:text-terracotta-light transition-colors duration-300">
                  {text.faq}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-caveat font-semibold text-cream/90 mb-6 tracking-wide">
              {text.contactUs}
            </h4>
            <ul className="space-y-3 font-lora text-base text-cream/70">
              <li>Email: info@heritageocean.hk</li>
              <li>Hong Kong</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-10 text-center">
          <p className="font-lora text-sm text-cream/50">
            &copy; {new Date().getFullYear()} {text.brandName}. {text.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}