import { ArrowRight, CheckCircle, Globe, Target, TrendingUp, Shield } from "lucide-react";
import FadeInUp from "./FadeInUp";

const WhyItWorksSection = () => {
  const benefits = [
    { icon: <CheckCircle className="w-8 h-8" />, title: "Zero Fluff", description: "Clarity over jargon, always" },
    { icon: <Target className="w-8 h-8" />, title: "Adaptive", description: "Adjusts to your pace and performance" },
    { icon: <ArrowRight className="w-8 h-8" />, title: "Action-Oriented", description: "Every lesson ends with a concrete next step" },
    { icon: <TrendingUp className="w-8 h-8" />, title: "Measurable", description: "Track capability growth with the Skill Graph" },
    { icon: <Shield className="w-8 h-8" />, title: "Privacy-First", description: "Your data personalizes learning—never sold" }
  ];

  return (
    <section className="bg-gradient-to-br from-white to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-6xl font-bold text-gray-800 mb-4 md:mb-8">
              Why ByteDrop <span className="text-yellow-500">Works</span>
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed by professionals, for professionals who value their time and career growth
            </p>
          </div>
        </FadeInUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {benefits.map((item, index) => (
            <FadeInUp key={index} delay={200 + index * 150}>
              <div className="group text-center p-8 bg-white rounded-3xl border border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 h-80 w-full flex flex-col justify-between">
                <div className="flex flex-col items-center flex-grow">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyItWorksSection;