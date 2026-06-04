import { ArrowRight, Users } from 'lucide-react';
import { AIWorkflowIllustration } from '../ai/AIWorkflowIllustration.jsx';

export function HeroSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Where Businesses Meet{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Experts
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Connect clients and AI professionals through an intelligent AI-powered marketplace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
                Hire Experts
                <Users className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-2xl font-medium hover:border-purple-300 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                Become Expert
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="lg:pl-8">
            <AIWorkflowIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
