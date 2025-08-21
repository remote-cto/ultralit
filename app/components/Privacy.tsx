"use client"
import React from "react";
import { X } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="prose prose-gray max-w-none">
              <p className="text-sm text-gray-600 mb-6">
                Remote CTO ("us", "we", or "our") owns and operates the www.ultralit.live website (the "Service"). 
                This page is to inform you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.
              </p>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Collection</h3>
                
                <h4 className="text-md font-medium text-gray-800 mb-2">Personal Data</h4>
                <p className="text-sm text-gray-700 mb-3">
                  While using our Service, we may ask you to provide us with certain personally identifiable information 
                  that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include:
                </p>
                <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
                  <li>Email address</li>
                  <li>First name and last name</li>
                  <li>Phone number</li>
                  <li>Address, State, Province, ZIP/Postal code, City</li>
                </ul>
                <p className="text-sm text-gray-700 mb-6">
                  We may also receive information regarding the details and transaction history in connection with your use of the Website.
                </p>

                <h4 className="text-md font-medium text-gray-800 mb-2">Cookies and Usage Data</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Cookies are small portions of information saved by your browser onto your computer or mobile ("Cookies"). 
                  Cookies are used to record various aspects of your visit and assist us to provide you with uninterrupted service.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Usage</h3>
                <p className="text-sm text-gray-700 mb-3">ByteDrop/Remote CTO uses the collected data for various purposes:</p>
                <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
                  <li>To provide and maintain our Service</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information so that we can improve our Service</li>
                  <li>To monitor the usage of our Service</li>
                  <li>To detect, prevent and address technical issues</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Retention</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Remote CTO/UltraLIT will hold your Personal Data just for whatever length of time that is important for 
                  the reasons set out in this Privacy Policy. We will hold and utilize your Personal Data to the degree 
                  important to consent to our lawful commitments.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Transfer</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Your information, including Personal Data, may be transferred to — and maintained on — computers located 
                  outside of your state, province, country or other governmental jurisdiction where the data protection laws 
                  may differ than those from your jurisdiction.
                </p>
                <p className="text-sm text-gray-700 mb-4">
                  Remote CTO/UltraLIT will take all steps reasonably necessary to ensure that your data is treated securely 
                  and in accordance with this Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sharing</h3>
                <p className="text-sm text-gray-700 mb-4">
                  We may share aggregated demographic information with third parties. This is not linked to any Personal 
                  Information that can identify an individual person. We will however not be liable for transfer of any 
                  Personal Information resulting from failure of third-party service providers.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Disclosure</h3>
                
                <h4 className="text-md font-medium text-gray-800 mb-2">Disclosure for Law Enforcement</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Under certain circumstances, Remote CTO/UltraLIT may be required to disclose your Personal Data if 
                  required to do so by law or in response to valid requests by public authorities.
                </p>

                <h4 className="text-md font-medium text-gray-800 mb-2">Legal Requirements</h4>
                <p className="text-sm text-gray-700 mb-3">Remote CTO/UltraLIT may disclose your Personal Data in the good faith that such action is necessary:</p>
                <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
                  <li>To comply with a legal obligation</li>
                  <li>To protect and defend the rights or property of Remote CTO/UltraLIT</li>
                  <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
                  <li>To protect the personal safety of users of the Service or the public</li>
                  <li>To protect against legal liability</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Security</h3>
                <p className="text-sm text-gray-700 mb-4">
                  The security of your information is critical to us, however remember that no strategy for transmission 
                  over the Internet, or technique for electronic capacity is 100% secure. While we endeavour to utilize 
                  industrially worthy intends to ensure your Personal Data, we can't ensure its supreme security.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Right to Withdraw Consent</h3>
                <p className="text-sm text-gray-700 mb-4">
                  The consent that you provide for the collection, use and disclosure of your Personal Information will 
                  remain valid until such time it is withdrawn by you in writing by sending an email to 
                  <a href="mailto:support@xworks.live" className="text-blue-600 hover:text-blue-800"> support@xworks.live</a>.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
                <p className="text-sm text-gray-700 mb-4">
                  We may utilize outsider Service Providers to screen and break down the utilization of our Service.
                </p>
                
                <h4 className="text-md font-medium text-gray-800 mb-2">Google Analytics</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Google Analytics is a web examination administration offered by Google that tracks and reports site traffic. 
                  Google utilizes the information gathered to track and screen the utilization of our Service.
                </p>
                <p className="text-sm text-gray-700 mb-4">
                  For more information on the privacy practices of Google, please visit the Google Privacy Terms web page: 
                  <a href="http://www.google.com/intl/en/policies/privacy/" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer"> 
                    http://www.google.com/intl/en/policies/privacy/
                  </a>
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payments</h3>
                <p className="text-sm text-gray-700 mb-4">
                  We will not store or collect your payment card details. That information is provided directly to our 
                  third-party payment processors whose use of your personal information is governed by their Privacy Policy.
                </p>
                <p className="text-sm text-gray-700 mb-2">The payment processors we work with are:</p>
                <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
                  <li>Razorpay</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Links to Other Sites</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Our Service may contain links to other sites that are not operated by us. If you click on a third party link, 
                  you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h3>
                <p className="text-sm text-gray-700 mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
                  new Privacy Policy on this page.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grievance Redressal and Grievance Officer</h3>
                <p className="text-sm text-gray-700 mb-4">
                  In the event that you wish to raise a query or complaint with us, please contact our Grievance Officer 
                  who shall acknowledge your complaint within 24 hours from the time of receipt of such complaint.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Grievance Officer</h5>
                  <p className="text-sm text-gray-700">Name: Nitesh Shetty</p>
                  <p className="text-sm text-gray-700">Designation: Founder</p>
                  <p className="text-sm text-gray-700">Email ID: 
                    <a href="mailto:nitesh@ultralit.co" className="text-blue-600 hover:text-blue-800"> nitesh@ultralit.co</a>
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
                <p className="text-sm text-gray-700">
                  If you have any questions about this Privacy Policy, please contact us by email: 
                  <a href="mailto:support@xworks.live" className="text-blue-600 hover:text-blue-800"> support@xworks.live</a>
                </p>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;