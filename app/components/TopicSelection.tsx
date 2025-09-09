// app/pages/topic-selection.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Header from "./Header";
import Footer from "./Footer";

// CHANGE 1: Update the Topic interface to include pricing details
interface Topic {
  id: number;
  name: string;
  description: string;
  topic_type: number;
  category_id?: number;
  domain_id?: number;
  is_microlearning?: boolean;
  is_trending?: boolean;
  price: number; // NEW
  currency: string; // NEW
  access_duration_days: number; // NEW
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

interface UserTopic {
  topic_id: number;
  topic_name: string;
  payment_status: string;
  purchased_date: string;
}

const TABS = ["Learn by Industry", "Learn by Topic", "MicroSkill", "Trending"];

const TopicSelection = () => {
  const [activeTab, setActiveTab] = useState("Learn by Industry");
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
  const [userIndustry, setUserIndustry] = useState<string | null>(null);
  const [userTopics, setUserTopics] = useState<UserTopic[]>([]);
  const [loadingUserTopics, setLoadingUserTopics] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    initializeData();
    if (isAuthenticated && user?.id) {
      fetchUserIndustry();
      fetchUserTopics();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    if (redirect === "topic-selection" && isAuthenticated) {
      const savedTopic = sessionStorage.getItem("pendingTopicSelection");
      const savedDomain = sessionStorage.getItem("pendingDomainSelection");

      if (savedTopic) {
        const topicId = parseInt(savedTopic, 10);
        if (!isNaN(topicId)) setSelectedTopic(topicId);
        sessionStorage.removeItem("pendingTopicSelection");
      }

      if (savedDomain) {
        const domainId = parseInt(savedDomain, 10);
        if (!isNaN(domainId)) setSelectedDomain(domainId);
        sessionStorage.removeItem("pendingDomainSelection");
      }
    }
  }, [searchParams, isAuthenticated]);

