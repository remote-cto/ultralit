"use client"
import React from "react";
import { X } from "lucide-react";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RefundModal: React.FC<RefundModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Refund/Cancellation Policy
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="text-sm text-gray-600 mb-6">
              Thank you for purchasing our course, enrolling for our workshop (offline or online) and/or subscribing to our services operated by Remote CTO/BYTEDROP (Registered entity: Remote CTO, thereafter referred as Remote CTO/BYTEDROP).
            </p>

            <div className="space-y-4">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md">
                <p className="font-semibold text-red-800 mb-2">Non-Refundable Policy</p>
                <p className="text-red-700">
                  Once purchased, our courses, workshops and/or services cannot be cancelled and are non-refundable.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
                <p className="font-semibold text-blue-800 mb-2">Completion Certificate</p>
                <p className="text-blue-700">
                  The completion certificate will only be issued once and in the name of the candidate attending the complete course or workshop after passing the required examination or completing the given assignment (whichever is applicable).
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
                <p className="font-semibold text-yellow-800 mb-2">Support Contact</p>
                <p className="text-yellow-700">
                  If you have any additional questions feel free to contact us on the respective support mails mentioned in the FAQ section of the course or workshop.
                </p>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-md">
                <p className="font-semibold text-orange-800 mb-2">Attendance Policy</p>
                <p className="text-orange-700">
                  If a candidate fails to attend the course or workshop, he/she will be marked absent and no extended access will be provided over above the mentioned validity of modules/lessons. The candidate is also not eligible for a refund.
                </p>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-md">
                <p className="font-semibold text-purple-800 mb-2">Discretionary Policy</p>
                <p className="text-purple-700">
                  Any batch transfers, refunds or cancellations are at the discretion of BYTEDROP.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-md">
                <p className="font-semibold text-green-800 mb-2">Technical Issues Refund Policy</p>
                <div className="text-green-700 space-y-2">
                  <p>
                    For any technical issues that you face, the first step of action would be to contact the respective support mails mentioned in the FAQ section of the course or workshop.
                  </p>
                  <p>
                    Our support team will help you with the technical issue. The time of response shall be a minimum of 3 working days.
                  </p>
                  <p>
                    In case of a refund, the refund amount will be credited to the customer bank account in 7 working days.
                  </p>
                  <p className="font-medium">
                    In case we are unable to help with the technical issue, and if the technical issue is found to be at our end, a FULL refund will be initiated. This is applicable only to technical issues happening at our end.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="w-full px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
