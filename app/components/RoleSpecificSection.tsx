import FadeInUp from "./FadeInUp";

const RoleSpecificSection = () => {
  const roles = [
    {
      role: "Students",
      benefit: "Job-ready skills without overwhelm",
      color: "from-blue-400 to-cyan-400",
      icon: "🎓"
    },
    {
      role: "Professionals",
      benefit: "Workflows, prompts, and tools that save hours",
      color: "from-green-400 to-emerald-400",
      icon: "💼"
    },
    {
      role: "Leaders/Founders",
      benefit: "Strategy-grade clarity in minutes",
      color: "from-purple-400 to-violet-400",
      icon: "👑"
    },
    {
      role: "Educators/Teams",
      benefit: "Micro-curricula, engagement, and analytics",
      color: "from-red-400 to-rose-400",
      icon: "📚"
    }
  ];

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-6xl font-bold text-gray-800 mb-4 md:mb-8">
              Built for{" "}
              <span className="text-yellow-500">Real People</span>
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every professional journey is unique. Our AI insights adapt to
              your specific needs and aspirations.
            </p>
          </div>
        </FadeInUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {roles.map((item, index) => (
            <FadeInUp key={index} delay={200 + index * 100}>
              <div className="group relative bg-yellow-50 p-8 rounded-3xl border border-yellow-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <span className="text-4xl mr-4">{item.icon}</span>
                    <h4 className="text-xl lg:text-2xl font-bold text-gray-800">
                      {item.role}
                    </h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {item.benefit}
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

export default RoleSpecificSection;