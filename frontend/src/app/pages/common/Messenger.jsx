import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Send,
  Plus,
  Image,
  File,
  FolderOpen,
  X,
  Download,
  Eye,
} from "lucide-react";

import {
  getMockConversationsByUser,
  getMockMessagesBetweenUsers,
  getMockUserById,
} from "../../../mock-db/mockDbService.js";
import { DEMO_EXPERT_ID, DEMO_CLIENT_ID } from "../../lib/demoConfig.js";

// ---------------------------------------------------------------------------
// In-memory session messages — appended when user sends a message in the UI
// ---------------------------------------------------------------------------
const _sessionMessages = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Detect which demo user to use based on the conversation participants. */
function detectDemoUser(convId, conversations) {
  if (!convId) return DEMO_EXPERT_ID;
  const conv = conversations.find((c) => c.id === convId);
  if (!conv) return DEMO_EXPERT_ID;
  // Prefer expert-001 if present, else client-001, else first participant
  if (conv.participants.includes(DEMO_EXPERT_ID)) return DEMO_EXPERT_ID;
  if (conv.participants.includes(DEMO_CLIENT_ID)) return DEMO_CLIENT_ID;
  return conv.participants[0];
}

// ---------------------------------------------------------------------------
// Attachment types for the plus menu
// ---------------------------------------------------------------------------

