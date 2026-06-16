// MOCK DB ONLY - delete this file/folder when real backend is connected

// Submissions: expert deliverables for tasks and mini-tasks.
// Attachments: file URLs / delivery links attached to submissions.

export const submissions = [
  // proj-002 (Chest X-Ray, expert-001, in_progress)
  {
    id: "sub-001", taskId: "timeline-proj-002-task-03", miniTaskId: null,
    projectId: "proj-002", expertId: "expert-001", clientId: "client-001",
    title: "Model Architecture Design — ResNet-50 with custom head",
    description: "Implemented a ResNet-50 backbone with a custom classification head for 14 pathologies. Includes data augmentation pipeline and class weighting for imbalance.",
    type: "file", deliveryUrl: "https://github.com/expert-001/chest-xray-model/archive/v1.0.zip",
    status: "approved", clientFeedback: "Looks great — the architecture doc is thorough. Approved for next phase.",
    createdAt: "2026-05-15T08:00:00Z", reviewedAt: "2026-05-18T10:00:00Z",
  },
  {
    id: "sub-002", taskId: "timeline-proj-002-task-01", miniTaskId: null,
    projectId: "proj-002", expertId: "expert-001", clientId: "client-001",
    title: "Requirements Analysis Document",
    description: "Complete requirements analysis including data sources, annotation guidelines, and acceptance criteria.",
    type: "link", deliveryUrl: "https://docs.google.com/document/d/abc123-requirements",
    status: "approved", clientFeedback: "Clear and comprehensive. Approved.",
    createdAt: "2026-03-25T12:00:00Z", reviewedAt: "2026-03-28T14:00:00Z",
  },

  // proj-005 (Clinical Notes NLP, expert-002, in_progress)
  {
    id: "sub-003", taskId: "timeline-proj-005-task-02", miniTaskId: null,
    projectId: "proj-005", expertId: "expert-002", clientId: "client-001",
    title: "Data Collection & Preparation Pipeline",
    description: "Built ETL pipeline for 50K+ clinical notes. Includes de-identification, tokenization, and entity annotation. Achieves <1% error rate.",
    type: "file", deliveryUrl: "https://github.com/expert-002/nlp-pipeline/releases/v1.0.tar.gz",
    status: "approved", clientFeedback: "Excellent pipeline design. The de-identification module is especially well done.",
    createdAt: "2026-05-10T10:00:00Z", reviewedAt: "2026-05-14T09:00:00Z",
  },
  {
    id: "sub-004", taskId: "timeline-proj-005-task-03", miniTaskId: null,
    projectId: "proj-005", expertId: "expert-002", clientId: "client-001",
    title: "NER Model — Medication & Diagnosis Extraction",
    description: "Fine-tuned biomedical NER model with 0.94 F1 on medications and 0.91 on diagnoses. Integrated RxNorm and SNOMED CT normalization.",
    type: "link", deliveryUrl: "https://huggingface.co/expert-002/clinical-ner-biomed",
    status: "pending_review", clientFeedback: null,
    createdAt: "2026-05-28T14:00:00Z", reviewedAt: null,
  },

  // proj-012 (KYC Verification, expert-002, in_progress)
  {
    id: "sub-005", taskId: "timeline-proj-012-task-03", miniTaskId: null,
    projectId: "proj-012", expertId: "expert-002", clientId: "client-002",
    title: "OCR Pipeline — 20+ Document Types",
    description: "OCR pipeline supporting passports, driver's licenses, utility bills, and 17 other document types. 98% accuracy on passports. Integrated AWS Textract with custom post-processing.",
    type: "file", deliveryUrl: "https://github.com/expert-002/kyc-ocr/releases/v1.1.zip",
    status: "approved", clientFeedback: "Excellent OCR accuracy. Face matching at 99.2% TAR is outstanding.",
    createdAt: "2026-05-18T14:00:00Z", reviewedAt: "2026-05-22T10:00:00Z",
  },
  {
    id: "sub-006", taskId: "timeline-proj-012-task-03", miniTaskId: "timeline-proj-012-task-03-mini-06",
    projectId: "proj-012", expertId: "expert-002", clientId: "client-002",
    title: "Liveness Detection Module",
    description: "Challenge-response liveness detection with blink, smile, and head-turn verification. <5 second verification time with clear UX guidance.",
    type: "link", deliveryUrl: "https://github.com/expert-002/kyc-liveness/releases/v0.9-beta",
    status: "pending_review", clientFeedback: null,
    createdAt: "2026-05-30T08:00:00Z", reviewedAt: null,
  },

  // proj-008 (Appointment Scheduling, expert-001, in_progress)
  {
    id: "sub-007", taskId: "timeline-proj-008-task-05", miniTaskId: null,
    projectId: "proj-008", expertId: "expert-001", clientId: "client-001",
    title: "API Integration — Google Calendar + Twilio SMS",
    description: "Integrated Google Calendar API for slot management and Twilio for SMS reminders. Deployed to staging for testing.",
    type: "file", deliveryUrl: "https://github.com/expert-001/scheduling-agent/releases/v1.2-staging.zip",
    status: "needs_revision", clientFeedback: "Missing alternative slot suggestions when preferred time is taken. Please add within 3 days.",
    createdAt: "2026-05-20T14:00:00Z", reviewedAt: "2026-05-22T10:00:00Z",
  },

  // proj-003 (Patient Readmission, expert-001, completed)
  {
    id: "sub-008", taskId: "timeline-proj-003-task-03", miniTaskId: null,
    projectId: "proj-003", expertId: "expert-001", clientId: "client-001",
    title: "XGBoost Model — 30-Day Readmission Prediction",
    description: "Trained XGBoost model with SHAP explainability. Achieves 0.87 AUC on test set. Includes feature importance analysis and fairness evaluation.",
    type: "file", deliveryUrl: "https://github.com/expert-001/readmission-model/releases/v1.0.zip",
    status: "approved", clientFeedback: "Excellent model performance. The SHAP analysis was very helpful for our clinical team.",
    createdAt: "2026-02-10T09:00:00Z", reviewedAt: "2026-02-12T14:00:00Z",
  },

  // proj-006 (Medical Image Segmentation, expert-002, completed)
  {
    id: "sub-009", taskId: "timeline-proj-006-task-03", miniTaskId: null,
    projectId: "proj-006", expertId: "expert-002", clientId: "client-001",
    title: "UNet Segmentation Model — Dice 0.92",
    description: "Implemented UNet with ResNet encoder. Achieved 0.92 Dice score on test set. Deployed as Docker container with REST API.",
    type: "file", deliveryUrl: "https://github.com/expert-002/med-seg/releases/v2.0.zip",
    status: "approved", clientFeedback: "Outstanding results. The Docker deployment made integration seamless.",
    createdAt: "2026-03-20T11:00:00Z", reviewedAt: "2026-03-25T09:00:00Z",
  },

  // proj-013 (RAG Chatbot, expert-001, completed)
  {
    id: "sub-010", taskId: "timeline-proj-013-task-04", miniTaskId: null,
    projectId: "proj-013", expertId: "expert-001", clientId: "client-002",
    title: "RAG Chatbot — Pinecone + LangChain",
    description: "Deployed RAG chatbot with Pinecone vector store, LangChain orchestration, and citation system. Handles 5K+ concurrent users with sub-second response.",
    type: "link", deliveryUrl: "https://chatbot.client-002.com/internal-rag",
    status: "approved", clientFeedback: "Flawless implementation. 40% reduction in support tickets in first month.",
    createdAt: "2026-01-20T10:00:00Z", reviewedAt: "2026-01-25T14:00:00Z",
  },

  // proj-016 (Trading Signal Agent, expert-002, completed)
  {
    id: "sub-011", taskId: "timeline-proj-016-task-04", miniTaskId: null,
    projectId: "proj-016", expertId: "expert-002", clientId: "client-002",
    title: "Trading Signal Agent — 68% Win Rate",
    description: "Multi-signal agent combining technical indicators, news sentiment, and market data. 68% win rate on backtest. Auto-retraining pipeline with Airflow.",
    type: "file", deliveryUrl: "https://github.com/expert-002/trading-agent/releases/v1.0.zip",
    status: "approved", clientFeedback: "Excellent system. Now a core part of our platform. Great long-term value.",
    createdAt: "2026-04-15T09:00:00Z", reviewedAt: "2026-04-20T11:00:00Z",
  },
];

