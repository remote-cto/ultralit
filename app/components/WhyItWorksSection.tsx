import { ArrowRight, CheckCircle, Globe, Target } from "lucide-react";
import FadeInUp from "./FadeInUp";

const WhyItWorksSection = () => {
  const benefits = [
    { icon: <CheckCircle className="w-8 h-8" />, title: "Zero Fluff", description: "Essential insights in just 2-3 minutes of reading" },
    { icon: <Target className="w-8 h-8" />, title: "Hyper-Personalized", description: "Content that speaks directly to your professional reality" },
    { icon: <Globe className="w-8 h-8" />, title: "Global Perspective", description: "Learn in your preferred language and cultural context" },
    { icon: <ArrowRight className="w-8 h-8" />, title: "Action-Oriented", description: "Every insight includes clear next steps for implementation" }
  ];

  return (
    <section className="bg-gradient-to-br from-white to-yellow-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8">
              Why It <span className="text-yellow-500">Works</span>
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed by professionals, for professionals who value their time and career growth
            </p>
          </div>
        </FadeInUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((item, index) => (
            <FadeInUp key={index} delay={200 + index * 150}>
              <div className="group text-center p-8 bg-white rounded-3xl border border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {item.title}
                </h3>
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
