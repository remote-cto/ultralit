import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
   <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid md:grid-cols-4 gap-8 mb-12">
      <div className="col-span-2">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-amber-900" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
            ULTRALIT
          </span>
        </div>
        <p className="text-slate-300 leading-relaxed mb-6 max-w-md">
          Empowering professionals with personalized AI intelligence. 
          Stay ahead of the curve with insights that matter to your career.
        </p>
        <div className="flex space-x-4">
          {["📧","💼","🐦"].map((icon, i) => (
            <button key={i} className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-br hover:from-amber-400 hover:to-amber-500 text-slate-400 hover:text-slate-900 rounded-lg flex items-center justify-center transition-all duration-300 shadow hover:shadow-lg">
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-slate-200 font-bold text-lg mb-4">Product</h4>
        <ul className="space-y-3 text-slate-400">
          <li><a href="#" className="hover:text-amber-400 transition-colors">Features</a></li>
          <li><a href="#pricing" className="hover:text-amber-400 transition-colors">Pricing</a></li>
          <li><a href="#" className="hover:text-amber-400 transition-colors">Free Trial</a></li>
          <li><a href="#" className="hover:text-amber-400 transition-colors">Enterprise</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-slate-200 font-bold text-lg mb-4">Support</h4>
        <ul className="space-y-3 text-slate-400">
          <li><a href="#" className="hover:text-amber-400 transition-colors">Help Center</a></li>
          <li><a href="#" className="hover:text-amber-400 transition-colors">Contact Us</a></li>
          <li><a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a></li>
        </ul>
      </div>
    </div>

    <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
      <p className="text-slate-400 text-sm mb-4 md:mb-0">
        © 2025 Ultralit. All rights reserved. Accelerating careers through AI intelligence.
      </p>
      <div className="flex items-center space-x-4 text-sm text-slate-400">
        <span>Made with ❤️ for professionals</span>
      </div>
    </div>
  </div>
</footer>

  );
};

export default Footer;