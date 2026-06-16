import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Save } from "lucide-react";

export function EditExpertProfile() {
  const navigate = useNavigate();
  // TODO: Fetch current profile from API
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    hourlyRate: "",
    bio: "",
  });
  const [skills, setSkills] = useState([]);

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Save to API
    navigate("/expert/profile");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/expert/profile" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Expert Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        {[
          { key: "name", label: "Full Name" },
          { key: "title", label: "Professional Title" },
          { key: "email", label: "Email Address" },
          { key: "phone", label: "Phone Number" },
          { key: "location", label: "Location" },
          { key: "hourlyRate", label: "Hourly Rate (USD)" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input type="text" value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900" />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
          {skills.length === 0 ? (
            <p className="text-sm text-gray-400">No skills added. Add skills to improve your profile visibility.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm inline-flex items-center gap-2">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="text-blue-400 hover:text-blue-600">&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
          <Link to="/expert/profile" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
