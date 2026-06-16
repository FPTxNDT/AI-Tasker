// MOCK DB ONLY - delete this file/folder when real backend is connected

export const proposals = [
  // ==================== EXPERT-001 PROPOSALS ====================
  // proj-001 (open, client-001)
  { id: "prop-001", projectId: "proj-001", expertId: "expert-001", coverLetter: "I have extensive experience building medical chatbots. I previously built a triage system for a telehealth platform handling 100K+ patients. I'm familiar with HL7 FHIR integration and can deliver a HIPAA-compliant solution.", bidAmount: 14500, durationDays: 52, status: "pending", createdAt: "2026-05-03T14:00:00Z" },
  // proj-002 (in_progress, client-001, assigned expert-001)
  { id: "prop-002", projectId: "proj-002", expertId: "expert-001", coverLetter: "I've built multiple medical imaging models including a chest X-ray classifier that achieved 97% accuracy. My background in both PyTorch and DICOM makes me an ideal fit. I can deliver within 10 weeks with weekly progress demos.", bidAmount: 21000, durationDays: 70, status: "accepted", createdAt: "2026-03-17T10:00:00Z" },
  // proj-003 (completed, client-001, assigned expert-001)
  { id: "prop-003", projectId: "proj-003", expertId: "expert-001", coverLetter: "I have significant experience with healthcare ML models. I built a similar readmission prediction system for a hospital network that reduced readmissions by 18%. I can deliver a production-ready model with full documentation.", bidAmount: 17500, durationDays: 65, status: "accepted", createdAt: "2026-01-12T09:00:00Z" },
  // proj-004 (open, client-001)
  { id: "prop-004", projectId: "proj-004", expertId: "expert-001", coverLetter: "I've built several automation agents using LangChain and Python. My experience with OCR and RPA makes this a perfect fit. I can deliver a system that exceeds your 70% reduction target.", bidAmount: 27000, durationDays: 105, status: "pending", createdAt: "2026-05-12T11:00:00Z" },
  // proj-007 (open, client-001)
  { id: "prop-005", projectId: "proj-007", expertId: "expert-001", coverLetter: "I've built numerous analytics dashboards with real-time capabilities. I can deliver a beautiful, responsive dashboard with all the features you need.", bidAmount: 15500, durationDays: 50, status: "pending", createdAt: "2026-05-22T10:00:00Z" },
  // proj-010 (open, client-001)
  { id: "prop-006", projectId: "proj-010", expertId: "expert-001", coverLetter: "Although digital pathology is complex, my computer vision background and experience with medical imaging makes me well-suited. I can leverage transfer learning for strong baseline performance.", bidAmount: 34000, durationDays: 130, status: "pending", createdAt: "2026-05-27T09:00:00Z" },

  // proj-011 (open, client-002)
  { id: "prop-007", projectId: "proj-011", expertId: "expert-001", coverLetter: "I have experience building fraud detection systems using XGBoost and Spark. I can design a system that meets your TPS and false positive requirements.", bidAmount: 29000, durationDays: 78, status: "pending", createdAt: "2026-05-07T08:00:00Z" },
  // proj-013 (completed, client-002, assigned expert-001)
  { id: "prop-008", projectId: "proj-013", expertId: "expert-001", coverLetter: "I specialize in RAG chatbots. I built an enterprise RAG system handling 10K+ documents. I can deliver a production-ready solution with sub-second response times.", bidAmount: 19000, durationDays: 52, status: "accepted", createdAt: "2025-12-03T10:00:00Z" },
  // proj-014 (in_progress, client-002, assigned expert-001)
  { id: "prop-009", projectId: "proj-014", expertId: "expert-001", coverLetter: "My computer vision expertise directly applies here. I've built check fraud detection systems before and can deliver a robust solution using OpenCV and PyTorch.", bidAmount: 17500, durationDays: 52, status: "accepted", createdAt: "2026-04-17T09:00:00Z" },
  // proj-015 (open, client-002)
  { id: "prop-010", projectId: "proj-015", expertId: "expert-001", coverLetter: "I have strong experience with credit risk models and SHAP explainability. I can build a model that is both accurate and fully explainable for regulators.", bidAmount: 21000, durationDays: 63, status: "pending", createdAt: "2026-05-17T10:00:00Z" },
  // proj-019 (open, client-002)
  { id: "prop-011", projectId: "proj-019", expertId: "expert-001", coverLetter: "I have experience with graph neural networks and anomaly detection. This AML project is right in my wheelhouse. I can deliver a robust solution.", bidAmount: 38000, durationDays: 120, status: "pending", createdAt: "2026-05-22T11:00:00Z" },
  // proj-020 (completed, client-002, assigned expert-001)
  { id: "prop-012", projectId: "proj-020", expertId: "expert-001", coverLetter: "I've built backtesting platforms before. I can deliver a high-performance system with all the features you need including custom indicators and walk-forward optimization.", bidAmount: 27000, durationDays: 78, status: "accepted", createdAt: "2025-11-03T09:00:00Z" },

  // ==================== EXPERT-002 PROPOSALS ====================
  // proj-001 (open, client-001)
  { id: "prop-013", projectId: "proj-001", expertId: "expert-002", coverLetter: "I have experience with healthcare NLP systems. I built a clinical decision support chatbot that's currently used by 3 hospitals. Let me bring that expertise to your triage chatbot.", bidAmount: 15000, durationDays: 56, status: "pending", createdAt: "2026-05-02T16:00:00Z" },
  // proj-002 (in_progress, client-001 - expert-002 was declined here)
  { id: "prop-014", projectId: "proj-002", expertId: "expert-002", coverLetter: "I've worked on medical imaging projects including X-ray analysis. While Alex specializes more in this area, I bring strong general ML engineering skills.", bidAmount: 23000, durationDays: 84, status: "declined", createdAt: "2026-03-18T12:00:00Z" },
  // proj-004 (open, client-001)
  { id: "prop-015", projectId: "proj-004", expertId: "expert-002", coverLetter: "AI automation is my specialty! I've built multi-agent systems that saved companies hundreds of hours. My approach would use a crew of specialized agents for each step of the claims process.", bidAmount: 26000, durationDays: 100, status: "pending", createdAt: "2026-05-11T14:00:00Z" },
  // proj-005 (in_progress, client-001, assigned expert-002)
  { id: "prop-016", projectId: "proj-005", expertId: "expert-002", coverLetter: "I have strong NLP pipeline experience using spaCy and Transformers. I can build a production-ready pipeline that handles your volume requirements with ease.", bidAmount: 19500, durationDays: 65, status: "accepted", createdAt: "2026-04-03T08:00:00Z" },
  // proj-006 (completed, client-001, assigned expert-002)
  { id: "prop-017", projectId: "proj-006", expertId: "expert-002", coverLetter: "Medical image segmentation is a challenging but rewarding problem. I have experience with UNet architectures and can deliver high Dice scores on your dataset.", bidAmount: 24000, durationDays: 90, status: "accepted", createdAt: "2026-02-03T10:00:00Z" },
  // proj-007 (open, client-001)
  { id: "prop-018", projectId: "proj-007", expertId: "expert-002", coverLetter: "I've built interactive dashboards using Dash and Plotly. I can create a beautiful, real-time analytics platform for your healthcare metrics.", bidAmount: 16000, durationDays: 56, status: "pending", createdAt: "2026-05-21T12:00:00Z" },
  // proj-008 (in_progress, client-001, assigned expert-001 - expert-002 was withdrawn)
  { id: "prop-019", projectId: "proj-008", expertId: "expert-002", coverLetter: "I've built scheduling agents before. My approach would use a combination of LangChain agents and calendar APIs for a seamless experience.", bidAmount: 12000, durationDays: 42, status: "withdrawn", createdAt: "2026-04-21T09:00:00Z" },
  // proj-010 (open, client-001)
  { id: "prop-020", projectId: "proj-010", expertId: "expert-002", coverLetter: "I have computer vision experience including medical imaging. I can contribute strong ML engineering practices and deliver a reliable classification system.", bidAmount: 35000, durationDays: 140, status: "pending", createdAt: "2026-05-26T11:00:00Z" },

  // proj-011 (open, client-002)
  { id: "prop-021", projectId: "proj-011", expertId: "expert-002", coverLetter: "I've built real-time ML pipelines using Kafka and Spark. While my fraud detection experience is growing, I bring strong engineering practices and reliable delivery.", bidAmount: 28000, durationDays: 80, status: "pending", createdAt: "2026-05-06T08:00:00Z" },
  // proj-012 (in_progress, client-002, assigned expert-002)
  { id: "prop-022", projectId: "proj-012", expertId: "expert-002", coverLetter: "This is exactly my area of expertise! I've built several document verification pipelines using OCR and AI. My approach leverages AWS Textract with custom validation agents.", bidAmount: 24000, durationDays: 65, status: "accepted", createdAt: "2026-04-03T09:00:00Z" },
  // proj-013 (completed, client-002 - expert-002 was declined)
  { id: "prop-023", projectId: "proj-013", expertId: "expert-002", coverLetter: "I have experience with RAG systems and can build a chatbot that accurately answers from your documentation. My approach would use Pinecone for vector search.", bidAmount: 20000, durationDays: 56, status: "declined", createdAt: "2025-12-02T14:00:00Z" },
  // proj-014 (in_progress, client-002 - expert-002 was declined)
  { id: "prop-024", projectId: "proj-014", expertId: "expert-002", coverLetter: "While computer vision is not my primary specialty, I have strong general ML skills and can deliver this project with my experience in fraud detection systems.", bidAmount: 19000, durationDays: 56, status: "declined", createdAt: "2026-04-16T11:00:00Z" },
  // proj-015 (open, client-002)
  { id: "prop-025", projectId: "proj-015", expertId: "expert-002", coverLetter: "I can build an explainable credit risk model using XGBoost with SHAP. My experience with MLflow ensures reproducible and well-documented model development.", bidAmount: 21500, durationDays: 65, status: "pending", createdAt: "2026-05-16T10:00:00Z" },
  // proj-016 (completed, client-002, assigned expert-002)
  { id: "prop-026", projectId: "proj-016", expertId: "expert-002", coverLetter: "AI trading agents are my passion! I've built several automated trading systems. I can deliver a comprehensive solution that meets all your requirements.", bidAmount: 33000, durationDays: 105, status: "accepted", createdAt: "2026-01-17T09:00:00Z" },
  // proj-017 (in_progress, client-002, assigned expert-002)
  { id: "prop-027", projectId: "proj-017", expertId: "expert-002", coverLetter: "I can build a powerful financial document Q&A system. My approach combines LangChain with Pinecone for accurate, cited responses to financial queries.", bidAmount: 14500, durationDays: 38, status: "accepted", createdAt: "2026-05-02T10:00:00Z" },
  // proj-019 (open, client-002)
  { id: "prop-028", projectId: "proj-019", expertId: "expert-002", coverLetter: "I have experience with anomaly detection and can apply graph-based approaches for AML. My background in scalable ML systems ensures production-ready delivery.", bidAmount: 39000, durationDays: 126, status: "pending", createdAt: "2026-05-21T10:00:00Z" },
  // proj-020 (completed, client-002 - expert-002 was declined)
  { id: "prop-029", projectId: "proj-020", expertId: "expert-002", coverLetter: "I can build a scalable backtesting platform. My experience with time series data and optimization algorithms would be valuable for this project.", bidAmount: 28000, durationDays: 84, status: "declined", createdAt: "2025-11-02T12:00:00Z" },

  // ==================== EXTRA PROPOSALS FOR COVERAGE ====================
  { id: "prop-030", projectId: "proj-004", expertId: "expert-001", coverLetter: "Revision of my earlier proposal with more detail on the agent architecture. I'd use a supervisor-worker pattern with specialized agents for intake, validation, and routing.", bidAmount: 26500, durationDays: 100, status: "pending", createdAt: "2026-05-14T15:00:00Z" },
  { id: "prop-031", projectId: "proj-011", expertId: "expert-001", coverLetter: "Updated proposal with more detail on the streaming architecture. I can deliver a system that meets your 10K TPS requirement with room to grow.", bidAmount: 29500, durationDays: 75, status: "pending", createdAt: "2026-05-08T09:00:00Z" },
  { id: "prop-032", projectId: "proj-015", expertId: "expert-002", coverLetter: "Detailed proposal with SHAP integration plan and compliance documentation approach. I can deliver a fully explainable model within 9 weeks.", bidAmount: 21800, durationDays: 60, status: "pending", createdAt: "2026-05-18T08:00:00Z" },
  { id: "prop-033", projectId: "proj-019", expertId: "expert-001", coverLetter: "Comprehensive AML solution using graph neural networks. I'll build a system that automatically generates SARs and integrates with your existing compliance workflow.", bidAmount: 38500, durationDays: 118, status: "pending", createdAt: "2026-05-23T09:00:00Z" },
  { id: "prop-034", projectId: "proj-007", expertId: "expert-002", coverLetter: "I'll build a modern analytics dashboard with real-time updates using Dash and Redis. My design will be intuitive for clinical and operational users alike.", bidAmount: 15800, durationDays: 52, status: "pending", createdAt: "2026-05-23T14:00:00Z" },
  { id: "prop-035", projectId: "proj-010", expertId: "expert-001", coverLetter: "Updated proposal with transfer learning approach and validation strategy. I can leverage pretrained models to jumpstart development and iterate quickly.", bidAmount: 33000, durationDays: 125, status: "pending", createdAt: "2026-05-28T10:00:00Z" },
];
