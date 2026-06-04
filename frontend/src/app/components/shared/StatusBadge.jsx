import { getStatusBadgeClass, getStatusLabel } from "../../lib/projectStatusConfig.js";
import { getProposalStatusConfig } from "../../lib/proposalStatusConfig.js";

// =============================================================================
// StatusBadge — unified status badge for all entity types.
//
// Props:
//   status    — internal status key (e.g. "in_progress", "accepted", "active")
//   entity    — "project" | "proposal" | "task" | "user" | "transaction" | "extension"
//   className — additional CSS classes
// =============================================================================

const ENTITY_CONFIG = {
  project: {
    getClass: getStatusBadgeClass,
    getLabel: getStatusLabel,
  },
  proposal: {
    getClass: getProposalStatusConfig,
    getLabel: (key) => getProposalStatusConfig(key).label,
  },
};

export function StatusBadge({ status, entity = "project", className = "" }) {
  const config = ENTITY_CONFIG[entity];

  if (!config) {
    // Fallback for entities not yet mapped
    const label = String(status || "Unknown");
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ${className}`}>
        {label}
      </span>
    );
  }

  let badgeClass = "bg-gray-100 text-gray-700";
  let label = status || "Unknown";

  if (entity === "proposal") {
    const cfg = config.getClass(status);
    badgeClass = cfg.className;
    label = cfg.label;
  } else {
    badgeClass = config.getClass(status);
    label = config.getLabel(status);
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass} ${className}`}>
      {label}
    </span>
  );
}
