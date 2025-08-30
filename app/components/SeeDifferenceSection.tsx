import { CheckCircle, Clock, Zap, TrendingUp } from "lucide-react";
import FadeInUp from "./FadeInUp";

const SeeDifferenceSection = () => {
  const benefits = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Make better decisions, faster",
      description: "Cut through information overload with AI-powered insights"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-yellow-600" />,
      title: "Automate repeat work with AI prompts and checklists",
      description: "Transform routine tasks into streamlined workflows"
    },
    {
      icon: <Clock className="w-8 h-8 text-yellow-600" />,
      title: "Speak the language of AI with confidence",
      description: "Master the terminology and concepts that matter most"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-yellow-600" />,
      title: "Build a visible habit of progress",
      description: "Track your growth with meaningful metrics and milestones"
    }
  ];

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-6xl font-bold text-gray-800 mb-4 md:mb-8">
              See the <span className="text-yellow-500">Difference</span> in 30 Days
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform how you work and think with measurable results in just one month
            </p>
          </div>
        </FadeInUp>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <FadeInUp key={index} delay={200 + index * 200}>
              <div className="group flex items-start space-x-6 p-8 bg-yellow-50 rounded-3xl border border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </FadeInUp>
          ))}
        </div>

        <FadeInUp delay={1000}>
          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-500 rounded-full shadow-lg mb-6">
              <span className="text-3xl font-bold text-white">30</span>
            </div>
            <p className="text-lg text-gray-600 font-medium">
              Days to measurable transformation
            </p>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
};

export default SeeDifferenceSection;