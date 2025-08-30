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
                <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed">
                  The world won't slow down for anyone. AI, data, and new ways of working are reshaping every role. What wins is not more information—it's <strong>faster adaptation</strong>.
                </p>
              </FadeInUp>

              <FadeInUp delay={400}>
                <div className="bg-yellow-50 p-8 rounded-3xl border border-yellow-200 shadow-md">
                  <p className="text-3xl font-bold text-black mb-4">
                    ByteDrop turns constant change into a daily habit of progress.
                  </p>
                </div>
              </FadeInUp>

              <FadeInUp delay={600}>
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="text-lg text-gray-700">
                      <span className="font-bold text-gray-900">Ultra-clear</span>: 2–3 minute lessons you can finish between meetings
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="text-lg text-gray-700">
                      <span className="font-bold text-gray-900">Truly personal</span>: tailored to your role, level, and language
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="text-lg text-gray-700">
                      <span className="font-bold text-gray-900">Action-first</span>: every Byte ends with one step you can apply today
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="text-lg text-gray-700">
                      <span className="font-bold text-gray-900">Where you are</span>: WhatsApp, email, or app—your choice
                    </p>
                  </div>
                </div>
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyUltralitSection;