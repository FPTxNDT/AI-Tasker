export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid — 4 equal columns, all content centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo + Description */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-base font-semibold text-gray-900">Tasker</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[220px] mx-auto">
              Connecting businesses with AI experts worldwide.
            </p>
          </div>

          {/* About */}
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">About</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Our Story</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Team</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Support</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Terms &amp; Conditions</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">&copy; 2026 AI Tasker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
