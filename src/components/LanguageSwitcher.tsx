'use client';

import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useApp();
  const { t } = useTranslation();

  return (
    <div className="relative group">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'tr')}
        className="appearance-none bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/50 rounded-lg px-3 py-2 pr-8 text-slate-700 dark:text-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 hover:bg-white/20 dark:hover:bg-slate-800/70 transition-all duration-200 cursor-pointer"
      >
        <option value="tr" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
          {t('language.turkish')}
        </option>
        <option value="en" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
          {t('language.english')}
        </option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