export const attachments = [
  // Attachments for submission sub-001 (Model Architecture)
  { id: "att-001", submissionId: "sub-001", projectId: "proj-002", taskId: "timeline-proj-002-task-03",
    fileName: "model-architecture-diagram.png", fileUrl: "https://storage.example.com/sub-001/architecture.png",
    fileType: "image/png", fileSize: 245000, uploadedAt: "2026-05-15T08:30:00Z" },
  { id: "att-002", submissionId: "sub-001", projectId: "proj-002", taskId: "timeline-proj-002-task-03",
    fileName: "evaluation-results.csv", fileUrl: "https://storage.example.com/sub-001/eval-results.csv",
    fileType: "text/csv", fileSize: 12000, uploadedAt: "2026-05-15T08:30:00Z" },

  // Attachments for submission sub-003 (Data Pipeline)
  { id: "att-003", submissionId: "sub-003", projectId: "proj-005", taskId: "timeline-proj-005-task-02",
    fileName: "pipeline-architecture.pdf", fileUrl: "https://storage.example.com/sub-003/pipeline.pdf",
    fileType: "application/pdf", fileSize: 1800000, uploadedAt: "2026-05-10T10:30:00Z" },

  // Attachments for submission sub-005 (OCR Pipeline)
  { id: "att-004", submissionId: "sub-005", projectId: "proj-012", taskId: "timeline-proj-012-task-03",
    fileName: "ocr-sample-outputs.pdf", fileUrl: "https://storage.example.com/sub-005/samples.pdf",
    fileType: "application/pdf", fileSize: 3200000, uploadedAt: "2026-05-18T14:30:00Z" },

  // Attachments for submission sub-008 (Readmission Model)
  { id: "att-005", submissionId: "sub-008", projectId: "proj-003", taskId: "timeline-proj-003-task-03",
    fileName: "shap-summary-plot.png", fileUrl: "https://storage.example.com/sub-008/shap-plot.png",
    fileType: "image/png", fileSize: 320000, uploadedAt: "2026-02-10T09:30:00Z" },
  { id: "att-006", submissionId: "sub-008", projectId: "proj-003", taskId: "timeline-proj-003-task-03",
    fileName: "fairness-report.pdf", fileUrl: "https://storage.example.com/sub-008/fairness.pdf",
    fileType: "application/pdf", fileSize: 450000, uploadedAt: "2026-02-10T09:30:00Z" },
];
