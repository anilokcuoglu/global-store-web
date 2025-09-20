import Header from '@/components/Header';
import FeaturedProducts from '@/components/FeaturedProducts';
import FeaturesSection from '@/components/FeaturesSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      {/* <HeroSection /> */}
      <FeaturedProducts />
      <FeaturesSection />
      {/* <Footer /> */}
    </div>
  );
}