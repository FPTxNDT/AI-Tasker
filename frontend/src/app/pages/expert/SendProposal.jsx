import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Send,
  Paperclip,
  FileText,
  Image,
  File,
  FolderOpen,
  X,
  DollarSign,
  Calendar,
} from "lucide-react";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";
import { BackButton } from "../../components/shared/BackButton.jsx";
import { addSessionProposal } from "../../lib/proposalStore.js";

import {
  getMockProjectById,
  getMockUserById,
} from "../../../mock-db/mockDbService.js";
import { DEMO_EXPERT_ID } from "../../lib/demoConfig.js";

/**
 * SendProposal — Expert submits a comprehensive proposal to a client project.
 *
 * All fields are stored in local state and, on submit, saved to the session
 * proposal store so they appear in "My Proposals" and "Proposal Details".
 */
export function SendProposal() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  // ---- Fetch project + client info ----
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const p = getMockProjectById(projectId);
    if (p) {
      setProject(p);
      const c = getMockUserById(p.clientId);
      if (c) setClient(c);
    }
  }, [projectId]);

  // ---- Form state ----
  const [form, setForm] = useState({
    proposalTitle: "",
    professionalIntro: "",
    technicalApproach: "",
    timelineMilestones: "",
    dependencies: "",
    bidAmount: 0,
    durationDays: 14,
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ---- Mock attachments ----
  const [attachments, setAttachments] = useState([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const handleAddAttachment = (type) => {
    const demoFiles = {
      image: { name: "portfolio-screenshot.png", type: "image/png", size: "245 KB" },
      file: { name: "resume-cv.pdf", type: "application/pdf", size: "1.2 MB" },
      folder: { name: "project-portfolio/", type: "folder", size: "3 files" },
    };
    const file = demoFiles[type];
    if (file) {
      setAttachments((prev) => [...prev, { ...file, id: Date.now() + Math.random() }]);
    }
    setShowAttachMenu(false);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // ---- Submit ----
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const record = addSessionProposal({
      projectId,
      expertId: DEMO_EXPERT_ID,
      proposalTitle: form.proposalTitle.trim(),
      professionalIntro: form.professionalIntro.trim(),
      technicalApproach: form.technicalApproach.trim(),
      timelineMilestones: form.timelineMilestones.trim(),
      dependencies: form.dependencies.trim(),
      bidAmount: Number(form.bidAmount) || 0,
      durationDays: Number(form.durationDays) || 1,
      attachments: [...attachments],
    });

    // Small delay for UX feedback
    setTimeout(() => {
      setSubmitting(false);
      navigate(`/expert/proposals/${record.id}`);
    }, 400);
  };

  // ---- Project not found ----
  if (!project && projectId) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallback="/expert/jobs" className="mb-6">Back</BackButton>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-500">Project not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <BackButton fallback="/expert/jobs" className="mb-6">Back</BackButton>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* ================================================================ */}
          {/* Header — Project Summary                                         */}
          {/* ================================================================ */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              Send Proposal
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {project?.title || "Project"}
            </h1>
            {project && (
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                {client && (
                  <span>
                    Client: <span className="font-medium text-gray-700">{client.fullName}</span>
                    {client.profile?.company ? ` · ${client.profile.company}` : ""}
                  </span>
                )}
                {project.budget != null && (
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    Budget: <span className="font-medium text-gray-700"><MoneyDisplay amount={project.budget} /></span>
                  </span>
                )}
                {project.category && (
                  <span className="inline-flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Category: <span className="font-medium text-gray-700 capitalize">{project.category}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/* Form Body                                                         */}
          {/* ================================================================ */}
          <div className="p-8 space-y-8">
            {/* 1. Proposal Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Proposal Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.proposalTitle}
                onChange={(e) => updateField("proposalTitle", e.target.value)}
                placeholder="e.g., Vietnamese Chatbot Solution using Rasa Framework"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>

            {/* 2. Professional Introduction */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Professional Introduction <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.professionalIntro}
                onChange={(e) => updateField("professionalIntro", e.target.value)}
                rows={5}
                placeholder="Introduce yourself — your experience, background, relevant skills, and why you are the best fit for this project."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-y"
                required
              />
            </div>

            {/* 3. Technical Approach & Methodology */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Technical Approach & Methodology <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.technicalApproach}
                onChange={(e) => updateField("technicalApproach", e.target.value)}
                rows={6}
                placeholder="Explain your architecture, tools, development approach, APIs, models, frameworks, and deployment strategy."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-y"
                required
              />
            </div>

            {/* 4. Implementation Timeline & Milestones */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Implementation Timeline & Milestones <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.timelineMilestones}
                onChange={(e) => updateField("timelineMilestones", e.target.value)}
                rows={5}
                placeholder={"Week 1: Requirements gathering & data exploration\nWeek 2: Architecture design & setup\nWeek 3: Core model development\nWeek 4: Testing & validation\nWeek 5: Deployment & documentation"}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono resize-y"
                required
              />
            </div>

            {/* 5. Dependencies & Client Requirements */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Dependencies & Client Requirements
              </label>
              <textarea
                value={form.dependencies}
                onChange={(e) => updateField("dependencies", e.target.value)}
                rows={4}
                placeholder="List required datasets, API keys, credentials, documents, test environments, or client-side resources needed to complete the project."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-y"
              />
            </div>

            {/* 6. Portfolio / Attachments */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Portfolio & Attachments
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Attach your CV, portfolio, demo files, PDFs, or supporting documents.
              </p>

              {/* Attached files list */}
              {attachments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        {att.type === "image/png" ? (
                          <Image className="w-5 h-5 text-blue-500" />
                        ) : att.type === "folder" ? (
                          <FolderOpen className="w-5 h-5 text-amber-500" />
                        ) : (
                          <File className="w-5 h-5 text-gray-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-700">{att.name}</p>
                          <p className="text-xs text-gray-400">{att.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add attachment dropdown */}
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setShowAttachMenu((v) => !v)}
                  className="px-4 py-2.5 border border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 text-sm font-medium text-gray-600 inline-flex items-center gap-2 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                  Add Attachment
                </button>
                {showAttachMenu && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-[200px]">
                    {[
                      { key: "image", label: "Upload Image", icon: Image, color: "text-blue-500" },
                      { key: "file", label: "Upload File (PDF/Doc)", icon: File, color: "text-gray-500" },
                      { key: "folder", label: "Upload Folder", icon: FolderOpen, color: "text-amber-500" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleAddAttachment(item.key)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-3 transition-colors"
                      >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 7. Bid Amount + Estimated Duration — side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Bid Amount (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.bidAmount || ""}
                    onChange={(e) =>
                      updateField("bidAmount", e.target.value === "" ? 0 : Number(e.target.value))
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="5000"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Enter a whole dollar amount (e.g. 5000)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Estimated Duration (Days) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.durationDays || ""}
                    onChange={(e) =>
                      updateField("durationDays", e.target.value === "" ? 1 : Number(e.target.value))
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="14"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Estimated days to complete the project</p>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* Footer — Submit                                                   */}
          {/* ================================================================ */}
          <div className="p-8 border-t border-gray-100 bg-gray-50/50">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-blue-900 text-white rounded-xl hover:bg-blue-800 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? (
                <>
                  <span className="animate-pulse">Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Proposal
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
