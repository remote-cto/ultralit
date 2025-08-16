
//app/components/TopicSelection.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/auth");
      return;
    }
  }, [isAuthenticated, user, router]);

  // Fetch subtopics when domain is selected
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedDomain) return;
      setLoading(true);
      try {
        const res = await fetch("/api/fetch-topics", {
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

  // Save topic selection and proceed
  const handleNext = async () => {
    if (!selectedTopic) {
      alert("Please select one topic to continue");
      return;
    }

    if (!user?.id) {
      alert("Please log in to continue");
      router.push("/auth");
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
    router.push("/preferences");
  };

  // Render domain -> subtopics workflow
  const renderDomainView = () => {
    if (!selectedDomain) {
      return (
        <div className="grid md:grid-cols-2 gap-4">
          {domains.map((domain) => (
            <div
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id)}
              className="p-6 border-2 rounded-lg cursor-pointer hover:shadow-lg bg-white hover:border-yellow-400"
            >
              <h3 className="text-lg font-bold text-blue-700 mb-2">{domain.name}</h3>
              <p className="text-gray-600">{domain.description}</p>
            </div>
          ))}
        </div>
      );
    }

    if (loading) {
      return <p className="text-center text-gray-500">Loading subtopics...</p>;
    }

    if (topics.length === 0) {
      return <p className="text-center text-gray-500">No subtopics available.</p>;
    }

    return (
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
        {topics.map((topic) => (
          <label
            key={topic.id}
            className={`flex items-start p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg 
              ${selectedTopic === topic.id ? "border-yellow-400 bg-yellow-50 shadow-lg" : "border-gray-200 hover:border-yellow-300"}`}
          >
            <input
              type="radio"
              name="topic"
              value={topic.id}
              checked={selectedTopic === topic.id}
              onChange={() => setSelectedTopic(topic.id)}
              className="mt-1 mr-4 w-5 h-5 text-yellow-500 border-gray-300 focus:ring-yellow-400"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{topic.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{topic.description}</p>
            </div>
          </label>
        ))}
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
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 space-x-6 border-b border-gray-300">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`pb-2 text-lg font-medium ${
                activeTab === tab ? "border-b-4 border-yellow-500 text-blue-800" : "text-gray-500"
              }`}
              onClick={() => {
                setActiveTab(tab);
                setSelectedDomain(null);
                setTopics([]);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-yellow-200">
          {activeTab === "Learn by Domain" && renderDomainView()}
          {activeTab !== "Learn by Domain" && (
            <div className="text-center text-gray-500 py-20">
              <p>{activeTab} content coming soon...</p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-full text-lg"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={saving || !selectedTopic}
            className={`bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 
              ${(saving || !selectedTopic) ? "opacity-50 cursor-not-allowed" : "hover:scale-105 hover:shadow-lg"}`}
          >
            {saving ? "Saving..." : "Proceed to Payment →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicSelection;