const ATTACH_OPTIONS = [
  { key: "image", label: "Upload Image", icon: Image, color: "text-blue-500", ext: ".png", mime: "image/png" },
  { key: "file", label: "Upload File", icon: File, color: "text-gray-600", ext: ".pdf", mime: "application/pdf" },
  { key: "folder", label: "Upload Folder", icon: FolderOpen, color: "text-amber-500", ext: "/", mime: "folder" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Messenger() {
  const { id: activeConvId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // ---- Plus menu state ----
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showSentFiles, setShowSentFiles] = useState(false);

  // ---- Pending attachments (before sending) ----
  const [pendingAttachments, setPendingAttachments] = useState([]);

  // ---- Sent attachments tracker ----
  const [sentAttachments, setSentAttachments] = useState([]);

  // ---- Session messages state (re-render trigger) ----
  const [sessionMsgs, setSessionMsgs] = useState([..._sessionMessages]);

  // ---- Determine demo user ----
  const rawConversations = getMockConversationsByUser(DEMO_EXPERT_ID);
  const allConvIds = new Set(rawConversations.map((c) => c.id));

  // If activeConvId is not in expert conversations, try client conversations
  const demoUserId = allConvIds.has(activeConvId)
    ? detectDemoUser(activeConvId, rawConversations)
    : DEMO_EXPERT_ID;

  // ---- Build conversation list ----
  const demoConvs = getMockConversationsByUser(demoUserId);

  const conversations = demoConvs.map((conv) => {
    const otherUserId = conv.participants.find((p) => p !== demoUserId);
    const otherUser = otherUserId ? getMockUserById(otherUserId) : null;
    const msgs = getMockMessagesBetweenUsers(demoUserId, otherUserId);

    // Merge session messages for this conversation
    const extraMsgs = _sessionMessages.filter((m) => m.conversationId === conv.id);

    const allMsgs = [...msgs, ...extraMsgs].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );

    const lastMsg = allMsgs.length > 0 ? allMsgs[allMsgs.length - 1] : null;
    const lastText = lastMsg?.text || (lastMsg?.attachment ? "📎 Attachment" : "No messages yet");

    return {
      id: conv.id,
      projectId: conv.projectId,
      name: otherUser?.fullName || otherUserId || "Unknown",
      role: otherUser?.profile?.title || otherUser?.role || "",
      lastMessage: lastText,
      messages: allMsgs.map((m) => ({
        id: m.id,
        text: m.text || "",
        attachment: m.attachment || null,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOwn: m.senderId === demoUserId,
      })),
    };
  });

  const activeConversation = conversations.find((c) => c.id === activeConvId) || null;

  // ---- Debug: log state changes to help diagnose "no input box" issues ----
  useEffect(() => {
    console.log(
      "[Messenger] activeConvId:",
      activeConvId,
      "| demoUserId:",
      demoUserId,
      "| conversations:",
      conversations.length,
      "| activeConversation:",
      activeConversation?.name || "NONE (empty state)",
    );
  }, [activeConvId, demoUserId, conversations.length, activeConversation]);

  // ---- Scroll to bottom — only when new messages are added, NOT on initial load ----
  const messagesContainerRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  const didInitialLoadRef = useRef(false);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const currentCount = activeConversation?.messages?.length || 0;
    const prevCount = prevMessageCountRef.current;

    // Only scroll if messages were added AFTER the conversation was already loaded
    if (didInitialLoadRef.current && currentCount > prevCount) {
      container.scrollTop = container.scrollHeight;
    }

    // Mark initial load complete and update count tracker
    if (activeConversation && !didInitialLoadRef.current) {
      didInitialLoadRef.current = true;
    }
    prevMessageCountRef.current = currentCount;
  }, [activeConversation?.messages?.length]);

  // Reset initial-load tracker when conversation changes
  useEffect(() => {
    didInitialLoadRef.current = false;
    prevMessageCountRef.current = 0;
  }, [activeConvId]);

  // ---- Close plus menu on outside click ----
  useEffect(() => {
    if (!showPlusMenu && !showSentFiles) return;
    const handler = () => {
      setShowPlusMenu(false);
      setShowSentFiles(false);
    };
    // Small delay to avoid catching the click that opened the menu
    const id = setTimeout(() => document.addEventListener("click", handler), 50);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", handler);
    };
  }, [showPlusMenu, showSentFiles]);

  // ---- Add attachment from plus menu ----
  const handleAddAttachment = (type) => {
    const mockFiles = {
      image: { name: `image-${Date.now().toString(36)}.png`, type: "image/png", size: "245 KB" },
      file: { name: `document-${Date.now().toString(36)}.pdf`, type: "application/pdf", size: "1.8 MB" },
      folder: { name: `project-files-${Date.now().toString(36)}/`, type: "folder", size: "3 files" },
    };
    const file = mockFiles[type];
    if (file) {
      setPendingAttachments((prev) => [...prev, { ...file, id: `att-${Date.now()}` }]);
    }
    setShowPlusMenu(false);
  };

  const removePendingAttachment = (id) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // ---- Send message ----
  const handleSend = () => {
    const hasText = message.trim().length > 0;
    const hasAttachments = pendingAttachments.length > 0;
    if (!hasText && !hasAttachments) return;
    if (!activeConvId) return;

    const newMsg = {
      id: `session-msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      conversationId: activeConvId,
      senderId: demoUserId,
      receiverId: activeConversation?.name || "recipient",
      text: message.trim(),
      attachment: hasAttachments ? { ...pendingAttachments[0] } : null,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    _sessionMessages.push(newMsg);
    if (hasAttachments) {
      setSentAttachments((prev) => [...prev, ...pendingAttachments.map((a) => ({ ...a, messageId: newMsg.id }))]);
    }

    setMessage("");
    setPendingAttachments([]);
    setSessionMsgs([..._sessionMessages]);
  };

  // ---- Handle Enter key ----
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---- Collect all sent attachments across conversations ----
  const allSentAttachments = sentAttachments;

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex h-[calc(100vh-10rem)]">
        {/* ================================================================ */}
        {/* Conversation List                                                   */}
        {/* ================================================================ */}
        <div className="w-80 border-r border-gray-200 flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Messages</h2>
          </div>
          {conversations.length === 0 ? (
            <div className="p-8 text-center flex-1 flex items-center justify-center">
              <p className="text-sm text-gray-400">No conversations yet</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {conversations.map((conv) => (
                <button
                  type="button"
                  onClick={() => navigate(`/messenger/${conv.id}`)}
                  key={conv.id}
                  className={`w-full text-left block p-4 hover:bg-gray-50 border-b border-gray-50 transition-colors ${
                    conv.id === activeConvId ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-700">
                        {conv.name?.[0] || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{conv.name}</p>
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* Chat Area                                                           */}
        {/* ================================================================ */}
        <div className="flex-1 flex flex-col min-w-0" key={activeConvId || "empty"}>
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  Select a conversation
                </h3>
                <p className="text-sm text-gray-400">
                  Choose a conversation from the list to start messaging.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700">
                      {activeConversation.name?.[0] || "?"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {activeConversation.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {activeConversation.role || "Client"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeConversation.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        msg.isOwn
                          ? "bg-blue-900 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                      }`}
                    >
                      {/* Attachment display */}
                      {msg.attachment && (
                        <div
                          className={`mb-2 p-2 rounded-lg flex items-center gap-2 ${
                            msg.isOwn ? "bg-blue-800" : "bg-gray-200"
                          }`}
                        >
                          {msg.attachment.type === "image/png" ? (
                            <Image className="w-5 h-5 flex-shrink-0" />
                          ) : msg.attachment.type === "folder" ? (
                            <FolderOpen className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <File className="w-5 h-5 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">
                              {msg.attachment.name}
                            </p>
                            <p className="text-[10px] opacity-70">
                              {msg.attachment.size}
                            </p>
                          </div>
                          <Download className="w-4 h-4 flex-shrink-0 opacity-70 cursor-pointer" />
                        </div>
                      )}

                      {/* Text */}
                      {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}

                      {/* Time */}
                      <p
                        className={`text-[10px] mt-1.5 ${
                          msg.isOwn ? "text-blue-200" : "text-gray-400"
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* ============================================================ */}
              {/* Input Area                                                      */}
              {/* ============================================================ */}

              {/* Pending attachments preview */}
              {pendingAttachments.length > 0 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {pendingAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5"
                    >
                      {att.type === "image/png" ? (
                        <Image className="w-4 h-4 text-blue-500" />
                      ) : att.type === "folder" ? (
                        <FolderOpen className="w-4 h-4 text-amber-500" />
                      ) : (
                        <File className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-xs font-medium text-gray-700">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => removePendingAttachment(att.id)}
                        className="p-0.5 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input row */}
              <div className="p-3 border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {/* Plus button with dropdown */}
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPlusMenu((v) => !v);
                        setShowSentFiles(false);
                      }}
                      className="h-10 w-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                      title="Add attachment"
                    >
                      <Plus className="w-5 h-5" />
                    </button>

                    {showPlusMenu && (
                      <div
                        className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-[210px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {ATTACH_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => handleAddAttachment(opt.key)}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-3 transition-colors"
                          >
                            <opt.icon className={`w-4 h-4 ${opt.color}`} />
                            {opt.label}
                          </button>
                        ))}
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setShowSentFiles(true);
                            setShowPlusMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-3 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-green-500" />
                          View Sent Attachments
                        </button>
                      </div>
                    )}

                    {/* Sent attachments modal */}
                    {showSentFiles && (
                      <div
                        className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg py-3 px-4 z-20 w-[280px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">Sent Files</h4>
                          <button
                            type="button"
                            onClick={() => setShowSentFiles(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {allSentAttachments.length === 0 ? (
                          <p className="text-xs text-gray-400 py-2">
                            No attachments sent yet.
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {allSentAttachments.map((att, idx) => (
                              <div
                                key={att.id || idx}
                                className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"
                              >
                                {att.type === "image/png" ? (
                                  <Image className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                ) : att.type === "folder" ? (
                                  <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                ) : (
                                  <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-gray-700 truncate">
                                    {att.name}
                                  </p>
                                  <p className="text-[10px] text-gray-400">{att.size}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Text input */}
                  <div className="flex-1 relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message... (Enter to send)"
                      rows={1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none min-h-10 max-h-[120px]"
                    />
                  </div>

                  {/* Send button */}
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!message.trim() && pendingAttachments.length === 0}
                    className="h-10 w-10 flex items-center justify-center bg-blue-900 text-white rounded-xl hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    title="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
