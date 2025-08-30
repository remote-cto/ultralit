import { ArrowRight, Award, Sparkles, Target } from "lucide-react";
import FadeInUp from "./FadeInUp";

const WhatYouGetSection = () => {
  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-yellow-600" />,
      title: "Daily ByteDrops",
      description:
        "Crisp explainers with examples and a ready-to-use action"
    },
    {
      icon: <Target className="w-8 h-8 text-yellow-600" />,
      title: "Prompt & Checklist Packs",
      description:
        "Turn ideas into work you can ship"
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-600" />,
      title: "Weekly Recap",
      description:
        "Catch up fast; never fall behind"
    },
    {
      icon: <ArrowRight className="w-8 h-8 text-yellow-600" />,
      title: "Skill Graph",
      description:
        "See momentum, not just scores"
    }
  ];

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-6xl font-bold text-gray-800 mb-4 md:mb-8">
              What You <span className="text-yellow-500">Get</span>
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
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">
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