import React from "react";
import { Sparkles } from "lucide-react";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer className={`bg-white py-8 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto font-[Inter]">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          {/* Same logo as Header */}
          <div className="flex items-center mb-6 lg:mb-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-yellow-500">
                ULTRALIT
              </span>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex flex-wrap justify-center lg:justify-end gap-3 w-full lg:w-auto">
            {/* Facebook */}
            <a
              href="#"
              className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-[#1877F2] transition-colors"
              aria-label="Facebook"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22.675 0h-21.35C.596 0 0 .593 0 1.326v21.348C0 23.405.596 24 1.325 24h11.494V14.708h-3.13v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.464.098 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116C23.404 24 24 23.405 24 22.674V1.326C24 .593 23.404 0 22.675 0z" />
              </svg>
            </a>

            {/* Twitter */}
            <a
              href="#"
              className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-[#1DA1F2] transition-colors"
              aria-label="Twitter"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724c-.95.564-2.005.974-3.127 1.195a4.916 4.916 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.708.87 3.215 2.188 4.099a4.904 4.904 0 01-2.229-.616c-.054 1.98 1.388 3.827 3.444 4.243a4.935 4.935 0 01-2.224.084 4.919 4.919 0 004.6 3.419 9.867 9.867 0 01-6.102 2.105c-.396 0-.79-.023-1.175-.068a13.945 13.945 0 007.557 2.212c9.054 0 14-7.496 14-13.986 0-.21-.005-.423-.015-.635A10.025 10.025 0 0024 4.557z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="#"
              className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-[#0077B5] transition-colors"
              aria-label="LinkedIn"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.026-3.036-1.852-3.036-1.854 0-2.136 1.447-2.136 2.939v5.666H9.351V9h3.414v1.561h.047c.476-.9 1.637-1.852 3.368-1.852 3.6 0 4.267 2.368 4.267 5.452v6.291zM5.337 7.433a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14zm1.781 13.019H3.555V9h3.563v11.452z" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="#"
              className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-[#6e5494] transition-colors"
              aria-label="GitHub"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.255c-3.338.726-4.033-1.415-4.033-1.415-.546-1.387-1.333-1.757-1.333-1.757-1.09-.744.083-.729.083-.729 1.205.086 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.604-2.665-.305-5.467-1.335-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.123-.304-.536-1.527.117-3.176 0 0 1.008-.322 3.3 1.23.957-.267 1.983-.4 3.003-.405 1.02.005 2.047.138 3.006.405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.649.241 2.872.118 3.176.77.84 1.235 1.911 1.235 3.22 0 4.607-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .321.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm text-center md:text-left">
              © 2025 Ultralit, All Rights Reserved.
            </p>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cookie Preferences
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Code of Conduct
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
