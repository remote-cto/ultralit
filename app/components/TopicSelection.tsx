//app/components/TopicSelection.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

interface Topic {
  id: number;
  name: string;
  description: string;
  topic_type: number;
}

const TABS = ["Learn by Domain", "Learn by Topic", "MicroSkill", "Trending"];

const domains = [
  {
    id: 1,
    name: "Artificial Intelligence",
    description: "Design, deploy, and understand smart systems.",
  },
  
];

const TopicSelection = () => {
  const [activeTab, setActiveTab] = useState("Learn by Domain");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Handle redirect after authentication
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect === 'topic-selection' && isAuthenticated) {
      // Restore any saved selections
      const savedTopic = sessionStorage.getItem('pendingTopicSelection');
      const savedDomain = sessionStorage.getItem('pendingDomainSelection');
      
      if (savedTopic) {
        setSelectedTopic(parseInt(savedTopic));
        sessionStorage.removeItem('pendingTopicSelection');
      }
      
      if (savedDomain) {
        setSelectedDomain(parseInt(savedDomain));
        sessionStorage.removeItem('pendingDomainSelection');
      }
    }
  }, [searchParams, isAuthenticated]);

  // Fetch subtopics when domain is selected
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedDomain) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/fetch-topics?domain_id=${selectedDomain}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        if (data.success) {
          setTopics(data.topics || []);
        } else {
          console.error("Failed to load topics:", data.error);
          alert("Failed to load topics. Please refresh the page.");
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
        alert("Error loading topics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [selectedDomain]);

  // Handle domain selection
  const handleDomainSelect = (domainId: number) => {
    setSelectedDomain(domainId);
    setSelectedTopic(null); // Reset topic selection when domain changes
    setShowAuthPrompt(false);
  };

  // Handle topic selection
  const handleTopicSelect = (topicId: number) => {
    if (!isAuthenticated) {
      // Save selections for after login
      sessionStorage.setItem('pendingTopicSelection', topicId.toString());
      sessionStorage.setItem('pendingDomainSelection', selectedDomain?.toString() || '');
      setShowAuthPrompt(true);
      return;
    }
    setSelectedTopic(topicId);
    setShowAuthPrompt(false);
  };

  // Navigate to login with context
  const handleLoginRedirect = () => {
    router.push('/auth?redirect=topic-selection');
  };

  // Save topic selection and proceed
  const handleNext = async () => {
    if (!selectedTopic) {
      alert("Please select one topic to continue");
      return;
    }

    if (!isAuthenticated || !user?.id) {
      handleLoginRedirect();
      return;
    }

    setSaving(true);
    try {
      const requestBody = {
        user_id: user.id,
        topic_ids: [selectedTopic],
      };

      const res = await fetch("/api/update-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.success) {
        // Clear any pending selections
        sessionStorage.removeItem('pendingTopicSelection');
        sessionStorage.removeItem('pendingDomainSelection');
        
        // Navigate to payment page instead of preferences
        router.push("/payment");
      } else {
        alert(
          "Failed to save topic selection: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error saving topic selection:", error);
      alert("Error saving topic selection. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  // Get appropriate button text based on authentication status
  const getNextButtonText = () => {
    if (!isAuthenticated) return 'Sign Up to Continue';
    if (saving) return 'Saving...';
    return 'Continue to Payment';
  };

  // Render authentication prompt
  const renderAuthPrompt = () => {
    if (!showAuthPrompt) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
          <h3 className="text-2xl font-bold text-blue-800 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 mb-6">
            Sign up or log in to select this topic and continue your learning journey!
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue Browsing
            </button>
            <button
              onClick={handleLoginRedirect}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Sign Up / Login
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render domain -> subtopics workflow
  const renderDomainView = () => {
    return (
      <div className="space-y-8">
        {/* Domain Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          {domains.map((domain) => (
            <div
              key={domain.id}
              onClick={() => handleDomainSelect(domain.id)}
              className={`p-6 border-2 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300
                ${
                  selectedDomain === domain.id
                    ? "border-yellow-400 bg-yellow-50 shadow-lg"
                    : "bg-white hover:border-yellow-400"
                }`}
            >
              <h3 className="text-lg font-bold text-blue-700 mb-2">
                {domain.name}
              </h3>
              <p className="text-gray-600">{domain.description}</p>
            </div>
          ))}
        </div>

        {/* Subtopics Section */}
        {selectedDomain && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
              Select a Subtopic
            </h2>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                <p className="text-gray-500 mt-4">Loading subtopics...</p>
              </div>
            )}

            {!loading && topics.length === 0 && selectedDomain && (
              <div className="text-center py-8">
                <p className="text-gray-500">No subtopics available for this domain.</p>
              </div>
            )}

            {!loading && topics.length > 0 && (
              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic.id)}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg 
                      ${
                        selectedTopic === topic.id
                          ? "border-yellow-400 bg-yellow-50 shadow-lg"
                          : "border-gray-200 hover:border-yellow-300"
                      }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="topic"
                        value={topic.id}
                        checked={selectedTopic === topic.id}
                        onChange={() => {}} // Handled by div onClick
                        className="mt-1 mr-4 w-5 h-5 text-yellow-500 border-gray-300 focus:ring-yellow-400"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {topic.name}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {topic.description}
                        </p>
                        {!isAuthenticated && (
                          <p className="text-yellow-600 text-xs mt-2 font-medium">
                            Click to select (login required)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render other tabs (placeholder)
  const renderOtherTabs = () => {
    return (
      <div className="text-center text-gray-500 py-20">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-2xl">🚀</span>
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
        <p className="text-gray-400">{activeTab} content is being prepared for you.</p>
        <p className="text-sm text-gray-400 mt-2">
          Meanwhile, explore our available topics in "Learn by Domain"
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
            Explore <span className="text-yellow-500">Topics</span>
          </h1>
          <p className="text-lg text-gray-600">
            Choose a topic that matches your learning goals
          </p>
          
          {/* Auth prompt for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                👋 Browse topics freely! Sign up when you're ready to start learning.
              </p>
            </div>
          )}

          {/* Simple welcome message for authenticated users */}
          {isAuthenticated && user?.name && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm">
                👋 Welcome back, {user.name}! Select a topic to continue.
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 space-x-6 border-b border-gray-300 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-2 text-lg font-medium whitespace-nowrap ${
                activeTab === tab
                  ? "border-b-4 border-yellow-500 text-blue-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab(tab);
                if (tab !== "Learn by Domain") {
                  setSelectedDomain(null);
                  setTopics([]);
                  setSelectedTopic(null);
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-yellow-200 min-h-[400px]">
          {activeTab === "Learn by Domain" ? renderDomainView() : renderOtherTabs()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-full text-lg transition-colors"
          >
            ← Back
          </button>
          
          {selectedTopic ? (
            <button
              onClick={handleNext}
              disabled={saving}
              className={`bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 
                ${
                  saving
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105 hover:shadow-lg"
                }`}
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                `${getNextButtonText()} →`
              )}
            </button>
          ) : (
            <div className="text-gray-400 font-medium py-3 px-8">
              Select a topic to continue
            </div>
          )}
        </div>
      </div>

      {/* Authentication Prompt Modal */}
      {renderAuthPrompt()}
    </div>
  );
};

export default TopicSelection;