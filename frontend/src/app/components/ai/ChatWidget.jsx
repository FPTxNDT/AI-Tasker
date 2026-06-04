import { useState } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 mb-4 overflow-hidden">
          <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></button>
          </div>
          <div className="p-4 h-64 overflow-y-auto">
            <div className="text-center py-8">
              <Bot className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Hi! How can I help you today?</p>
            </div>
          </div>
          <div className="p-3 border-t flex gap-2">
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Type a message..." />
            <button className="p-2 bg-blue-900 text-white rounded-lg"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-blue-900 text-white rounded-2xl shadow-lg hover:bg-blue-800 flex items-center justify-center">
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
