"use client";
import React from "react";
import FadeInUp from "./FadeInUp";
import { Star, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-white flex items-center overflow-hidden">
      <div className="absolute inset-0"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-5xl mx-auto">
          <FadeInUp delay={200}>
            <div className="inline-flex items-center space-x-2 bg-yellow-100/80 backdrop-blur-md px-6 py-3 rounded-full border border-yellow-300 shadow-md mb-8">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-700 font-semibold">
                Your AI Edge, Delivered Daily
              </span>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
          </FadeInUp>

          <FadeInUp delay={400}>
            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight text-gray-900 drop-shadow-sm">
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                ByteDrop
              </span>
              <br />
              <span className="text-gray-800 text-4xl md:text-6xl">
                Master Tomorrow's Technology
              </span>
              <br />
              <span className="text-gray-500 text-3xl md:text-5xl font-medium">
                Today
              </span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={600}>
            <div className="space-y-4 mb-12">
              <p className="text-2xl md:text-3xl text-gray-700 font-medium">
                <span className="text-yellow-500 font-bold">Bite-Sized</span> •{" "}
                <span className="text-yellow-500 font-bold">Role-Specific</span>{" "}
                • <span className="text-yellow-500 font-bold">Actionable</span>
              </p>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Transform complex AI breakthroughs into personalized insights
                that accelerate your career, delivered seamlessly to your
                WhatsApp or email.
              </p>
            </div>
          </FadeInUp>

          <FadeInUp delay={800}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="group bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-12 py-5 rounded-full font-bold text-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,215,0,0.6)] hover:scale-105 flex items-center gap-3 shadow-md">
                <span className="text-2xl">🚀</span>
                Start Your Journey
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="text-center">
                <span className="text-sm text-gray-500 block">
                  7-Day Free Trial
                </span>
                <span className="text-xs text-gray-400">
                  No Credit Card Required
                </span>
              </div>
            </div>
          </FadeInUp>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float 12s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
