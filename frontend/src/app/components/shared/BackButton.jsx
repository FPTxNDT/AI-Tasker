import { useLocation, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

// =============================================================================
// BackButton — smart back navigation that respects the user's actual history.
//
// Behaviour (first match wins):
//   1. If `location.state?.from` is set → navigate there
//   2. Otherwise → navigate(-1) (browser history back)
//
// Props:
//   fallback  — route to use if neither state.from nor history is available
//   className — additional CSS classes for the button
//   children  — custom label (defaults to "Back")
// =============================================================================

export function BackButton({ fallback = "/", className = "", children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    // If there's history, go back; otherwise use fallback
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" /> {children || "Back"}
    </button>
  );
}
