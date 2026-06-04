import { FileText, Sparkles, Users, Rocket } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: 'Describe your AI project',
      description: 'Share your requirements and project details'
    },
    {
      icon: Sparkles,
      title: 'AI analyzes requirements',
      description: 'Our AI processes and understands your needs'
    },
    {
      icon: Users,
      title: 'Get matched with experts',
      description: 'Receive personalized expert recommendations'
    },
    {
      icon: Rocket,
      title: 'Start collaboration',
      description: 'Begin working with your chosen expert'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-purple-50/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Simple, fast, and powered by AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl hover:border-purple-200 transition-all h-full group hover:scale-105">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {index + 1}
                    </div>

                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
