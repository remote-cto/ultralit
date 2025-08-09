import { ArrowRight, Award, Sparkles, Target } from "lucide-react";
import FadeInUp from "./FadeInUp";

const WhatYouGetSection = () => {
  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-yellow-600" />,
      title: "AI Intelligence Decoded",
      description:
        "Complex breakthroughs simplified into actionable knowledge you can apply immediately"
    },
    {
      icon: <Target className="w-8 h-8 text-yellow-600" />,
      title: "Emerging Tech Radar",
      description:
        "Quantum computing, IoT, blockchain innovations — and their real impact on your industry"
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-600" />,
      title: "Industry Deep Dives",
      description:
        "Sector-specific innovations that are reshaping your professional landscape"
    },
    {
      icon: <ArrowRight className="w-8 h-8 text-yellow-600" />,
      title: "Strategic Action Steps",
      description:
        "Transform today's insights into tomorrow's competitive advantages"
    }
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8">
              What You <span className="text-yellow-500">Receive</span>
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Premium intelligence delivered in formats that fit your busy
              lifestyle
            </p>
          </div>
        </FadeInUp>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FadeInUp key={index} delay={200 + index * 200}>
              <div className="group flex items-start space-x-6 p-8 bg-yellow-50 rounded-3xl border border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatYouGetSection;
