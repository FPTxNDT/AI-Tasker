import { Bot, Workflow, FileText, Sparkles } from 'lucide-react';

const steps = [
  { icon: FileText, label: "Describe", color: "text-blue-500" },
  { icon: Bot, label: "AI Analysis", color: "text-purple-500" },
  { icon: Sparkles, label: "Match", color: "text-amber-500" },
  { icon: Workflow, label: "Collaborate", color: "text-green-500" },
];

export function AIWorkflowIllustration() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <div className="text-center mb-6">
        <Bot className="w-10 h-10 text-blue-600 mx-auto mb-2" />
        <h3 className="font-semibold text-gray-900">AI-Powered Workflow</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="text-center p-4">
              <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Icon className={`w-6 h-6 ${step.color}`} />
              </div>
              <p className="text-xs font-medium text-gray-700">{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
