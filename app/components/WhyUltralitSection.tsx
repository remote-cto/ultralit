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
                <h2 className="text-3xl md:text-6xl font-bold text-gray-800 mb-4 md:mb-8">
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
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-3xl border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <p className="text-xl lg:text-3xl font-bold text-black mb-4">
                    ByteDrop turns constant change into a daily habit of progress.
                  </p>
                </div>
              </FadeInUp>

              <FadeInUp delay={600}>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-yellow-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-yellow-500 rounded-xl mb-4 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <p className="text-lg text-gray-700">
                        <span className="font-bold text-gray-900 text-xl">Ultra-clear</span>
                        <br />
                        <span className="text-gray-600">2–3 minute lessons you can finish between meetings</span>
                      </p>
                    </div>
                  </div>

                  <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-yellow-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl mb-4 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-lg text-gray-700">
                        <span className="font-bold text-gray-900 text-xl">Truly personal</span>
                        <br />
                        <span className="text-gray-600">tailored to your role, level, and language</span>
                      </p>
                    </div>
                  </div>

                  <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-yellow-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-green-500 rounded-xl mb-4 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-lg text-gray-700">
                        <span className="font-bold text-gray-900 text-xl">Action-first</span>
                        <br />
                        <span className="text-gray-600">every Byte ends with one step you can apply today</span>
                      </p>
                    </div>
                  </div>

                  <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-yellow-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl mb-4 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-lg text-gray-700">
                        <span className="font-bold text-gray-900 text-xl">Where you are</span>
                        <br />
                        <span className="text-gray-600">WhatsApp, email, or app—your choice</span>
                      </p>
                    </div>
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