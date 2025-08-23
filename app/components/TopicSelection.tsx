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
  category_id?: number;
  domain_id?: number;
  is_microlearning?: boolean;
  is_trending?: boolean;
}

interface Domain {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  is_active: boolean;
}

const TABS = ["Learn by Domain", "Learn by Topic", "MicroSkill", "Trending"];

const TopicSelection = () => {
  const [activeTab, setActiveTab] = useState("Learn by Domain");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);

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

  const initializeData = async () => {
    setLoading(true);
    try {
      // Fetch domains
      const domainsRes = await fetch('/api/fetch-domains');
      const domainsData = await domainsRes.json();
      if (domainsData.success) {
        setDomains(domainsData.domains || []);
      }

      // Fetch categories
      const categoriesRes = await fetch('/api/fetch-categories');
      const categoriesData = await categoriesRes.json();
      if (categoriesData.success) {
        const allCategories = categoriesData.categories || [];
        setCategories(allCategories);
        
        // Separate parent and sub categories
        const parents = allCategories.filter((cat: Category) => cat.parent_id === null);
        setParentCategories(parents);
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch topics based on domain selection
  const fetchTopicsByDomain = async (domainId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fetch-topics?domain_id=${domainId}`);
      const data = await res.json();
      if (data.success) {
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error("Error fetching topics by domain:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch topics based on category selection
  const fetchTopicsByCategory = async (categoryId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fetch-topics?category_id=${categoryId}`);
      const data = await res.json();
      if (data.success) {
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error("Error fetching topics by category:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch microskill topics
  const fetchMicroskillTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fetch-topics?is_microlearning=true');
      const data = await res.json();
      if (data.success) {
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error("Error fetching microskill topics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trending topics
  const fetchTrendingTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fetch-topics?is_trending=true');
      const data = await res.json();
      if (data.success) {
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error("Error fetching trending topics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle domain selection
  const handleDomainSelect = (domainId: number) => {
    setSelectedDomain(domainId);
    setSelectedTopic(null);
    setSelectedParentCategory(null);
    setSelectedSubCategory(null);
    setSubCategories([]);
    setShowAuthPrompt(false);
    fetchTopicsByDomain(domainId);
  };

  // Handle parent category selection
  const handleParentCategorySelect = (categoryId: number) => {
    setSelectedParentCategory(categoryId);
    setSelectedSubCategory(null);
    setSelectedTopic(null);
    setSelectedDomain(null);
    setTopics([]);
    setShowAuthPrompt(false);

    // Find subcategories for this parent
    const subs = categories.filter(cat => cat.parent_id === categoryId);
    setSubCategories(subs);
  };

  // Handle subcategory selection
  const handleSubCategorySelect = (categoryId: number) => {
    setSelectedSubCategory(categoryId);
    setSelectedTopic(null);
    setShowAuthPrompt(false);
    fetchTopicsByCategory(categoryId);
  };

  // Handle topic selection
  const handleTopicSelect = (topicId: number) => {
    setSelectedTopic(topicId);
    setShowAuthPrompt(false);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Reset selections when changing tabs
    setSelectedDomain(null);
    setSelectedParentCategory(null);
    setSelectedSubCategory(null);
    setSelectedTopic(null);
    setTopics([]);
    setSubCategories([]);
    setShowAuthPrompt(false);

    // Load data based on tab
    if (tab === "MicroSkill") {
      fetchMicroskillTopics();
    } else if (tab === "Trending") {
      fetchTrendingTopics();
    }
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

    // Show authentication popup if user is not authenticated
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingTopicSelection', selectedTopic.toString());
      if (selectedDomain) {
        sessionStorage.setItem('pendingDomainSelection', selectedDomain.toString());
      }
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

  // Loading component
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-4"></div>
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  // Render domain view
  const renderDomainView = () => {
    return (
      <div className="space-y-8">
        {/* Domain Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Topics Section */}
        {selectedDomain && (
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-300 border-dashed rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Select a Topic:
            </h4>

            {loading && renderLoading()}

            {!loading && topics.length === 0 && selectedDomain && (
              <div className="text-center py-8">
                <p className="text-gray-500">No topics available for this domain.</p>
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

        {renderTopicDetails()}
        {renderNavigationButtons()}
      </div>
    );
  };

  // Render topic view (categories)
  const renderTopicView = () => {
    return (
      <div className="space-y-8">
        {/* Parent Categories */}
        {!selectedParentCategory && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parentCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleParentCategorySelect(category.id)}
                className="p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg border-gray-200 bg-white hover:border-yellow-400"
              >
                <h3 className="text-xl font-bold text-blue-700 mb-3">
                  {category.name}
                </h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Subcategories */}
        {selectedParentCategory && !selectedSubCategory && subCategories.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedParentCategory(null);
                  setSubCategories([]);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Categories
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subCategories.map((subCategory) => (
                <div
                  key={subCategory.id}
                  onClick={() => handleSubCategorySelect(subCategory.id)}
                  className="p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg border-gray-200 bg-white hover:border-yellow-400"
                >
                  <h3 className="text-xl font-bold text-blue-700 mb-3">
                    {subCategory.name}
                  </h3>
                  <p className="text-gray-600">{subCategory.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topics */}
        {selectedSubCategory && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedSubCategory(null);
                  setTopics([]);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Subcategories
              </button>
            </div>

            <div className="p-6 bg-yellow-50 border border-yellow-300 border-dashed rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Select a Topic:
              </h4>

              {loading && renderLoading()}

              {!loading && topics.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No topics available for this category.</p>
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
          </div>
        )}

        {renderTopicDetails()}
        {renderNavigationButtons()}
      </div>
    );
  };

  // Render microskill/trending view
  const renderTopicsListView = () => {
    return (
      <div className="space-y-8">
        {loading && renderLoading()}

        {!loading && topics.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Topics Available</h3>
            <p className="text-gray-400">
              {activeTab} topics are being prepared for you.
            </p>
          </div>
        )}

        {!loading && topics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg
                  ${
                    selectedTopic === topic.id
                      ? "border-yellow-400 bg-yellow-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-yellow-400"
                  }`}
              >
                <h3 className="text-xl font-bold text-blue-700 mb-3">
                  {topic.name}
                </h3>
                <p className="text-gray-600">{topic.description}</p>
                {activeTab === "MicroSkill" && topic.is_microlearning && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Micro Learning
                  </span>
                )}
                {activeTab === "Trending" && topic.is_trending && (
                  <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Trending
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {renderTopicDetails()}
        {renderNavigationButtons()}
      </div>
    );
  };

  // Render topic details
  const renderTopicDetails = () => {
    if (!selectedTopic) return null;

    const topic = topics.find(t => t.id === selectedTopic);
    if (!topic) return null;

    return (
      <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{topic.name}</h3>
        <p className="text-gray-600 mb-3">
          <strong>What You'll Learn:</strong> {topic.description}
        </p>
      </div>
    );
  };

  // Render navigation buttons
  const renderNavigationButtons = () => {
    const canProceed = selectedTopic !== null;

    return (
      <div className="mt-8 bg-white border-t border-gray-200 p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            ← Back
          </button>
          
          {canProceed ? (
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
                'Confirm & Continue'
              )}
            </button>
          ) : (
            <button
              className="bg-transparent text-gray-400 font-medium py-3 px-8 cursor-default"
              disabled
            >
              Select a topic to continue
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <Header />
      
      <div className="flex-1">
        <div className="container mx-auto px-8 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Explore Topics</h2>
            <p className="text-lg text-gray-600 mb-4">
              Choose a topic that matches your learning goals
            </p>
            
            {/* Welcome message for authenticated users */}
            {isAuthenticated && user?.name && (
              <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm">
                  Welcome back, {user.name}! Select a topic to continue.
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
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-yellow-200 min-h-[500px]">
            {activeTab === "Learn by Domain" && renderDomainView()}
            {activeTab === "Learn by Topic" && renderTopicView()}
            {(activeTab === "MicroSkill" || activeTab === "Trending") && renderTopicsListView()}
          </div>
        </div>
      </div>

      <Footer />

      {/* Authentication Prompt Modal */}
      {renderAuthPrompt()}
    </div>
  );
};

export default TopicSelection;