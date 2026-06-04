// MOCK DB ONLY - delete this file/folder when real backend is connected

export const users = [
  // ===================== CLIENT 1 =====================
  {
    id: "client-001",
    email: "client1@test.com",
    password: "123456",
    role: "client",
    fullName: "Sarah Mitchell",
    avatarUrl: "",
    status: "active",
    createdAt: "2025-11-15T10:30:00Z",
    profile: {
      company: "TechVentures Inc.",
      industry: "Healthcare AI",
      location: "San Francisco, CA",
      bio: "Product manager at a health-tech startup. Building AI-powered diagnostic tools.",
      totalProjectsPosted: 10,
      totalSpent: 87500,
    },
  },

  // ===================== CLIENT 2 =====================
  {
    id: "client-002",
    email: "client2@test.com",
    password: "123456",
    role: "client",
    fullName: "David Chen",
    avatarUrl: "",
    status: "active",
    createdAt: "2025-12-01T08:00:00Z",
    profile: {
      company: "DataDriven Co.",
      industry: "FinTech",
      location: "New York, NY",
      bio: "CTO of a fintech startup. Focused on fraud detection and risk modeling with AI.",
      totalProjectsPosted: 10,
      totalSpent: 123000,
    },
  },

  // ===================== EXPERT 1 =====================
  {
    id: "expert-001",
    email: "expert1@test.com",
    password: "123456",
    role: "expert",
    fullName: "Alex Johnson",
    avatarUrl: "",
    status: "active",
    createdAt: "2025-10-01T12:00:00Z",
    profile: {
      title: "Senior AI/ML Engineer",
      specialization: "NLP, Computer Vision, LLMs",
      location: "Austin, TX",
      bio: "Experienced AI engineer with 8+ years building production ML systems. Specialized in NLP and computer vision. Previously at Google AI and two successful startups.",
      skills: [
        "Python", "PyTorch", "TensorFlow", "Transformers", "Hugging Face",
        "LangChain", "OpenAI API", "Computer Vision", "FastAPI", "Docker",
        "AWS", "MLOps", "Vector Databases",
      ],
      rating: 4.9,
      reviewCount: 28,
      hourlyRate: 95,
      completedProjects: 42,
      portfolio: [
        {
          title: "Medical Image Classification System",
          description: "Built a CNN-based diagnostic tool achieving 97% accuracy on chest X-ray classification, deployed across 5 hospitals.",
        },
        {
          title: "Enterprise RAG Chatbot",
          description: "Designed a retrieval-augmented chatbot handling 10K+ internal docs with sub-second response times.",
        },
        {
          title: "Real-time Fraud Detection Pipeline",
          description: "Architected a streaming ML pipeline processing 1M+ transactions/day with 99.97% uptime.",
        },
      ],
      availability: "available",
    },
  },

  // ===================== EXPERT 2 =====================
  {
    id: "expert-002",
    email: "expert2@test.com",
    password: "123456",
    role: "expert",
    fullName: "Priya Sharma",
    avatarUrl: "",
    status: "active",
    createdAt: "2025-11-01T09:00:00Z",
    profile: {
      title: "AI Automation Specialist",
      specialization: "AI Agents, Workflow Automation, ML Pipelines",
      location: "Seattle, WA",
      bio: "Full-stack AI engineer with 6+ years experience in AI automation and agent-based systems. Passionate about building autonomous workflows that save businesses thousands of hours.",
      skills: [
        "Python", "LangChain", "AutoGPT", "CrewAI", "Node.js",
        "React", "PostgreSQL", "Redis", "Docker", "Kubernetes",
        "GCP", "Terraform", "CI/CD",
      ],
      rating: 4.7,
      reviewCount: 19,
      hourlyRate: 85,
      completedProjects: 31,
      portfolio: [
        {
          title: "Multi-Agent Customer Support System",
          description: "Built a crew of 5 AI agents handling tier-1 support, reducing response time by 80% for a SaaS company.",
        },
        {
          title: "Automated Data Pipeline Orchestrator",
          description: "Created self-healing ETL pipelines with AI-driven error recovery, processing 500GB+ daily.",
        },
        {
          title: "AI-Powered Code Review Bot",
          description: "Developed an automated PR review agent that catches bugs, suggests optimizations, and enforces style guides.",
        },
      ],
      availability: "available",
    },
  },

  // ===================== ADMIN =====================
  {
    id: "admin-001",
    email: "admin@test.com",
    password: "123456",
    role: "admin",
    fullName: "Morgan Reyes",
    avatarUrl: "",
    status: "active",
    createdAt: "2025-09-01T00:00:00Z",
    profile: {
      title: "Platform Administrator",
      location: "Chicago, IL",
      bio: "Platform administrator overseeing operations, dispute resolution, and community quality.",
    },
  },
];

