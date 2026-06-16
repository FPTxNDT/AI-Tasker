import { useState } from "react";
import { ChevronDown } from "lucide-react";

// =============================================================================
// SkillTags — shared expandable skill/tag list with "+N" overflow badge.
//
// Props:
//   skills     — string[] (required)
//   maxVisible — number of tags to show before the "+N" badge (default 4)
// =============================================================================

export function SkillTags({ skills, maxVisible = 4 }) {
  const [expanded, setExpanded] = useState(false);

  const cleanSkills = skills ? skills.filter(Boolean) : [];
  if (cleanSkills.length === 0) return null;

  const visible = expanded ? cleanSkills : cleanSkills.slice(0, maxVisible);
  const hiddenCount = cleanSkills.length - visible.length;
  const hasHidden = hiddenCount > 0;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((skill) => (
        <span
          key={skill}
          className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium"
        >
          {skill}
        </span>
      ))}
      {hasHidden && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="px-2.5 py-0.5 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-md text-xs font-medium transition-colors inline-flex items-center gap-0.5"
          title={`Show ${hiddenCount} more skill${hiddenCount > 1 ? "s" : ""}`}
        >
          +{hiddenCount}
        </button>
      )}
      {expanded && hasHidden && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="px-2.5 py-0.5 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-md text-xs font-medium transition-colors inline-flex items-center gap-0.5"
          title="Collapse"
        >
          <ChevronDown className="w-3 h-3" /> Collapse
        </button>
      )}
    </div>
  );
}
