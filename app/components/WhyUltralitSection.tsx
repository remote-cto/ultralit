import React from "react";
import FadeInUp from "./FadeInUp";

const WhyUltralitSection = () => {
  return (
    <div>
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <FadeInUp>
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8">
                  Why <span className="text-yellow-500">ByteDrop</span>?
                </h2>
                <div className="w-24 h-1 bg-yellow-400 mx-auto mb-4"></div>
              </div>
            </FadeInUp>

            <div className="space-y-4 text-center">
              <FadeInUp delay={200}>
                <p className="text-2xl text-gray-700 leading-relaxed">
                  The AI revolution isn't waiting. Every breakthrough reshapes
                  industries, creates opportunities, and demands new skills.
                </p>
              </FadeInUp>

              <FadeInUp delay={400}>
                <div className="bg-yellow-50 p-8 rounded-3xl border border-yellow-200 shadow-md">
                  <p className="text-3xl font-bold text-black mb-4">
                    Ultralit keeps you ahead — without the overwhelm.
                  </p>
                </div>
              </FadeInUp>

              <FadeInUp delay={600}>
                <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                  We curate the most impactful AI and emerging tech updates ,
                  then personalize them for your role, your language, your
                  ambitions . No noise. No fluff. Just intelligence that moves
                  you forward.
                </p>
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyUltralitSection;
