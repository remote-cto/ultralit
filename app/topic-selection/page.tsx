//app/topic-selection/page.tsx

import React, { Suspense } from 'react';
import TopicSelection from '../components/TopicSelection';

// Loading component for the suspense boundary
const TopicSelectionLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg mb-4 max-w-md mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded-lg max-w-lg mx-auto"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 border border-yellow-200 min-h-[400px]">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper component that uses useSearchParams
const TopicSelectionWrapper = () => {
  return <TopicSelection />;
};

const Page = () => {
  return (
    <div>
      <Suspense fallback={<TopicSelectionLoading />}>
        <TopicSelectionWrapper />
      </Suspense>
    </div>
  );
}

export default Page;