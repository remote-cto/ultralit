import { ArrowRight } from "lucide-react";
import FadeInUp from "./FadeInUp";

const CTASection = () => {
  return (
    <section className="relative bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-200 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 to-amber-300/20"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-amber-200/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeInUp>
          <h2 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
            Join the <span className="text-amber-600">AI-First</span> Generation
          </h2>
        </FadeInUp>
        
        <FadeInUp delay={200}>
          <p className="text-2xl text-slate-800 mb-6 max-w-4xl mx-auto leading-relaxed">
            Don't let AI happen to you. Learn it, master it, lead with it.
          </p>
        </FadeInUp>
        
        <FadeInUp delay={400}>
          <p className="text-xl text-slate-700 mb-12 max-w-3xl mx-auto">
            Transform your career trajectory with personalized AI intelligence. 
            Start your journey today and stay ahead of tomorrow's opportunities.
          </p>
        </FadeInUp>
        
        <FadeInUp delay={600}>
          <button className="group bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 px-12 py-5 rounded-full font-bold text-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center gap-4 mx-auto shadow-xl">
            <span className="text-3xl">🚀</span>
            Start Your 7-Day Free Trial
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </FadeInUp>
        
        <FadeInUp delay={800}>
          <div className="mt-8 text-slate-800">
            <p className="text-sm font-medium">Join 10,000+ professionals already accelerating their careers</p>
            <p className="text-xs mt-2">No credit card required • Cancel anytime</p>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
};

export default CTASection;
