// app/dashboard/page.tsx

"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  BookOpen,
  Edit2,
  Save,
  X,
  Home,
  Search,
  Menu,
  ChevronLeft,
  Calendar,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle,
  PlayCircle,
  FileText,
  ChevronRight,
  ChevronDown,
  Eye,
} from "lucide-react";
import RouteGuard from "../components/RouteGuard";

// Updated types to match the per-topic model
interface UserTopic {
  topic_id: number;
  topic_name: string;
  payment_status: string;
  purchased_date: string;
  expires_at: string | null;
  amount_paid: number;
  plan_name: string;
  status: string;
  payment_id?: string;
  topic_description?: string;
  topic_type?: string;
}

interface TopicContent {
  id: number;
  topic_id: number;
  day_number: number;
  title: string;
  description: string | null;
  content_text: string;
  created_at: string;
  updated_at: string;
}

interface UserContentProgress {
  delivery_id: number;
  day_number: number;
  is_sent: boolean;
  delivered_on: string | null;
  created_at: string;
}

interface TopicContentData {
  topic_id: number;
  topic_name: string;
  content: TopicContent[];
  user_progress: UserContentProgress[];
  total_days: number;
  current_day: number;
  next_delivery_date: string | null;
}

interface TopicSummary {
  topic_id: number;
  topic_name: string;
  total_content_days: number;
  current_day: number;
  delivered_count: number;
  pending_count: number;
}

interface Subscription {
  id: number;
  plan_name: string;
  status: string;
  start_date: string;
  next_renewal_date: string | null;
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  auto_renewal?: boolean;
}

interface Preferences {
  role: string;
  industry: string;
  language: string;
  preferred_mode: string;
  frequency: string;
  topic_ids: string[] | string;
}

interface PaymentHistoryItem {
  id: number;
  razorpay_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  plan_name?: string;
  topic_name?: string;
  payment_method: string;
}

