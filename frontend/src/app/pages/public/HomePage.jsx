import { Link } from "react-router";
import { Search, Users, Briefcase, ArrowRight } from "lucide-react";

export function HomePage() {
  return (
    <div className="min-h-screen bg-white relative flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <span className="text-[22px] font-bold text-gray-900">Tasker</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-5 py-2.5 text-[15px] font-medium text-gray-700 hover:text-blue-900 transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold text-[15px] shadow-sm transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Connect with Top AI Experts</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Professional platform connecting businesses with skilled AI professionals for your projects
          </p>
          <div className="flex justify-center">
            <Link to="/signup" className="px-8 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium inline-flex items-center justify-center gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, color: "bg-blue-100 text-blue-900", title: "Post Your Project", desc: "Describe your AI project needs and requirements" },
              { icon: Users, color: "bg-green-100 text-green-700", title: "Review Proposals", desc: "Receive and evaluate proposals from qualified experts" },
              { icon: Briefcase, color: "bg-orange-100 text-orange-700", title: "Start Working", desc: "Collaborate with your chosen expert to complete the project" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className={`w-16 h-16 ${item.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 flex-1">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of businesses and AI experts on our platform</p>
          <Link to="/signup" className="px-8 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium inline-block">
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
}
