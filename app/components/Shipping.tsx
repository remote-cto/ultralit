"use client";
import React from "react";
import { X } from "lucide-react";

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShippingModal: React.FC<ShippingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Shipping Policy</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Thank you for choosing our platform for your learning journey! As a
            digital service provider, our courses are delivered online, and no
            physical products are shipped. Here's everything you need to know
            regarding our course bookings and delivery:
          </p>

          {/* 1. Digital Delivery */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              1. Digital Delivery
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Upon successful booking and payment of a course, you will receive immediate access to the course details via email.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              Course materials (if applicable) will be provided through email or WhatsApp or any other messaging system in your user dashboard on our platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              No physical items will be shipped as all courses and content are delivered digitally.
            </p>
          </div>

          {/* 2. Access to Live Sessions */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              2. Access to Live Sessions
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Once the course is booked, you will receive a confirmation email with the schedule and link to join the live sessions.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Ensure you provide a valid email address during the checkout process to avoid delays in receiving the course access information.
            </p>
          </div>

          {/* 3. Technical Requirements */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              3. Technical Requirements
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Our courses are conducted online via platforms like Zoom or similar. Please ensure you have a stable internet connection and necessary software to attend the live sessions.
            </p>
          </div>

          {/* 4. Non-Delivery */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              4. Non-Delivery
            </h3>
            <p className="text-gray-700 leading-relaxed">
              In the unlikely event that you do not receive your course access email within 24 hours of payment, please contact our support team at{" "}
              <a
                href="mailto:connect@xworks.live"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                connect@xworks.live
              </a>{" "}
              for assistance.
            </p>
          </div>

          {/* 5. Rescheduling and Cancellations */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              5. Rescheduling and Cancellations
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              If the live course you've enrolled in needs to be rescheduled, you will be notified via email and provided with the new dates or times.
            </p>
            <p className="text-gray-700 leading-relaxed">
              For cancellations or refunds, please refer to our{" "}
              <span className="font-semibold">Refund Policy</span>.
            </p>
          </div>

          {/* 6. Customer Support */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              6. Customer Support
            </h3>
            <p className="text-gray-700 leading-relaxed">
              For any issues or queries related to your course access, feel free to contact our support team at{" "}
              <a
                href="mailto:connect@xworks.live"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                connect@xworks.live
              </a>{" "}
              or call us at{" "}
              <a
                href="tel:+917383808881"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                +91 73838-08881
              </a>
              .
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingModal;