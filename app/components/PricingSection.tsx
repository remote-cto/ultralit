import FadeInUp from "./FadeInUp";

const PricingSection = () => {
  const plans = [
    {
      name: "Students",
      price: "₹200",
      period: "/month",
      description: "Perfect for learners and aspiring professionals",
      icon: "🎓",
      popular: false,
      buttonColor: "from-blue-500 to-cyan-500"
    },
    {
      name: "Professionals & Executives",
      price: "₹500",
      period: "/month",
      description: "For working professionals and business leaders",
      icon: "💼",
      popular: true,
      buttonColor: "from-yellow-400 to-yellow-500"
    },
    {
      name: "Free Trial",
      price: "7 Days",
      period: " Free",
      description: "Experience everything with no commitment",
      icon: "🚀",
      popular: false,
      buttonColor: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section id="pricing" className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8">
              Investment in{" "}
              <span className="text-yellow-500">Your Future</span>
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that accelerates your professional growth
            </p>
          </div>
        </FadeInUp>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <FadeInUp key={index} delay={200 + index * 200}>
              <div
                className={`relative bg-yellow-50 rounded-3xl p-8 border ${
                  plan.popular
                    ? "border-yellow-400 shadow-xl shadow-yellow-200 scale-105"
                    : "border-yellow-200 shadow-lg"
                } hover:scale-110 transition-all duration-500 group`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-yellow-100 rounded-2xl text-4xl group-hover:scale-110 transition-transform duration-300">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-yellow-500">
                      {plan.price}
                    </span>
                    <span className="text-lg text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {plan.description}
                  </p>
                  <button
                    className={`w-full bg-gradient-to-r ${plan.buttonColor} text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 shadow-lg`}
                  >
                    {plan.name === "Free Trial"
                      ? "Start Free Trial"
                      : "Choose Plan"}
                  </button>
                </div>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
