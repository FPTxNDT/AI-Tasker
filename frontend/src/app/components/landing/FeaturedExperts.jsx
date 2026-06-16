import { Star, DollarSign, Users } from 'lucide-react';

// TEMP MOCK DB - replace with API call when backend is ready
import { getMockUsers } from '../../../mock-db/mockDbService.js';

const EXPERT_AVATARS = [
  "from-blue-400 to-purple-500",
  "from-green-400 to-teal-500",
];

export function FeaturedExperts() {
  // TEMP MOCK DB - replace with API call when backend is ready
  const experts = getMockUsers()
    .filter((u) => u.role === "expert")
    .map((u, i) => ({
      id: u.id,
      name: u.fullName,
      avatar: EXPERT_AVATARS[i % EXPERT_AVATARS.length],
      specialization: u.profile?.specialization || u.profile?.title || "",
      rating: u.profile?.rating || 0,
      reviews: u.profile?.reviewCount || 0,
      hourlyRate: u.profile?.hourlyRate || 0,
    }));

  return (
    <section id="experts" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Experts</h2>
          <p className="text-xl text-gray-600">Connect with top-rated AI professionals</p>
        </div>

        {experts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">No experts available</h3>
            <p className="text-sm text-gray-400">Check back soon for featured AI experts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-purple-200 transition-all cursor-pointer group hover:scale-105"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${expert.avatar} flex-shrink-0 shadow-lg`} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{expert.name}</h3>
                    <p className="text-sm text-gray-600">{expert.specialization}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-gray-900">{expert.rating}</span>
                    <span className="text-xs text-gray-500">({expert.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">${expert.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
