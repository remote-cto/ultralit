// "use client"
// import React from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '../contexts/AuthContext';
// import toast, { Toaster } from 'react-hot-toast';

// const PricingSection = () => {
//   const { isAuthenticated } = useAuth();
//   const router = useRouter();

//   const plans = [
//     {
//       name: "Free Trial",
//       price: "7 Days",
//       amount: 0,
//       period: " Free",
//       description: "Experience everything with no commitment",
//       icon: "🚀",
//       features: [
//         "All AI content access",
//         "Daily updates",
//         "Basic support",
//         "No commitment"
//       ],
//       buttonColor: "from-green-500 to-emerald-500",
//       popular: false
//     },
//     {
//       name: "Students",
//       price: "₹200",
//       amount: 200,
//       period: "/month",
//       description: "Perfect for learners and aspiring professionals",
//       icon: "🎓",
//       features: [
//         "All learning content",
//         "Student community access",
//         "Practice exercises",
//         "Email support"
//       ],
//       buttonColor: "from-blue-500 to-cyan-500",
//       popular: false
//     },
//     {
//       name: "Professionals & Executives",
//       price: "₹500",
//       amount: 500,
//       period: "/month",
//       description: "For working professionals and business leaders",
//       icon: "💼",
//       features: [
//         "Premium content access",
//         "Executive insights",
//         "Priority support",
//         "Advanced resources"
//       ],
//       buttonColor: "from-yellow-400 to-yellow-500",
//       popular: true
//     }
//   ];

//   const handlePlanSelection = (plan: any) => {
//     // Check if user is authenticated
//     if (!isAuthenticated) {
//       // Redirect to login page
//       router.push('/auth');
//       return;
//     }
    

//     toast.success(`Visit the Explore Topics page to select your plan.`);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-12 px-4">
//        <Toaster position="top-right" reverseOrder={false} />
//       <div className="max-w-6xl mx-auto">
        
//         <div className="text-center mb-12">
//           <h2 className="text-3xl md:text-6xl font-bold text-gray-800 mb-4 md:mb-8">
//             Choose Your <span className="text-yellow-500">Plan</span>
//           </h2>
//           <p className="text-xl text-gray-600 mb-6">Select the perfect plan for your learning journey</p>
//           <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
//         </div>

//         {/* Pricing Cards */}
//         <div className="grid md:grid-cols-3 gap-8 items-stretch">
//           {plans.map((plan, index) => (
//             <div
//               key={index}
//               className={`relative bg-white rounded-3xl p-8 border transition-all duration-500 hover:scale-105 flex flex-col h-full ${
//                 plan.popular
//                   ? "border-yellow-400 shadow-xl shadow-yellow-200"
//                   : "border-yellow-200 shadow-lg"
//               }`}
//             >
//               {plan.popular && (
//                 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
//                   Most Popular
//                 </div>
//               )}

//               <div className="text-center flex-grow flex flex-col">
//                 <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-yellow-100 rounded-2xl text-4xl">
//                   {plan.icon}
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-800 mb-4">
//                   {plan.name}
//                 </h3>
//                 <div className="mb-6">
//                   <span className="text-4xl font-bold text-yellow-500">
//                     {plan.price}
//                   </span>
//                   <span className="text-lg text-gray-600">{plan.period}</span>
//                 </div>
//                 <p className="text-gray-600 mb-6 leading-relaxed">
//                   {plan.description}
//                 </p>
                
//                 {/* Features */}
//                 <div className="mb-8 text-left flex-grow">
//                   <h4 className="font-semibold text-gray-800 mb-3 text-center">What's included:</h4>
//                   <ul className="space-y-2">
//                     {plan.features.map((feature, idx) => (
//                       <li key={idx} className="flex items-center text-sm text-gray-600">
//                         <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                         {feature}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>

//                 <button
//                   onClick={() => handlePlanSelection(plan)}
//                   className={`w-full bg-gradient-to-r ${plan.buttonColor} text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 shadow-lg mt-auto`}
//                 >
//                   {plan.name === "Free Trial" ? "Start Free Trial" : "Choose Plan"}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

      
//       </div>
//     </div>
//   );
// };

// export default PricingSection;