export default function Dashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("topics");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userTopics, setUserTopics] = useState<UserTopic[]>([]);
  const [topicContentData, setTopicContentData] = useState<{ [key: number]: TopicContentData }>({});
  const [topicsSummary, setTopicsSummary] = useState<TopicSummary[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [editedPreferences, setEditedPreferences] = useState<Preferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<{ [key: number]: boolean }>({});
  const [selectedContent, setSelectedContent] = useState<TopicContent | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);

  // Options for preferences
  const roleOptions = [
    "Student",
    "Professional",
    "Entrepreneur",
    "CXO",
    "Faculty",
  ];
  const industryOptions = [
    "IT",
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

  // Sidebar navigation items (routes)
  const sidebarItems = [
    { id: "home", label: "Home", icon: Home, route: "/" },
    { id: "explore", label: "Explore Topics", icon: Search, route: "/topic-selection" },
  ];

  // Updated tab items
  const tabItems = [
    { id: "topics", label: "My Topics", icon: BookOpen },
    { id: "content", label: "Content Library", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "payment", label: "Payment History", icon: CreditCard },
  ];

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching dashboard data for user:", user?.id);

        const fetchPromises = [
          fetch(`/api/get-user-topics?user_id=${user?.id}`),
          fetch(`/api/check-subscription?user_id=${user?.id}`),
          fetch(`/api/get-user-preferences?user_id=${user?.id}`),
          // CORRECTED API CALL: Fetch from the new payment history endpoint
          fetch(`/api/get-payment-history?user_id=${user?.id}`), 
          fetch(`/api/get-topic-content?user_id=${user?.id}`), 
        ];

        const [topicsRes, subRes, prefRes, paymentRes, contentRes] = await Promise.all(fetchPromises);

        // Handle user topics
        try {
          const topicsData = await topicsRes.json();
          console.log("Topics response:", topicsData);
          if (topicsData.success) {
            setUserTopics(topicsData.topics || []);
          } else {
            console.error("Failed to fetch topics:", topicsData.error);
            setUserTopics([]);
          }
        } catch (topicsError) {
          console.error("Error parsing topics response:", topicsError);
          setUserTopics([]);
        }

        // Handle subscription (optional)
        try {
          if (subRes.ok) {
            const subData = await subRes.json();
            console.log("Subscription response:", subData);
            if (subData.success && subData.hasSubscription) {
              setSubscription(subData.subscription);
            } else {
              setSubscription(null);
            }
          }
        } catch (subError) {
          console.log("No subscription data available:", subError);
          setSubscription(null);
        }

        // Handle preferences
        try {
          if (prefRes.ok) {
            const prefData = await prefRes.json();
            console.log("Preferences response:", prefData);
            if (prefData.success) {
              setPreferences(prefData.preferences);
              setEditedPreferences(prefData.preferences);
            }
          }
        } catch (prefError) {
          console.log("No preferences data available:", prefError);
        }

        // Handle payment history
        try {
          if (paymentRes.ok) {
            const paymentData = await paymentRes.json();
            console.log("Payment history response:", paymentData);
            if (paymentData.success && paymentData.payments) {
              setPaymentHistory(paymentData.payments);
            }
          }
        } catch (paymentError) {
          console.log("No payment history available:", paymentError);
        }

        // Handle topic content summary
        try {
          if (contentRes.ok) {
            const contentData = await contentRes.json();
            console.log("Content summary response:", contentData);
            if (contentData.success && contentData.data) {
              setTopicsSummary(contentData.data.user_topics_summary || []);
            }
          }
        } catch (contentError) {
          console.log("No content summary available:", contentError);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchData();
    }
  }, [isAuthenticated, user?.id, router]);

  // Fetch detailed content for a specific topic
  const fetchTopicContent = async (topicId: number) => {
    try {
      console.log("Fetching detailed content for topic:", topicId);
      const response = await fetch(`/api/get-topic-content?user_id=${user?.id}&topic_id=${topicId}`);
      const data = await response.json();
      
      if (data.success) {
        setTopicContentData(prev => ({
          ...prev,
          [topicId]: data.data
        }));
      } else {
        console.error("Failed to fetch topic content:", data.error);
      }
    } catch (error) {
      console.error("Error fetching topic content:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleRouteNavigation = (route: string) => {
    router.push(route);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!editedPreferences || !user?.id) return;
    setSaving(true);
    try {
      const response = await fetch("/api/update-user-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          role: editedPreferences.role,
          industry: editedPreferences.industry,
          language: editedPreferences.language,
          preferred_mode: editedPreferences.preferred_mode,
          frequency: editedPreferences.frequency,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setPreferences(editedPreferences);
        setEditingPreferences(false);
        alert("Preferences updated successfully!");
      } else {
        alert("Failed to update preferences: " + data.error);
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      alert("Error updating preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedPreferences(preferences);
    setEditingPreferences(false);
  };

  const toggleTopicExpansion = (topicId: number) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
    
    if (!expandedTopics[topicId] && !topicContentData[topicId]) {
      fetchTopicContent(topicId);
    }
  };

  const handleViewContent = (content: TopicContent) => {
    setSelectedContent(content);
    setShowContentModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      INR: "₹",
      USD: "$",
      EUR: "€",
    };
    return symbols[currency?.toUpperCase()] || currency;
  };
  
  const isTopicExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false; // Never expires if null
    return new Date(expiresAt) < new Date();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'captured':
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'expired':
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgressPercentage = (delivered: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((delivered / total) * 100);
  };
  
  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">
            Loading your dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 px-4">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const ContentModal = () => {
    if (!showContentModal || !selectedContent) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-800">
              Day {selectedContent.day_number}: {selectedContent.title}
            </h3>
            <button
              onClick={() => setShowContentModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            {selectedContent.description && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600 text-sm">{selectedContent.description}</p>
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Content</h4>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedContent.content_text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderUserTopics = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
          <BookOpen className="mr-2 sm:mr-3 text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
          My Learning Topics ({userTopics.length})
        </h2>
        <button
          onClick={() => router.push("/topic-selection")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          Explore More Topics
        </button>
      </div>
      {userTopics.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userTopics.map((topic, index) => {
            const expired = isTopicExpired(topic.expires_at);
            const status = expired ? 'expired' : topic.status;
            
            return (
              <div
                key={`${topic.topic_id}-${index}`}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {topic.topic_name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ml-2 whitespace-nowrap ${getStatusColor(status)}`}
                  >
                    {status}
                  </span>
                </div>
                
                {topic.topic_description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {topic.topic_description}
                  </p>
                )}
                <div className="space-y-2 text-sm text-gray-600 border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-medium">{topic.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="font-medium">
                      {topic.amount_paid > 0 ? `₹${topic.amount_paid}` : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchased:</span>
                    <span className="font-medium">
                      {formatDate(topic.purchased_date)}
                    </span>
                  </div>
                  {topic.expires_at && new Date(topic.expires_at).getFullYear() < 2099 && (
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className={`font-medium ${expired ? "text-red-600" : ""}`}>
                        {formatDate(topic.expires_at)}
                      </span>
                    </div>
                  )}
                </div>
                {!expired && (
                  <button
                    onClick={() => {
                      setActiveTab("content");
                      toggleTopicExpansion(topic.topic_id);
                    }}
                    className="w-full mt-4 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Content
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No topics purchased yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start your learning journey by exploring our topics and choosing one that interests you.
          </p>
          <button
            onClick={() => router.push("/topic-selection")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Topics
          </button>
        </div>
      )}
    </div>
  );

  const renderContentLibrary = () => (
     <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
        <FileText className="mr-2 sm:mr-3 text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
        Content Library
      </h2>
      
      {topicsSummary.length > 0 ? (
        <div className="space-y-4">
          {topicsSummary.map((summary) => {
            const isExpanded = expandedTopics[summary.topic_id];
            const contentData = topicContentData[summary.topic_id];
            
            return (
              <div key={summary.topic_id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div 
                  className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleTopicExpansion(summary.topic_id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {summary.topic_name}
                      </h3>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{summary.current_day}</div>
                        <div className="text-xs text-gray-500">Current Day</div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isExpanded ? (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t bg-gray-50">
                    {contentData ? (
                      <div className="p-4 sm:p-6">
                        <h4 className="text-md font-semibold text-gray-800 mb-4">
                          Content Schedule ({contentData.content.length} days)
                        </h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {contentData.content.map((content) => {
                            const progressItem = contentData.user_progress.find(
                              p => p.day_number === content.day_number
                            );
                            const isDelivered = progressItem?.is_sent || false;
                            
                            return (
                              <div
                                key={content.id}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                  isDelivered 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    isDelivered 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-gray-300 text-gray-600'
                                  }`}>
                                    {content.day_number}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-800 truncate">
                                      {content.title}
                                    </h5>
                                  </div>
                                </div>
                                {isDelivered && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewContent(content);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                    title="View content"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading content...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No content available
          </h3>
          <p className="text-gray-600 mb-6">
            Purchase topics to access their content library.
          </p>
          <button
            onClick={() => router.push("/topic-selection")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Topics
          </button>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
          <Settings className="mr-2 sm:mr-3 text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
          Account Settings
        </h2>
        {preferences && !editingPreferences && (
          <button
            onClick={() => setEditingPreferences(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <Edit2 className="w-4 h-4" />
            Edit Preferences
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
        {preferences && editedPreferences ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="mr-2 w-5 h-5" />
                Profile Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{user?.name || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{user?.email || "Not provided"}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Learning Preferences
              </h3>
              {editingPreferences ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select value={editedPreferences.role} onChange={(e) => setEditedPreferences({...editedPreferences, role: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {roleOptions.map((role) => (<option key={role} value={role}>{role}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <select value={editedPreferences.industry} onChange={(e) => setEditedPreferences({...editedPreferences, industry: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {industryOptions.map((industry) => (<option key={industry} value={industry}>{industry}</option>))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button onClick={handleSavePreferences} disabled={saving} className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={handleCancelEdit} className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{preferences.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{preferences.industry}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Settings className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Preferences Set</h3>
            <p className="text-gray-600">Please set your preferences to personalize your experience.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPaymentHistory = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
        <CreditCard className="mr-2 sm:mr-3 text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
        Payment History
      </h2>
      {paymentHistory.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Payment ID</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((item) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-6 py-4">{item.topic_name || item.plan_name || 'General Payment'}</td>
                  <td className="px-6 py-4">
                    {getCurrencySymbol(item.currency)}{item.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.razorpay_payment_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <CreditCard className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Payment History Found</h3>
          <p className="text-gray-600">Your payment transactions will appear here once you make a purchase.</p>
        </div>
      )}
    </div>
  );
  
  const renderContent = () => {
    switch (activeTab) {
      case "topics":
        return renderUserTopics();
      case "content":
        return renderContentLibrary();
      case "settings":
        return renderSettings();
      case "payment":
        return renderPaymentHistory();
      default:
        return renderUserTopics();
    }
  };

  return (
    <RouteGuard>
      <div className="flex h-screen bg-gray-50 font-sans">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-2xl font-bold text-blue-600">Dashboard</h1>
              {isMobile && (
                <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-800">
                  <X size={24} />
                </button>
              )}
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
              {sidebarItems.map((item) => (
                <a
                  key={item.id}
                  onClick={() => handleRouteNavigation(item.route)}
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="p-4 border-t">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {user?.name?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out md:ml-64">
          <header className="flex items-center justify-between md:justify-end h-16 bg-white border-b px-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600">
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center">
              <span className="text-gray-700">Welcome, {user?.name}</span>
            </div>
          </header>
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
                  {tabItems.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-5 h-5 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            
            <div>
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
      <ContentModal />
    </RouteGuard>
  );
}