import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import DualAudienceSection from '../components/landing/DualAudienceSection';
import CTASection from '../components/landing/CTASection';
import LandingFooter from '../components/landing/LandingFooter';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DualAudienceSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default HomePage;
