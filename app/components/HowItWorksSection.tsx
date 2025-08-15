import FadeInUp from "./FadeInUp";

const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      title: "Define Your Profile",
      description:
        "Student, Professional, Executive, Specialist — we adapt to you",
      icon: "🎯",
    },
    {
      number: 2,
      title: "Select Your Topic of Interest",
      description:
        "From AI to Climate Tech, Fintech to Cybersecurity — choose the topics that matter to you most. We’ll tailor every update to your curiosity and goals.",
      icon: "📚",
    },
    {
      number: 3,
      title: "Sign Up Instantly",
      description: "Begin your 7-day premium trial with zero commitment",
      icon: "✨",
    },
    {
      number: 4,
      title: "Receive Personalized Intelligence",
      description:
        "Daily or weekly insights crafted for your success and tailored to your growth goals across multiple aspects of your career or studies.",
      icon: "🧠",
    },
  ];

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8">
              How It <span className="text-yellow-500">Works</span>
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform your relationship with technology
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
