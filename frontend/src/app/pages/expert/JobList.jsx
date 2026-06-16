import { useState } from "react";
import { Link } from "react-router";
import { Search, DollarSign, Clock, ArrowRight, SlidersHorizontal, X } from "lucide-react";

// TEMP MOCK DB - replace with API call when backend is ready
import { getMockOpenJobs, getMockAiCategories } from "../../../mock-db/mockDbService.js";

/**
 * JobList — Expert browses available projects to find work.
 *
 * Flow: Click job → /expert/jobs/:id (JobDetail) → "Apply Now" → /expert/jobs/:id/proposal
 *
 * Phase 4: Added advanced filters for category, budget range, skills, and sort order.
 * All filtering is client-side for now.
 */
export function JobList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filters
  const [filters, setFilters] = useState({
    category: "",
    minBudget: 0,
    maxBudget: 0,
    skill: "",
    sortBy: "newest", // "newest" | "budget_high" | "budget_low" | "deadline"
  });

  // TEMP MOCK DB - replace with API call when backend is ready
  const jobs = getMockOpenJobs();

  const allCategories = getMockAiCategories();
  const allSkills = [...new Set(jobs.flatMap((j) => j.requiredSkills || []))].sort();

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: "", minBudget: 0, maxBudget: 0, skill: "", sortBy: "newest" });
  };

  const hasActiveFilters =
    filters.category || filters.minBudget > 0 || filters.maxBudget > 0 || filters.skill;

  // Apply filters + sort
  let filtered = jobs.filter((j) => {
    if (!j) return false;

    // Text search
    if (searchTerm && !j.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Category filter
    if (filters.category && j.category !== filters.category) {
      return false;
    }

    // Budget range
    const budget = Number(j.budget) || 0;
    if (filters.minBudget > 0 && budget < filters.minBudget) return false;
    if (filters.maxBudget > 0 && budget > filters.maxBudget) return false;

    // Skill filter
    if (filters.skill && !j.requiredSkills?.some((s) => s.toLowerCase().includes(filters.skill.toLowerCase()))) {
      return false;
    }

    return true;
  });

  // Sort
  switch (filters.sortBy) {
    case "budget_high":
      filtered = [...filtered].sort((a, b) => (Number(b.budget) || 0) - (Number(a.budget) || 0));
      break;
    case "budget_low":
      filtered = [...filtered].sort((a, b) => (Number(a.budget) || 0) - (Number(b.budget) || 0));
      break;
    case "deadline":
      filtered = [...filtered].sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
      break;
    default: // newest
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Jobs</h1>
        <p className="text-gray-600">Browse available AI projects that match your skills</p>
      </div>

      {/* Search + Filter toggle + Sort */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-900"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border rounded-xl inline-flex items-center gap-2 text-sm font-medium transition ${
            showFilters || hasActiveFilters
              ? "border-blue-900 bg-blue-50 text-blue-900"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
        </button>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter("sortBy", e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-900 text-sm bg-white"
        >
          <option value="newest">Newest first</option>
          <option value="budget_high">Budget: High to Low</option>
          <option value="budget_low">Budget: Low to High</option>
          <option value="deadline">Deadline: Soonest</option>
        </select>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {filters.category && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
              {getMockAiCategories().find((c) => c.id === filters.category)?.label || filters.category}
              <button onClick={() => updateFilter("category", "")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.minBudget > 0 && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
              Min ${filters.minBudget}
              <button onClick={() => updateFilter("minBudget", 0)}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.maxBudget > 0 && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
              Max ${filters.maxBudget}
              <button onClick={() => updateFilter("maxBudget", 0)}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.skill && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
              {filters.skill}
              <button onClick={() => updateFilter("skill", "")}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 ml-2">
            Clear all
          </button>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900 text-sm bg-white"
              >
                <option value="">All categories</option>
                {allCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Min Budget */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Min Budget ($)</label>
              <input
                type="number"
                min="0"
                step="100"
                value={filters.minBudget || ""}
                onChange={(e) => updateFilter("minBudget", e.target.value === "" ? 0 : Number(e.target.value))}
                placeholder="Any"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900 text-sm"
              />
            </div>

            {/* Max Budget */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Max Budget ($)</label>
              <input
                type="number"
                min="0"
                step="100"
                value={filters.maxBudget || ""}
                onChange={(e) => updateFilter("maxBudget", e.target.value === "" ? 0 : Number(e.target.value))}
                placeholder="Any"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900 text-sm"
              />
            </div>

            {/* Skill required */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Required Skill</label>
              <select
                value={filters.skill}
                onChange={(e) => updateFilter("skill", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900 text-sm bg-white"
              >
                <option value="">Any skill</option>
                {allSkills.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700">
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No jobs found</h3>
          <p className="text-sm text-gray-400">
            {searchTerm || hasActiveFilters
              ? "Try adjusting your search or filters."
              : "No jobs are currently available. Check back soon."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => (
            <Link
              to={`/expert/jobs/${job.id}`}
              key={job.id}
              className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                    {job.category && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {getMockAiCategories().find((c) => c.id === job.category)?.label || job.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" /> ${job.budget != null ? job.budget.toLocaleString() : "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {job.durationValue} {job.durationUnit}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