  const fetchUserTopics = async () => {
    if (!user?.id) return;
    setLoadingUserTopics(true);
    try {
      const res = await fetch(`/api/get-user-topics?user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUserTopics(data.topics || []);
        }
      }
    } catch (error) {
      console.error("Error fetching user topics:", error);
    } finally {
      setLoadingUserTopics(false);
    }
  };

  const isTopicPurchased = (topicId: number) => {
    return userTopics.some(ut => ut.topic_id === topicId);
  };

  const initializeData = async () => {
    setLoading(true);
    try {
      const [domainsRes, categoriesRes] = await Promise.all([
        fetch("/api/fetch-domains"),
        fetch("/api/fetch-categories"),
      ]);
      const domainsData = await domainsRes.json();
      const categoriesData = await categoriesRes.json();
      if (domainsData.success) {
        setDomains(domainsData.domains || []);
      } else {
        console.error("Failed to fetch domains:", domainsData.error);
      }
      if (categoriesData.success) {
        const allCategories = categoriesData.categories || [];
        setCategories(allCategories);
        setParentCategories(
          allCategories.filter((cat: Category) => cat.parent_id === null)
        );
      } else {
        console.error("Failed to fetch categories:", categoriesData.error);
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserIndustry = async () => {
    try {
      const res = await fetch(`/api/user-preference?user_id=${user?.id}`);
      if (!res.ok) return;
      const text = await res.text();
      if (!text) return;
      const data = JSON.parse(text);
      if (data.success && data.preferences?.industry) {
        setUserIndustry(data.preferences.industry);
      }
    } catch (error) {
      console.error("Error fetching user industry:", error);
    }
  };

  const fetchTopics = async (params: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fetch-topics?${params}`);
      const data = await res.json();
      if (data.success) {
        setTopics(data.topics || []);
      } else {
         console.error("Failed to fetch topics:", data.error);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetSelections = () => {
    setSelectedDomain(null);
    setSelectedParentCategory(null);
    setSelectedSubCategory(null);
    setSelectedTopic(null);
    setTopics([]);
    setSubCategories([]);
    setShowAuthPrompt(false);
  };

  const handleDomainSelect = (domainId: number) => {
    setSelectedDomain(domainId);
    setSelectedTopic(null);
    setSelectedParentCategory(null);
    setSelectedSubCategory(null);
    setSubCategories([]);
    setShowAuthPrompt(false);
    fetchTopics(`domain_id=${domainId}`);
  };

  const handleParentCategorySelect = (categoryId: number) => {
    setSelectedParentCategory(categoryId);
    setSelectedSubCategory(null);
    setSelectedTopic(null);
    setSelectedDomain(null);
    setTopics([]);
    setShowAuthPrompt(false);

    const subs = categories.filter((cat) => cat.parent_id === categoryId);
    setSubCategories(subs);

    if (subs.length === 0) {
      fetchTopics(`category_id=${categoryId}`);
    }
  };

  const handleSubCategorySelect = (categoryId: number) => {
    setSelectedSubCategory(categoryId);
    setSelectedTopic(null);
    setShowAuthPrompt(false);
    fetchTopics(`category_id=${categoryId}`);
  };

  const handleTopicSelect = (topicId: number) => {
    setSelectedTopic(topicId);
    setShowAuthPrompt(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    resetSelections();
    if (tab === "MicroSkill") fetchTopics("is_microlearning=true");
    else if (tab === "Trending") fetchTopics("is_trending=true");
  };

  const handleLoginRedirect = () => {
    router.push("/auth?redirect=topic-selection");
  };

  // CHANGE 3: Update handleNext to pass all pricing details to the payment page
  const handleNext = async () => {
    if (!selectedTopic) {
      alert("Please select one topic to continue");
      return;
    }

    if (!isAuthenticated) {
      sessionStorage.setItem("pendingTopicSelection", selectedTopic.toString());
      if (selectedDomain) {
        sessionStorage.setItem(
          "pendingDomainSelection",
          selectedDomain.toString()
        );
      }
      setShowAuthPrompt(true);
      return;
    }

    if (!user?.id) {
      handleLoginRedirect();
      return;
    }

    if (isTopicPurchased(selectedTopic)) {
      alert("You have already purchased this topic! You can access it from your dashboard.");
      router.push("/dashboard");
      return;
    }

    const topicDetails = topics.find((t) => t.id === selectedTopic);
    if (!topicDetails) {
      alert("Could not find topic details. Please re-select.");
      return;
    }

    sessionStorage.setItem("selectedTopicForPayment", topicDetails.id.toString());
    sessionStorage.setItem("selectedTopicName", topicDetails.name);
    sessionStorage.setItem("selectedTopicPrice", topicDetails.price.toString());
    sessionStorage.setItem("selectedTopicDuration", topicDetails.access_duration_days.toString());

    router.push("/payment");
  };

  const LoadingSpinner = () => (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-yellow-500 mb-4"></div>
      <p className="text-gray-500 text-sm sm:text-base">Loading...</p>
    </div>
  );

  const CategoryCard = ({ item, onClick, isHighlighted = false }: any) => (
    <div
      onClick={onClick}
      className={`p-4 sm:p-6 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isHighlighted
          ? "border-blue-400 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-yellow-400"
      }`}
    >
      {isHighlighted && (
        <div className="mb-2">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Your Industry
          </span>
        </div>
      )}
      <h4 className="text-lg sm:text-xl font-bold text-blue-700 mb-2 sm:mb-3">{item.name}</h4>
      <p className="text-gray-600 text-sm sm:text-base">{item.description}</p>
    </div>
  );

  const TopicsDisplay = ({ title, backAction }: { title: string; backAction?: () => void }) => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex-1 mr-2">{title}</h3>
        {backAction && (
          <button
            onClick={backAction}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base whitespace-nowrap"
          >
            ← Back
          </button>
        )}
      </div>

      {loading && <LoadingSpinner />}

      {!loading && topics.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No topics available.</p>
        </div>
      )}

      {!loading && topics.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
            {topics.map((topic) => {
              const isPurchased = isTopicPurchased(topic.id);
              const isSelected = selectedTopic === topic.id;
              return (
                <div key={topic.id} className="relative">
                  <button
                    onClick={() => handleTopicSelect(topic.id)}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-full font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm text-center ${
                      isPurchased
                        ? "bg-green-100 border-2 border-green-400 text-green-800"
                        : isSelected
                        ? "bg-yellow-400 text-black shadow-lg scale-105"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-yellow-400 hover:shadow-md hover:scale-102"
                    }`}
                  >
                    {topic.name}
                  </button>
                  {isPurchased && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedTopic && (
            <div
              className={`border-2 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg ${
                isTopicPurchased(selectedTopic)
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                  : "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg sm:text-2xl font-bold text-gray-800 flex-1 mr-2">
                  {topics.find((t) => t.id === selectedTopic)?.name}
                </h4>
                <span
                  className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                    isTopicPurchased(selectedTopic)
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {isTopicPurchased(selectedTopic) ? "Purchased" : "Selected"}
                </span>
              </div>
              
              {/* CHANGE 2: Add the price display here */}
              <div className="my-4 text-center bg-yellow-100 p-3 rounded-lg border border-yellow-300">
                <span className="text-gray-600 text-sm">Price</span>
                <p className="text-3xl font-bold text-gray-800">
                  {topics.find(t => t.id === selectedTopic)?.price === 0 
                      ? "Free" 
                      : `₹${topics.find(t => t.id === selectedTopic)?.price}`
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {
                      (topics.find(t => t.id === selectedTopic)?.access_duration_days || 0) >= 9999
                      ? "One-time payment for lifetime access"
                      : `One-time payment for ${topics.find(t => t.id === selectedTopic)?.access_duration_days} days access`
                  }
                </p>
              </div>

              <div className="text-gray-700 mb-4">
                <p className="mb-2 text-sm sm:text-base">
                  <strong className="text-gray-800">What You'll Learn:</strong>
                </p>
                <p className="leading-relaxed text-sm sm:text-base">
                  {topics.find((t) => t.id === selectedTopic)?.description}
                </p>
              </div>
              
              {isTopicPurchased(selectedTopic) && (
                <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-green-800 text-sm">
                    You have already purchased this topic! You can access it from your dashboard.
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {topics.find((t) => t.id === selectedTopic)?.is_microlearning && (
                  <span className="inline-block px-2 py-1 sm:px-3 bg-green-100 text-green-800 text-xs sm:text-sm rounded-full">
                    🎯 Micro Learning
                  </span>
                )}
                {topics.find((t) => t.id === selectedTopic)?.is_trending && (
                  <span className="inline-block px-2 py-1 sm:px-3 bg-red-100 text-red-800 text-xs sm:text-sm rounded-full">
                    🔥 Trending Now
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderDomainView = () => (
    <div className="space-y-6 sm:space-y-8">
      {!selectedDomain ? (
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Learn by Industry</h3>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            Choose your industry to see relevant topics and learning paths tailored for your sector.
          </p>

          {userIndustry && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-xs sm:text-sm">
                <strong>Your Industry:</strong> {userIndustry}
                <br />
                <span className="text-blue-600">
                  {domains.find(d => d.name.toLowerCase() === userIndustry.toLowerCase())
                    ? "We found matching topics for your industry below!"
                    : "Select any industry below to explore topics."
                  }
                </span>
              </p>
            </div>
          )}

          {isAuthenticated && userTopics.length > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-xs sm:text-sm">
                <strong>Your Progress:</strong> You have purchased {userTopics.length} topic{userTopics.length !== 1 ? 's' : ''}
                <br />
                <span className="text-green-600">
                  Continue exploring to add more topics to your learning path!
                </span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {domains.map((domain) => (
              <CategoryCard
                key={domain.id}
                item={domain}
                onClick={() => handleDomainSelect(domain.id)}
                isHighlighted={userIndustry && domain.name.toLowerCase() === userIndustry.toLowerCase()}
              />
            ))}
          </div>
        </div>
      ) : (
        <TopicsDisplay
          title={`Topics in ${domains.find((d) => d.id === selectedDomain)?.name}`}
          backAction={() => {
            setSelectedDomain(null);
            setSelectedTopic(null);
            setTopics([]);
          }}
        />
      )}
    </div>
  );

  const renderTopicView = () => (
    <div className="space-y-6 sm:space-y-8">
      {!selectedParentCategory ? (
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Choose a Learning Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {parentCategories.map((category) => (
              <CategoryCard
                key={category.id}
                item={category}
                onClick={() => handleParentCategorySelect(category.id)}
              />
            ))}
          </div>
        </div>
      ) : !selectedSubCategory && subCategories.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-800 flex-1 mr-2">
              Choose a Subcategory in {parentCategories.find(c => c.id === selectedParentCategory)?.name}
            </h3>
            <button
              onClick={() => {
                setSelectedParentCategory(null);
                setSubCategories([]);
                setSelectedTopic(null);
                setTopics([]);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base whitespace-nowrap"
            >
              ← Back to Categories
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {subCategories.map((subCategory) => (
              <CategoryCard
                key={subCategory.id}
                item={subCategory}
                onClick={() => handleSubCategorySelect(subCategory.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <TopicsDisplay
          title={selectedSubCategory 
            ? `Topics in ${subCategories.find(c => c.id === selectedSubCategory)?.name}`
            : `Topics in ${parentCategories.find(c => c.id === selectedParentCategory)?.name}`
          }
          backAction={() => {
            if (selectedSubCategory) {
              setSelectedSubCategory(null);
              setSelectedTopic(null);
              setTopics([]);
            } else {
              setSelectedParentCategory(null);
              setSelectedTopic(null);
              setTopics([]);
            }
          }}
        />
      )}
    </div>
  );

  const renderTopicsListView = () => (
    <div className="space-y-6 sm:space-y-8">
      {loading && <LoadingSpinner />}

      {!loading && topics.length === 0 && (
        <div className="text-center text-gray-500 py-12 sm:py-20">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-xl sm:text-2xl">📚</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No Topics Available</h3>
          <p className="text-gray-400 text-sm sm:text-base">{activeTab} topics are being prepared for you.</p>
        </div>
      )}

      {!loading && topics.length > 0 && (
         <TopicsDisplay title={`${activeTab} Topics`} />
      )}
    </div>
  );

  const NavigationButtons = () => (
    <div className="mt-6 sm:mt-8 bg-gradient-to-r from-gray-50 to-yellow-50 border border-yellow-200 p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={() => router.push("/")}
          className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-colors"
        >
          ← Back
        </button>

        {selectedTopic ? (
          isTopicPurchased(selectedTopic) ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={saving}
              className={`w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-300 
                ${saving ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:scale-105"}`}
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Processing...
                </div>
              ) : (
                "Purchase Topic"
              )}
            </button>
          )
        ) : (
          <button className="w-full sm:w-auto bg-transparent text-gray-400 font-medium py-2 sm:py-3 px-6 sm:px-8 cursor-default text-sm sm:text-base" disabled>
            Select a topic to continue
          </button>
        )}
      </div>
    </div>
  );

  const AuthPromptModal = () => {
    if (!showAuthPrompt) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl">
          <h3 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Sign up or log in to purchase this topic and start your learning journey!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              Continue Browsing
            </button>
            <button
              onClick={handleLoginRedirect}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              Sign Up / Login
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <Header />
      <div className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-6xl">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">Explore Topics</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-2 sm:mb-4">
              Choose topics that match your learning goals - purchase individual topics as you go!
            </p>
            {isAuthenticated && user?.name && (
              <div className="mt-4 p-3 sm:p-4 bg-green-100 rounded-lg border border-green-200">
                <p className="text-green-800 text-xs sm:text-sm">
                  Welcome back, {user.name}!
                  {userTopics.length > 0 && ` You have ${userTopics.length} topic${userTopics.length !== 1 ? 's' : ''} in your library.`}
                </p>
              </div>
            )}
          </div>
          <div className="mb-6 sm:mb-8 border-b border-gray-300">
            <div className="flex justify-start sm:justify-center gap-2 sm:gap-4 lg:gap-8 overflow-x-auto pb-3">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`pb-2 sm:pb-3 px-2 sm:px-4 text-sm sm:text-base lg:text-lg font-medium whitespace-nowrap transition-all duration-200 min-w-max ${
                    activeTab === tab
                      ? "border-b-2 sm:border-b-4 border-yellow-400 text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border border-yellow-200 min-h-[400px] sm:min-h-[500px]">
            {activeTab === "Learn by Industry" && renderDomainView()}
            {activeTab === "Learn by Topic" && renderTopicView()}
            {(activeTab === "MicroSkill" || activeTab === "Trending") && renderTopicsListView()}
            <NavigationButtons />
          </div>
        </div>
      </div>
      <Footer />
      <AuthPromptModal />
    </div>
  );
};

export default TopicSelection;