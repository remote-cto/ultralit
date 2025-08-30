import FadeInUp from "./FadeInUp";

const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      title: "Tell us your goals",
      description:
        "Pick your role (Student, Professional, Leader, Educator) and outcomes you care about.",
      icon: "🎯",
    },
    {
      number: 2,
      title: "Choose your BytePaths",
      description:
        "Focused tracks (e.g., AI for Work, Data Basics, Cybersecurity Essentials, Healthcare AI, Hospitality Ops, Cloud Productivity).",
      icon: "📚",
    },
    {
      number: 3,
      title: "Learn → Do → Prove",
      description: "Each Byte includes: explainer → real example → one action. Micro-quizzes reinforce learning; your Skill Graph shows progress over time.",
      icon: "✨",
    },
    {
      number: 4,
      title: "Keep your streak",
      description:
        "Daily or weekly cadence. Nudge at the time you prefer. Consistency, made easy.",
      icon: "🧠",
    },
  ];

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8">
              How ByteDrop <span className="text-yellow-500">Works</span>
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four simple steps to master any skill with bite-sized learning
            </p>
          </div>
        </FadeInUp>

        {/* Ensure equal height */}
        <div className="grid md:grid-cols-4 gap-8 max-w-8xl mx-auto items-stretch">
          {steps.map((step, index) => (
            <FadeInUp key={step.number} delay={200 + index * 200}>
              <div className="group text-center p-8 bg-yellow-50 rounded-3xl border border-yellow-200 hover:border-yellow-400 transition-all duration-500 hover:scale-105 shadow-lg h-full flex flex-col">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  {step.description}
                </p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;