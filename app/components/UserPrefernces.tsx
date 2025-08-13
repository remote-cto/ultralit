//app/components/userprefrences

"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const UserPrefernces = () => {
  const [preferences, setPreferences] = useState({
    contentType: '',
    language: 'Hindi - English',
    frequency: 'Weekly'
  });
  
  const router = useRouter();

  const contentOptions = [
    {
      id: 'happenings',
      label: 'Latest AI happenings',
      icon: '🔥',
      description: 'Stay updated with the latest AI news and developments'
    },
    {
      id: 'learning-ai',
      label: 'Learn AI',
      icon: '🤖',
      description: 'Master artificial intelligence concepts and applications'
    },
    {
      id: 'learning-python',
      label: 'Learn Python for AI',
      icon: '🐍',
      description: 'Build AI skills with Python programming'
    },
    {
      id: 'learning-agentic',
      label: 'Learn Agentic AI',
      icon: '🚀',
      description: 'Explore autonomous AI agent development'
    }
  ];

  const languageOptions = ['Hindi - English', 'English Only', 'Hindi Only'];
  const frequencyOptions = ['Daily', 'Weekly', 'Bi-Weekly'];

  const handleContentChange = (contentType: string) => {
    setPreferences(prev => ({
      ...prev,
      contentType
    }));
  };

  const handleNext = () => {
    if (!preferences.contentType) {
      alert('Please select what you want to learn');
      return;
    }
    
    // Save preferences to localStorage or send to API
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    // Navigate to payment page
    router.push('/payment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
            Welcome to <span className="text-yellow-500">Ultralit</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">Let's personalize your learning journey</p>
          <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-yellow-300">
          {/* Section 1: What you want */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
              <span className="bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">1</span>
              What you want to learn
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {contentOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    preferences.contentType === option.id
                      ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="contentType"
                    value={option.id}
                    checked={preferences.contentType === option.id}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="mt-1 mr-4 w-5 h-5 text-yellow-500 border-2 border-gray-300 focus:ring-yellow-400"
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{option.icon}</span>
                      <h3 className="text-lg font-semibold text-gray-800">{option.label}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: Language & Frequency */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
              <span className="bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">2</span>
              Preferences
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Language Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Language</h3>
                <div className="space-y-3">
                  {languageOptions.map((lang) => (
                    <label
                      key={lang}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                        preferences.language === lang
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-200 hover:border-yellow-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="language"
                        value={lang}
                        checked={preferences.language === lang}
                        onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                        className="mr-3 w-4 h-4 text-yellow-500 border-2 border-gray-300 focus:ring-yellow-400"
                      />
                      <span className="text-gray-800 font-medium">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Frequency Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Frequency</h3>
                <div className="space-y-3">
                  {frequencyOptions.map((freq) => (
                    <label
                      key={freq}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                        preferences.frequency === freq
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-200 hover:border-yellow-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="frequency"
                        value={freq}
                        checked={preferences.frequency === freq}
                        onChange={(e) => setPreferences(prev => ({ ...prev, frequency: e.target.value }))}
                        className="mr-3 w-4 h-4 text-yellow-500 border-2 border-gray-300 focus:ring-yellow-400"
                      />
                      <span className="text-gray-800 font-medium">{freq}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="text-center">
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-8 h-1 bg-yellow-400"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
          <span className="ml-4 text-sm text-gray-600">Step 2 of 3</span>
        </div>
      </div>
    </div>
  );
};

export default UserPrefernces;