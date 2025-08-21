"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Header from "./Header";
import Footer from "./Footer";

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
    setSelectedTopic(null);
    setShowAuthPrompt(false);
  };

  // Handle topic selection - allow selection without authentication
  const handleTopicSelect = (topicId: number) => {
    setSelectedTopic(topicId);
    setShowAuthPrompt(false);
  };

  // Navigate to login with context
  const handleLoginRedirect = () => {
    router.push('/auth?redirect=topic-selection');
  };

  // Save topic selection and proceed - show auth popup if not authenticated
  const handleNext = async () => {
    if (!selectedTopic) {
      alert("Please select one topic to continue");
      return;
    }

    // Show authentication popup if user is not authenticated
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingTopicSelection', selectedTopic.toString());
      sessionStorage.setItem('pendingDomainSelection', selectedDomain?.toString() || '');
      setShowAuthPrompt(true);
      return;
    }

    if (!user?.id) {
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
        sessionStorage.removeItem('pendingTopicSelection');
        sessionStorage.removeItem('pendingDomainSelection');
        router.push("/payment");
      } else {
        alert("Failed to save topic selection: " + (data.error || "Unknown error"));
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

  const getNextButtonText = () => {
    if (!isAuthenticated) return 'Confirm & Continue';
    if (saving) return 'Saving...';
    return 'Confirm & Continue';
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {domains.map((domain) => (
            <div
              key={domain.id}
              onClick={() => handleDomainSelect(domain.id)}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg
                ${
                  selectedDomain === domain.id
                    ? "border-yellow-400 bg-yellow-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-yellow-400"
                }`}
            >
              <h3 className="text-xl font-bold text-blue-700 mb-3">
                {domain.name}
              </h3>
              <p className="text-gray-600">{domain.description}</p>
            </div>
          ))}
        </div>

        {/* Subtopics Section */}
        {selectedDomain && (
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-300 border-dashed rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Select a Subtopic:
            </h4>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-4"></div>
                <p className="text-gray-500">Loading subtopics...</p>
              </div>
            )}

            {!loading && topics.length === 0 && selectedDomain && (
              <div className="text-center py-8">
                <p className="text-gray-500">No subtopics available for this domain.</p>
              </div>
            )}

            {!loading && topics.length > 0 && (
              <div className="space-y-3">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic.id)}
                    className={`inline-block mx-1 my-1 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200
                      ${
                        selectedTopic === topic.id
                          ? "bg-yellow-400 text-black font-bold"
                          : "bg-gray-200 text-gray-700 hover:bg-yellow-200"
                      }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Topic Details Panel */}
        {selectedTopic && (
          <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            {(() => {
              const topic = topics.find(t => t.id === selectedTopic);
              return topic ? (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{topic.name}</h3>
                  <p className="text-gray-600 mb-3">
                    <strong>What You'll Learn:</strong> {topic.description}
                  </p>
                  
                </>
              ) : null;
            })()}
          </div>
        )}
      </div>
    );
  };

  // Render other tabs (placeholder)
  const renderOtherTabs = () => {
    return (
      <div className="text-center text-gray-500 py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <span className="text-2xl">🚀</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
        <p className="text-gray-400 mb-2">{activeTab} content is being prepared for you.</p>
        <p className="text-sm text-gray-400">
          Meanwhile, explore our available topics in "Learn by Domain"
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <Header />
      
      {/* Main Content - with bottom padding to account for fixed navigation */}
      <div className="flex-1 pb-24">
        <div className="container mx-auto px-8 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Explore Topics</h2>
            <p className="text-lg text-gray-600 mb-4">
              Choose a topic that matches your learning goals
            </p>
            
            {/* Welcome message for authenticated users only */}
            {isAuthenticated && user?.name && (
              <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm">
                  👋 Welcome back, {user.name}! Select a topic to continue.
                </p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8 gap-8 border-b border-gray-300 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`pb-3 px-4 text-lg font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab
                    ? "border-b-4 border-yellow-400 text-gray-800"
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

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-yellow-200 min-h-[500px]">
            {activeTab === "Learn by Domain" ? renderDomainView() : renderOtherTabs()}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-8 py-4 shadow-lg z-40">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <button
            onClick={handleBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            ← Back
          </button>
          
          {selectedTopic ? (
            <button
              onClick={handleNext}
              disabled={saving}
              className={`bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 
                ${
                  saving
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-lg"
                }`}
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Saving...
                </div>
              ) : (
                `${getNextButtonText()}`
              )}
            </button>
          ) : (
            <button
              className="bg-transparent text-gray-400 font-medium py-3 px-8 cursor-default"
              disabled
            >
              {selectedDomain ? "Select a subtopic to continue" : "Select a domain to continue"}
            </button>
          )}
        </div>
      </div>

   
      <Footer />

      {/* Authentication Prompt Modal */}
      {renderAuthPrompt()}
    </div>
  );
};

export default TopicSelection;