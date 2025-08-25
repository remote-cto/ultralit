//utils/authUtils.ts

export interface UserPreferences {
  role: string;
  industry: string;
  language: string;
  preferred_mode: string;
  frequency: string;
  topics?: Array<{
    id: number;
    name: string;
    description: string;
    topic_type: string;
  }>;
}

export interface CheckPreferencesResult {
  hasPreferences: boolean;
  hasTopics: boolean;
  isComplete: boolean;
  preferences?: UserPreferences;
}

/**
 * Check if user has preferences and determine their completion status
 */
export const checkUserSetupStatus = async (userId: string): Promise<CheckPreferencesResult> => {
  try {
    const response = await fetch(`/api/get-user-preferences?user_id=${userId}`);
    const data = await response.json();
    
    if (response.ok && data.success && data.preferences) {
      const preferences = data.preferences;
      const hasPreferences = !!(
        preferences.role && 
        preferences.industry && 
        preferences.language
      );
      
      const hasTopics = preferences.topics && preferences.topics.length > 0;
      const isComplete = hasPreferences && hasTopics;
      
      return {
        hasPreferences,
        hasTopics,
        isComplete,
        preferences
      };
    }
    
    return {
      hasPreferences: false,
      hasTopics: false,
      isComplete: false
    };
  } catch (error) {
    console.error("Error checking user setup status:", error);
    return {
      hasPreferences: false,
      hasTopics: false,
      isComplete: false
    };
  }
};

/**
 * Determine the appropriate redirect path based on user setup status
 */
export const getRedirectPath = (setupStatus: CheckPreferencesResult): string => {
  if (setupStatus.isComplete) {
    return "/dashboard";
  } else if (setupStatus.hasPreferences && !setupStatus.hasTopics) {
    return "/topic-selection";
  } else {
    return "/preferences";
  }
};

/**
 * Redirect user to appropriate page based on their setup status
 */
export const redirectUserBasedOnSetup = async (userId: string, router: any) => {
  const setupStatus = await checkUserSetupStatus(userId);
  const redirectPath = getRedirectPath(setupStatus);
  
  console.log("User setup status:", setupStatus);
  console.log("Redirecting to:", redirectPath);
  
  router.push(redirectPath);
  
  return {
    redirectPath,
    setupStatus
  };
};