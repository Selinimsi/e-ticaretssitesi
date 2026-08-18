import React from 'react';
import { Link } from 'react-router-dom';
import { Package, CreditCard, ShieldCheck, Mail, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-gray-800 pb-12">
          {/* Brand & About */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 text-white p-2 rounded-xl">
                <Package size={24} />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">Varunet<span className="text-primary-500">Shop</span></span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">{t('footer.corporate')}</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-primary-500 transition-colors">{t('footer.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary-500 transition-colors">{t('footer.contact')}</Link></li>
              <li><Link to="/faq" className="hover:text-primary-500 transition-colors">{t('footer.faq')}</Link></li>
              <li><Link to="#" className="hover:text-primary-500 transition-colors">{t('footer.careers')}</Link></li>
            </ul>
          </div>

          {/* Yardım & Destek */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">{t('footer.helpSupport')}</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="#" className="hover:text-primary-500 transition-colors">{t('footer.delivery')}</Link></li>
              <li><Link to="#" className="hover:text-primary-500 transition-colors">{t('footer.returns')}</Link></li>
              <li><Link to="#" className="hover:text-primary-500 transition-colors">{t('footer.warranty')}</Link></li>
              <li><Link to="#" className="hover:text-primary-500 transition-colors">{t('footer.privacy')}</Link></li>
            </ul>
          </div>

          {/* Bülten */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">{t('footer.newsletterTitle')}</h3>
            <p className="text-sm text-gray-400 mb-4">{t('footer.newsletterDesc')}</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder={t('footer.emailPlaceholder')}
                className="bg-gray-800 text-white px-4 py-3 rounded-l-xl focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
              />
              <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-3 rounded-r-xl transition-colors">
                <Mail size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Varunet E-Shop. {t('footer.allRightsReserved')}
          </p>
          <div className="flex items-center gap-6 text-gray-500">
            <div className="flex items-center gap-2"><ShieldCheck size={20} /> <span className="text-sm">256-Bit SSL</span></div>
            <div className="flex items-center gap-2"><CreditCard size={20} /> <span className="text-sm">{t('footer.securePayment')}</span></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
