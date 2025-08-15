//app/components/userpreferences
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext"; // Import the auth context

interface Topic {
  id: number;
  name: string;
  description: string;
  topic_type: number;
}

const UserPreferences = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    role: "",
    industry: "",
    language: "English",
    topicId: 0,
    preferredMode: "Whatsapp",
    frequency: "Weekly",
    otherIndustry: "",
  });

  const router = useRouter();
  const { user, isAuthenticated } = useAuth(); // Get user from auth context

  const roleOptions = [
    "Student",
    "Professional",
    "Entrepreneur",
    "CXO",
    "Faculty",
  ];

  const industryOptions = [
    "Healthcare",
    "Finance / Banking",
    "Education",
    "Manufacturing",
    "Retail / eCommerce",
    "Logistics",
    "Legal / Compliance",
    "Marketing & Advertising",
    "Government / Public Sector",
    "Media / Entertainment",
    "Agritech",
    "Others",
  ];

  const languageOptions = ["Hindi", "English"];
  const modeOptions = ["Whatsapp", "Email"];
  const frequencyOptions = ["Weekly", "Bi-Weekly"];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/auth"); // Redirect to login if not authenticated
      return;
    }
  }, [isAuthenticated, user, router]);

  // Fetch topics from DB
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // Fetch topics with GET request (you'll need to create this endpoint)
        const res = await fetch("/api/fetch-topics", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        if (data.success) {
          setTopics(data.topics || []);
        } else {
          console.error("Failed to load topics:", data.error);
          alert("Failed to load topics. Please refresh the page.");
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
        alert("Error loading topics. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if user is authenticated
    if (isAuthenticated && user) {
      fetchTopics();
    }
  }, [isAuthenticated, user]);

  // Handle topic selection
  const handleTopicChange = (topicId: number) => {
    setPreferences((prev) => ({
      ...prev,
      topicId,
    }));
  };

  // Handle industry change
  const handleIndustryChange = (industry: string) => {
    setPreferences((prev) => ({
      ...prev,
      industry,
      otherIndustry: industry === "Others" ? prev.otherIndustry : "",
    }));
  };

  // Save preferences
  const handleNext = async () => {
    // Validation
    if (!preferences.role) {
      alert("Please select your role");
      return;
    }
    if (!preferences.industry) {
      alert("Please select your industry");
      return;
    }
    if (preferences.industry === "Others" && !preferences.otherIndustry.trim()) {
      alert("Please specify your industry");
      return;
    }
    if (!preferences.language) {
      alert("Please select your preferred language");
      return;
    }
    if (!preferences.topicId) {
      alert("Please select what you want to learn");
      return;
    }

    // Check if user is authenticated
    if (!user?.id) {
      alert("Please log in to continue");
      router.push("/auth");
      return;
    }

    setSaving(true);

    try {
      const finalIndustry = preferences.industry === "Others" 
        ? preferences.otherIndustry.trim() 
        : preferences.industry;

      const requestBody = {
        user_id: user.id,
        role: preferences.role,
        industry: finalIndustry,
        language: preferences.language,
        topic_ids: [preferences.topicId],
        preferred_mode: preferences.preferredMode,
        frequency: preferences.frequency,
      };

      console.log("Saving preferences:", requestBody); // Debug log

      const res = await fetch("/api/user-preference", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        
        router.push("/payment");
      } else {
        alert("Failed to save preferences: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Error saving preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Show loading screen while checking authentication or loading topics
  if (!isAuthenticated || !user || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isAuthenticated || !user ? "Checking authentication..." : "Loading topics..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
            Welcome to <span className="text-yellow-500">Ultralit</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Let's personalize your learning journey
          </p>
          <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-yellow-300">
          {/* Section 1: Select Role */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
              <span className="bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">
                👤
              </span>
              Section 1: Select Role
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roleOptions.map((role) => (
                <label
                  key={role}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    preferences.role === role
                      ? "border-yellow-400 bg-yellow-50 shadow-lg"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={preferences.role === role}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    className="mr-3 w-4 h-4 text-yellow-500 border-2 border-gray-300 focus:ring-yellow-400"
                  />
                  <span className="text-gray-800 font-medium">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: Choose Your Industry */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
              <span className="bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">
                🏭
              </span>
              Step 2: Choose Your Industry
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industryOptions.map((industry) => (
                <label
                  key={industry}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    preferences.industry === industry
                      ? "border-yellow-400 bg-yellow-50 shadow-lg"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="industry"
                    value={industry}
                    checked={preferences.industry === industry}
                    onChange={(e) => handleIndustryChange(e.target.value)}
                    className="mr-3 w-4 h-4 text-yellow-500 border-2 border-gray-300 focus:ring-yellow-400"
                  />
                  <span className="text-gray-800 font-medium">{industry}</span>
                </label>
              ))}
            </div>

            {/* Others Input Field */}
            {preferences.industry === "Others" && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Please specify your industry"
                  value={preferences.otherIndustry}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      otherIndustry: e.target.value,
                    }))
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-yellow-400 outline-none"
                />
              </div>
            )}
          </div>

          {/* Section 3: Choose Your Language */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
              <span className="bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">
                🗣️
              </span>
              Step 3: Choose Your Language
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {languageOptions.map((language) => (
                <label
                  key={language}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    preferences.language === language
                      ? "border-yellow-400 bg-yellow-50 shadow-lg"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="language"
                    value={language}
                    checked={preferences.language === language}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className="mr-3 w-4 h-4 text-yellow-500 border-2 border-gray-300 focus:ring-yellow-400"
                  />
                  <span className="text-gray-800 font-medium">{language}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: Topics of Interest */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
              <span className="bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">
                📚
              </span>
              Step 4: Topics of Interest
            </h2>

            {topics.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No topics available. Please contact support.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {topics.map((topic) => (
                  <label
                    key={topic.id}
                    className={`flex items-start p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      preferences.topicId === topic.id
                        ? "border-yellow-400 bg-yellow-50 shadow-lg"
                        : "border-gray-200 hover:border-yellow-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="topic"
                      value={topic.id}
                      checked={preferences.topicId === topic.id}
                      onChange={() => handleTopicChange(topic.id)}
                      className="mt-1 mr-4 w-5 h-5 text-yellow-500 border-2 border-gray-300 focus:ring-yellow-400"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {topic.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{topic.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Mode of Delivery */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
              <span className="bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">
                📱
              </span>
              Step 5: Mode of Delivery
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {modeOptions.map((mode) => (
                <label
                  key={mode}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    preferences.preferredMode === mode
                      ? "border-yellow-400 bg-yellow-50 shadow-lg"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredMode"
                    value={mode}
                    checked={preferences.preferredMode === mode}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        preferredMode: e.target.value,
                      }))
                    }
                    className="mr-3 w-4 h-4 text-yellow-500 border-2 border-gray-300 focus:ring-yellow-400"
                  />
                  <span className="text-gray-800 font-medium">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 6: Frequency of Delivery */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
              <span className="bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">
                ⏰
              </span>
              Step 6: Frequency of Delivery
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {frequencyOptions.map((freq) => (
                <label
                  key={freq}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    preferences.frequency === freq
                      ? "border-yellow-400 bg-yellow-50 shadow-lg"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={freq}
                    checked={preferences.frequency === freq}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        frequency: e.target.value,
                      }))
                    }
                    className="mr-3 w-4 h-4 text-yellow-500 border-2 border-gray-300 focus:ring-yellow-400"
                  />
                  <span className="text-gray-800 font-medium">{freq}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <div className="text-center">
            <button
              onClick={handleNext}
              disabled={saving}
              className={`bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Next →'}
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

export default UserPreferences;