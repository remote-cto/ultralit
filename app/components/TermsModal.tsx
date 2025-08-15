import React from "react";
import { X } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] mb-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Terms and Conditions
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-600 mb-4">
              <strong>Last Updated on July 4th, 2025</strong>
            </p>

            <p className="text-sm text-gray-600 mb-6">
              (Registered name: Remote CTO [
              <strong>GST – 24APJPS6706B1Z0</strong>] thereafter referred as
              "Remote CTO/ULTRALIT")
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm font-semibold text-gray-800">
                BY VISITING{" "}
                <a
                  href="https://www.ultralit.co"
                  className="text-blue-600 hover:underline"
                >
                  www.ultralit.co
                </a>{" "}
                OR BY PURCHASING PRODUCTS FROM{" "}
                <a
                  href="https://www.ultralit.co"
                  className="text-blue-600 hover:underline"
                >
                  www.ultralit.co
                </a>{" "}
                OR from any of its subpages, YOU ARE CONSENTING TO OUR TERMS OF
                SERVICE.
              </p>
            </div>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                GENERAL
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Thanks for choosing ULTRALIT. This site (the "Site")
                www.ultralit.co is owned and developed by "Remote CTO"
                ("COMPANY," "we" or "us"). By utilizing the Site, you consent to
                be bound by these Terms of Service and to utilize the Site as
                per these Terms of Service, our Privacy Policy and any extra
                terms and conditions that may apply to explicit areas of the
                Site or to items and administrations accessible through the Site
                or from COMPANY. Getting to the Site, in any way, regardless of
                whether robotized or something else, establishes utilization of
                the Site and your consent to be bound by these Terms of Service.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mt-3">
                By proceeding to utilize the Site after we post any changes, you
                acknowledge the Terms of Service, as altered.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Changes to the Agreements
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                From time to time, we may choose to modify the Agreements. If
                there are significant changes to the Agreements, we will give
                you prominent notice in a way that is appropriate given the
                circumstances. This may involve displaying a clear message
                within the Service or sending an email. Occasionally, we may
                give you advance notice, and if you continue to use the Service
                after the changes have been made, you will be deemed to have
                accepted the new terms. It is important that you read any
                notices carefully. If you do not wish to continue using the
                Service under the updated version of the Agreements, you may
                terminate the Agreements by contacting us via email.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                INTELLECTUAL PROPERTY RIGHTS
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                All materials that can be accessed on this Site are the property
                of ours and are protected by copyright, trademark, and other
                laws. This Site is intended only for your personal and
                non-commercial use. You are not allowed to use the Site or the
                materials on the Site in a way that violates our rights or that
                has not been authorized by us. Specifically, unless explicitly
                authorized in these Terms of Service or by the owner of the
                materials, you may not modify, copy, reproduce, republish,
                upload, post, transmit, translate, sell, create derivative
                works, exploit, or distribute in any manner or medium (including
                via email or other electronic means) any material from the Site.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                DISCLAIMERS
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                On the Site, we may provide links and references to websites
                that are maintained by third parties. However, our linking to
                such third-party sites does not mean that we endorse or sponsor
                those sites, or the information, products, or services offered
                on or through them. Moreover, we and our affiliates do not
                operate or control any information, products, or services that
                may be provided by third parties on or through the Site or on
                websites that are linked to from the Site.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                If applicable, any opinions, advice, statements, services,
                offers, or other information or content expressed or made
                available by third parties, including information providers, are
                those of the respective authors or distributors and not of the
                COMPANY. Neither the COMPANY nor any third-party provider of
                information guarantees the accuracy, completeness, or usefulness
                of any content.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                The information, products, and services that are provided on or
                through the Site by the COMPANY and any third-party sites are
                offered on an "as is" basis without any warranties of any kind,
                either express or implied. We disclaim all warranties,
                including, but not limited to, the implied warranties of
                merchantability and fitness for a particular purpose, to the
                fullest extent permitted by applicable law.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                PURCHASES AND ONLINE COMMERCE/TRANSACTIONS
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                You consent to just buy products or administrations for yourself
                or for someone else for whom you are lawfully allowed to do.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                You agree to pay all fees and applicable charges for Services
                you purchase from us. All fees and applicable charges are
                payable in full and in advance and will be valid until the
                completion of the period of your selected Service or until
                cancelled or terminated in accordance with these Terms. We
                reserve the right to delete or suspend your access to Services
                for incomplete payment of fees and applicable charges.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Please be aware that we use third-party payment gateways or
                aggregators, referred to as "Third-Party Payment Service
                Providers," to collect fees and applicable charges. These
                Third-Party Payment Service Providers operate independently and
                are not affiliated with us.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                REFUND POLICY
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Unless otherwise provided by law, you acknowledge that we do not
                offer refunds for any portion of your payment for any of our
                services, digital products, courses, workshops, coaching or
                masterclass.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                For more details please refer –{" "}
                <a
                  href="https://www.xworks.live/refund_policy"
                  className="text-blue-600 hover:underline"
                >
                  www.xworks.live/refund_policy
                </a>
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                INDEMNITY
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                You agree to defend, indemnify, and hold harmless ULTRALIT Team,
                Remote CTO, its founder, its affiliates, officers, employees and
                agents for all losses, costs, actions, claims, damages, expenses
                (including legal costs) or liabilities, that arise from or
                relate to:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1 ml-4">
                <li>
                  your use or misuse of the Website or Services or Content;
                </li>
                <li>
                  your infringement of any of our intellectual property rights
                  or third party's intellectual property;
                </li>
                <li>
                  the use of our Services and any connected interaction with
                  Third Party Payment Service Providers;
                </li>
                <li>violation of any of the terms of these Terms;</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                LIMITATION OF LIABILITY
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                All liability of ULTRALIT Team, Remote CTO, its founder,
                officers, employees, and agents is expressly excluded to the
                fullest extent permissible under law for any direct, indirect,
                incidental, special, punitive, and consequential losses or
                damages howsoever arising from:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1 ml-4 mb-3">
                <li>your use of our Website and Services and Content;</li>
                <li>you use of content provided by third parties;</li>
                <li>your use of content provided by other Users;</li>
                <li>any unauthorized access or use of our secure servers.</li>
              </ul>
              <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                UNDER NO CIRCUMSTANCES, INCLUDING, BUT NOT LIMITED TO,
                NEGLIGENCE, SHALL WE, OUR SUBSIDIARY AND PARENT COMPANIES OR
                AFFILIATES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
                SPECIAL OR CONSEQUENTIAL DAMAGES THAT RESULT FROM THE USE OF, OR
                THE INABILITY TO USE, THE SITE, INCLUDING ITS MATERIALS,
                PRODUCTS, OR SERVICES, OR THIRD-PARTY MATERIALS, PRODUCTS, OR
                SERVICES MADE AVAILABLE THROUGH THE SITE.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                TERMINATION OF SERVICES / DELETION OF ACCOUNT
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                We reserve the right to terminate your account and access to all
                or any part of the Website or Services at any time, effective
                immediately, for violation of any of the terms of these Terms.
                If you wish to terminate your account, you may do so by
                following the instructions on the Website. However, any fees or
                applicable charges already paid will remain non-refundable even
                in the event of a termination of account.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                APPLICABLE LAW AND JURISDICTION
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with the laws of India. For the purposes of these Terms, you
                consent to the courts of Ahmedabad, India having exclusive
                jurisdiction over any and all disputes that arise out of, or in
                relation to or connected with these Terms.
              </p>
            </section>
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

export default TermsModal;
