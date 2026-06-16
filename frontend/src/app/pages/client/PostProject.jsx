import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Send } from "lucide-react";
import { AIChatbox } from "../../components/ai/AIChatbox.jsx";
import { getMockAiCategories } from "../../../mock-db/mockDbService.js";

/**
 * PostProject — Client form for creating a new project.
 *
 * Data types:
 *  - budget        → stored as number (never "$5,000")
 *  - durationValue → stored as number
 *  - durationUnit  → stored as string ("days" | "weeks" | "months")
 *
 * Formatting happens at render time only (e.g. via MoneyDisplay or Intl.NumberFormat).
 */
export function PostProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    budget: 0,          // number — no $, no commas
    durationValue: 1,   // number
    durationUnit: "days", // "days" | "weeks" | "months"
  });

  const [selectedSkills, setSelectedSkills] = useState([]);

  // TODO: Fetch available skills from API
  const allAvailableSkills = [];

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build the numeric payload for the API
    const payload = {
      category: formData.category,
      title: formData.title.trim(),
      description: formData.description.trim(),
      budget: Number(formData.budget) || 0,
      durationValue: Number(formData.durationValue) || 1,
      durationUnit: formData.durationUnit,
      skills: selectedSkills,
    };

    // TODO: POST /api/projects with the payload above
    console.log("Submitting project:", payload);
    navigate("/client/my-projects");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Post a New Project</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        {/* Left column: AI chat assistant */}
        <div className="lg:col-span-2">
          <AIChatbox />
        </div>

        {/* Right column: Project form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6 h-full">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900"
                placeholder="e.g., AI Chatbot Development"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900"
                placeholder="Describe your project requirements..."
                required
              />
            </div>

            {/* AI Category Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Category Domain
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900 bg-white"
                required
              >
                <option value="" disabled>Select a category...</option>
                {getMockAiCategories().map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Budget + Duration row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Budget — type="number" */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.budget || ""}
                  onChange={(e) => updateField("budget", e.target.value === "" ? 0 : Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900"
                  placeholder="5000"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter a whole dollar amount (e.g. 5000)
                </p>
              </div>

              {/* Duration — number + unit select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.durationValue || ""}
                    onChange={(e) =>
                      updateField("durationValue", e.target.value === "" ? 1 : Number(e.target.value))
                    }
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900"
                    placeholder="1"
                  />
                  <select
                    value={formData.durationUnit}
                    onChange={(e) => updateField("durationUnit", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900 bg-white"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              {allAvailableSkills.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No skills available for selection.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allAvailableSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? "bg-blue-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium inline-flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Publish Project
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
