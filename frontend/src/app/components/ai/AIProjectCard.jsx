import { Bot, Star, Clock } from "lucide-react";

export function AIProjectCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-semibold text-blue-900">AI Project Analysis</span>
      </div>

      <div className="text-center py-8">
        <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-500 mb-2">AI Analysis Ready</h3>
        <p className="text-sm text-gray-400">AI will analyze and recommend experts for your project.</p>
      </div>
    </div>
  );
}
