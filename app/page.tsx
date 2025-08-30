import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";

import HowItWorksSection from "./components/HowItWorksSection";
import PricingSection from "./components/PricingSection";
import WhatYouGetSection from "./components/WhatYouGetSection";
import WhyItWorksSection from "./components/WhyItWorksSection";
import RoleSpecificSection from './components/RoleSpecificSection';


import WhyUltralitSection from "./components/WhyUltralitSection";
import FAQSection from "./components/FAQSection";
import SeeDifferenceSection from "./components/SeeDifferenceSection";


export default function Home() {
  return (
   <div>
    <Header />
      <HeroSection />
      <WhyUltralitSection />
      <HowItWorksSection />
      <WhatYouGetSection />
      <RoleSpecificSection />
      <WhyItWorksSection />
      <SeeDifferenceSection/>
      <PricingSection />
      {/* <CTASection /> */}
      <FAQSection/>
      <Footer />

   </div>
  );
}
