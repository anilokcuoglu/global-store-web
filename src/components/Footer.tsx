'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold">Global Store</span>
            </div>
            <p className="text-slate-400">{t('footer.description')}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">{t('footer.home')}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">{t('footer.products')}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">{t('footer.about')}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t('footer.customerService')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">{t('footer.faq')}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">{t('footer.returns')}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">{t('footer.tracking')}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">{t('footer.support')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2">
              <li className="text-slate-400">{t('footer.email')}</li>
              <li className="text-slate-400">{t('footer.phone')}</li>
              <li className="text-slate-400">{t('footer.address')}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