export const expertReviews = [
  { id: "rev-001", expertId: "expert-001", clientId: "client-001", projectId: "proj-003", rating: 5, comment: "Alex delivered exceptional work ahead of schedule. The medical imaging model exceeded our accuracy targets. Will definitely hire again.", date: "2026-02-10" },
  { id: "rev-002", expertId: "expert-002", clientId: "client-001", projectId: "proj-006", rating: 5, comment: "Outstanding computer vision expertise. Delivered a production-ready system with great documentation.", date: "2026-03-15" },
  { id: "rev-003", expertId: "expert-001", clientId: "client-002", projectId: "proj-013", rating: 5, comment: "Alex built our chatbot in half the expected time. Great communication throughout.", date: "2026-01-20" },
  { id: "rev-004", expertId: "expert-001", clientId: "client-002", projectId: "proj-020", rating: 4, comment: "Very professional and technically strong. Minor delays on one milestone but excellent quality overall.", date: "2026-04-05" },
  { id: "rev-005", expertId: "expert-001", clientId: "client-001", projectId: "proj-003", rating: 5, comment: "Alex is our go-to expert for ML analytics. This is our second project together and he continues to deliver exceptional work.", date: "2026-05-10" },
  { id: "rev-006", expertId: "expert-001", clientId: "client-002", projectId: "proj-013", rating: 5, comment: "Incredible depth of knowledge in NLP. The chatbot handles edge cases we didn't even think of.", date: "2026-02-01" },

  { id: "rev-007", expertId: "expert-001", clientId: "client-001", projectId: "proj-003", rating: 5, comment: "Priya's automation expertise saved us 200+ hours per month. The agent system is brilliant.", date: "2026-03-20" },
  { id: "rev-008", expertId: "expert-002", clientId: "client-002", projectId: "proj-016", rating: 5, comment: "Delivered a complete AI automation suite. Communication was excellent and she adapted quickly to changes.", date: "2026-04-12" },
  { id: "rev-009", expertId: "expert-002", clientId: "client-002", projectId: "proj-016", rating: 4, comment: "Great work on the automation pipeline. Some documentation gaps but the implementation is solid and performing well in production.", date: "2026-05-01" },
  { id: "rev-010", expertId: "expert-002", clientId: "client-001", projectId: "proj-006", rating: 5, comment: "Priya built an amazing image segmentation tool. The model's accuracy exceeded our expectations. Highly recommend for computer vision projects.", date: "2026-02-15" },
  { id: "rev-011", expertId: "expert-002", clientId: "client-001", projectId: "proj-006", rating: 4, comment: "Solid delivery on the computer vision project. Responsive to feedback and iterative improvements.", date: "2026-04-20" },
  { id: "rev-012", expertId: "expert-002", clientId: "client-002", projectId: "proj-016", rating: 5, comment: "Priya's trading signal agent is now a core part of our platform. The automated retraining pipeline she set up runs flawlessly. Excellent long-term value.", date: "2026-05-25" },
];
