"use client";
import { useState } from "react";

const FAQSection = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const faqs = [
    {
      question: "How short is a Byte?",
      answer: "2–3 minutes—explainer, example, one action.",
    },
    {
      question: "Do I need a new app?",
      answer: "No. Use WhatsApp or email; app is optional.",
    },
    {
      question: "Is this just AI news?",
      answer:
        "No. ByteDrop is continuous micro-learning with actions, not headlines.",
    },
    {
      question: "What about privacy?",
      answer:
        "We don't sell data. Preferences are used only to personalize learning.",
    },
  ];

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8">
            Frequently Asked <span className="text-yellow-500">Questions</span>
          </h2>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about ByteDrop
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-yellow-50 transition-colors duration-200"
              >
                <h3 className="text-xl font-semibold text-gray-800 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center transition-transform duration-300 ${
                      openQuestion === index ? "rotate-45" : ""
                    }`}
                  >
                    <span className="text-white font-bold text-lg">+</span>
                  </div>
                </div>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  openQuestion === index
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="px-8 pb-6">
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
