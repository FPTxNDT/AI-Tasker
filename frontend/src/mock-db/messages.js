// MOCK DB ONLY - delete this file/folder when real backend is connected

export const conversations = [
  { id: "conv-001", participants: ["client-001", "expert-001"], projectId: "proj-002", lastMessageAt: "2026-06-01T08:00:00Z" },
  { id: "conv-002", participants: ["client-001", "expert-001"], projectId: "proj-008", lastMessageAt: "2026-05-30T15:00:00Z" },
  { id: "conv-003", participants: ["client-001", "expert-002"], projectId: "proj-005", lastMessageAt: "2026-06-01T09:00:00Z" },
  { id: "conv-004", participants: ["client-001", "expert-002"], projectId: "proj-006", lastMessageAt: "2026-04-25T12:00:00Z" },
  { id: "conv-005", participants: ["client-002", "expert-001"], projectId: "proj-014", lastMessageAt: "2026-06-01T07:30:00Z" },
  { id: "conv-006", participants: ["client-002", "expert-001"], projectId: "proj-013", lastMessageAt: "2026-01-25T14:00:00Z" },
  { id: "conv-007", participants: ["client-002", "expert-002"], projectId: "proj-012", lastMessageAt: "2026-06-01T10:00:00Z" },
  { id: "conv-008", participants: ["client-002", "expert-002"], projectId: "proj-017", lastMessageAt: "2026-05-31T16:00:00Z" },
  { id: "conv-009", participants: ["client-001", "expert-001"], projectId: "proj-001", lastMessageAt: "2026-06-01T09:30:00Z" },
  { id: "conv-010", participants: ["client-002", "expert-002"], projectId: "proj-016", lastMessageAt: "2026-04-20T11:00:00Z" },
  { id: "conv-011", participants: ["client-002", "expert-001"], projectId: "proj-020", lastMessageAt: "2026-01-28T16:00:00Z" },
];

export const messages = [
  // conv-001: client-001 ↔ expert-001 (proj-002, Chest X-Ray)
  { id: "msg-001", conversationId: "conv-001", senderId: "expert-001", receiverId: "client-001", text: "Hi Sarah, I've completed the model architecture for the chest X-ray classifier. Ready for your review.", createdAt: "2026-06-01T08:00:00Z", isRead: false },
  { id: "msg-002", conversationId: "conv-001", senderId: "expert-001", receiverId: "client-001", text: "I achieved 96.5% accuracy on the validation set. The model is performing well across all 14 pathology classes.", createdAt: "2026-05-31T10:00:00Z", isRead: true },
  { id: "msg-003", conversationId: "conv-001", senderId: "client-001", receiverId: "expert-001", text: "That's great news Alex! Can you share the confusion matrix and per-class metrics?", createdAt: "2026-05-31T14:00:00Z", isRead: true },
  { id: "msg-004", conversationId: "conv-001", senderId: "expert-001", receiverId: "client-001", text: "Sure, I'll upload the full evaluation report by end of day. Precision is especially strong on pneumonia detection.", createdAt: "2026-05-31T16:00:00Z", isRead: true },
  { id: "msg-005", conversationId: "conv-001", senderId: "client-001", receiverId: "expert-001", text: "Perfect, looking forward to it. Also - do you think we should add data augmentation for the rarer pathologies?", createdAt: "2026-05-31T17:00:00Z", isRead: true },
  { id: "msg-006", conversationId: "conv-001", senderId: "expert-001", receiverId: "client-001", text: "Good catch. I'll add CutMix and MixUp augmentation for the next training run. Should improve performance on the minority classes.", createdAt: "2026-06-01T07:00:00Z", isRead: false },
  { id: "msg-007", conversationId: "conv-001", senderId: "expert-001", receiverId: "client-001", text: "Also, I've been thinking about the deployment strategy. I'd recommend a SageMaker endpoint with auto-scaling for cost efficiency.", createdAt: "2026-06-01T07:30:00Z", isRead: false },
  { id: "msg-008", conversationId: "conv-001", senderId: "client-001", receiverId: "expert-001", text: "That sounds reasonable. Let's discuss in our next sync. Can you prepare a cost estimate?", createdAt: "2026-06-01T09:00:00Z", isRead: false },

  // conv-003: client-001 ↔ expert-002 (proj-005, Clinical Notes NLP)
  { id: "msg-009", conversationId: "conv-003", senderId: "expert-002", receiverId: "client-001", text: "Sarah, the NLP data pipeline is complete. We're now processing 50K+ clinical notes daily with <1% error rate.", createdAt: "2026-06-01T09:00:00Z", isRead: false },
  { id: "msg-010", conversationId: "conv-003", senderId: "client-001", receiverId: "expert-002", text: "Excellent Priya! How is the named entity recognition performing on medication extraction?", createdAt: "2026-06-01T09:15:00Z", isRead: false },
  { id: "msg-011", conversationId: "conv-003", senderId: "expert-002", receiverId: "client-001", text: "NER F1 score is 0.94 on medications. Diagnoses extraction is at 0.91. Working on improving procedure recognition now.", createdAt: "2026-06-01T09:30:00Z", isRead: false },
  { id: "msg-012", conversationId: "conv-003", senderId: "expert-002", receiverId: "client-001", text: "I've also added RxNorm and SNOMED CT normalization to the pipeline.", createdAt: "2026-05-29T10:00:00Z", isRead: true },
  { id: "msg-013", conversationId: "conv-003", senderId: "client-001", receiverId: "expert-002", text: "Great, those ontologies are critical for our EHR integration. When can I see a demo?", createdAt: "2026-05-29T12:00:00Z", isRead: true },
  { id: "msg-014", conversationId: "conv-003", senderId: "expert-002", receiverId: "client-001", text: "I can demo the full pipeline on Friday. I'll prepare a sample of 100 notes showing extraction across all entity types.", createdAt: "2026-05-29T14:00:00Z", isRead: true },
  { id: "msg-015", conversationId: "conv-003", senderId: "client-001", receiverId: "expert-002", text: "Friday works. Please include some edge cases - handwritten note transcripts and non-standard abbreviations.", createdAt: "2026-05-30T08:00:00Z", isRead: true },
  { id: "msg-016", conversationId: "conv-003", senderId: "expert-002", receiverId: "client-001", text: "Will do! I have some challenging samples from our test set that I can include.", createdAt: "2026-05-30T09:00:00Z", isRead: true },

  // conv-005: client-002 ↔ expert-001 (proj-014, Check Fraud Detection)
  { id: "msg-017", conversationId: "conv-005", senderId: "client-002", receiverId: "expert-001", text: "Alex, how's the check fraud model training going? We have a board presentation next week.", createdAt: "2026-06-01T07:00:00Z", isRead: false },
  { id: "msg-018", conversationId: "conv-005", senderId: "expert-001", receiverId: "client-002", text: "Training is on track David. Current precision is 94% with 92% recall. I'm tuning the threshold for optimal F1.", createdAt: "2026-06-01T07:30:00Z", isRead: false },
  { id: "msg-019", conversationId: "conv-005", senderId: "client-002", receiverId: "expert-001", text: "Those are solid numbers. Can you prepare a one-pager with performance metrics and a demo flow for the board?", createdAt: "2026-05-30T15:00:00Z", isRead: true },
  { id: "msg-020", conversationId: "conv-005", senderId: "expert-001", receiverId: "client-002", text: "Absolutely. I'll include the ROC curve, confusion matrix, and sample outputs. When is the presentation?", createdAt: "2026-05-30T16:00:00Z", isRead: true },
  { id: "msg-021", conversationId: "conv-005", senderId: "client-002", receiverId: "expert-001", text: "Next Thursday. If you can have materials ready by Tuesday EOD, that gives us time to review together.", createdAt: "2026-05-30T17:00:00Z", isRead: true },
  { id: "msg-022", conversationId: "conv-005", senderId: "expert-001", receiverId: "client-002", text: "You'll have it by Monday evening. I'll also include a quick video demo of the system in action.", createdAt: "2026-05-31T08:00:00Z", isRead: true },
  { id: "msg-023", conversationId: "conv-005", senderId: "client-002", receiverId: "expert-001", text: "Perfect. The video demo will really help. Our CEO is very visual.", createdAt: "2026-05-31T09:00:00Z", isRead: true },
  { id: "msg-024", conversationId: "conv-005", senderId: "expert-001", receiverId: "client-002", text: "Noted! I'll make it clear and concise - no more than 3 minutes showing the key features.", createdAt: "2026-05-31T10:00:00Z", isRead: true },

  // conv-007: client-002 ↔ expert-002 (proj-012, KYC Verification)
  { id: "msg-025", conversationId: "conv-007", senderId: "expert-002", receiverId: "client-002", text: "David, quick update - the OCR pipeline now handles 20+ document types with 98% accuracy. Passports and driver's licenses are near perfect.", createdAt: "2026-06-01T10:00:00Z", isRead: false },
  { id: "msg-026", conversationId: "conv-007", senderId: "client-002", receiverId: "expert-002", text: "That's impressive Priya. How's the face matching component performing?", createdAt: "2026-06-01T10:15:00Z", isRead: false },
  { id: "msg-027", conversationId: "conv-007", senderId: "expert-002", receiverId: "client-002", text: "Face matching is at 99.2% True Accept Rate with <0.1% False Accept. Well within compliance thresholds.", createdAt: "2026-06-01T10:30:00Z", isRead: false },
  { id: "msg-028", conversationId: "conv-007", senderId: "expert-002", receiverId: "client-002", text: "I'm also adding liveness detection to prevent spoofing attacks. Should be ready by Friday.", createdAt: "2026-05-28T14:00:00Z", isRead: true },
  { id: "msg-029", conversationId: "conv-007", senderId: "client-002", receiverId: "expert-002", text: "Liveness detection would be a great addition. What approach are you using?", createdAt: "2026-05-28T15:00:00Z", isRead: true },
  { id: "msg-030", conversationId: "conv-007", senderId: "expert-002", receiverId: "client-002", text: "Using a challenge-response approach - ask the user to blink, smile, or turn their head. Works well against photo/video attacks.", createdAt: "2026-05-29T08:00:00Z", isRead: true },
  { id: "msg-031", conversationId: "conv-007", senderId: "client-002", receiverId: "expert-002", text: "Great approach. Make sure the UX is smooth - we don't want to frustrate legitimate users during onboarding.", createdAt: "2026-05-29T09:00:00Z", isRead: true },
  { id: "msg-032", conversationId: "conv-007", senderId: "expert-002", receiverId: "client-002", text: "Absolutely. I'm optimizing for <5 second verification with clear user guidance at each step.", createdAt: "2026-05-29T10:00:00Z", isRead: true },

  // conv-009: client-001 ↔ expert-001 (proj-001, Medical Chatbot - pre-hire discussion)
  { id: "msg-033", conversationId: "conv-009", senderId: "client-001", receiverId: "expert-001", text: "Hi Alex, thanks for your proposal on the Medical Chatbot. I have a few questions about your approach to HL7 FHIR integration.", createdAt: "2026-06-01T09:30:00Z", isRead: false },
  { id: "msg-034", conversationId: "conv-009", senderId: "expert-001", receiverId: "client-001", text: "Of course Sarah! I've integrated with FHIR R4 in two previous projects. I'd use a middleware layer that maps FHIR resources to our chatbot's internal model.", createdAt: "2026-06-01T09:45:00Z", isRead: false },
  { id: "msg-035", conversationId: "conv-009", senderId: "client-001", receiverId: "expert-001", text: "That sounds solid. How would you handle the triage logic? We need clinically validated decision trees.", createdAt: "2026-06-01T10:00:00Z", isRead: false },
  { id: "msg-036", conversationId: "conv-009", senderId: "expert-001", receiverId: "client-001", text: "I'd implement a hybrid approach - rule-based triage for common presentations with ML fallback for ambiguous cases. The rules would be based on established clinical guidelines.", createdAt: "2026-06-01T10:15:00Z", isRead: false },
  { id: "msg-037", conversationId: "conv-009", senderId: "client-001", receiverId: "expert-001", text: "Good thinking. Can you put together a more detailed technical spec? I'd like to see your proposed architecture before making a decision.", createdAt: "2026-06-01T10:30:00Z", isRead: false },
  { id: "msg-038", conversationId: "conv-009", senderId: "expert-001", receiverId: "client-001", text: "Happy to! I'll have a detailed architecture doc with component diagrams, data flow, and a phased delivery plan by tomorrow.", createdAt: "2026-06-01T10:45:00Z", isRead: false },

  // conv-008: client-002 ↔ expert-002 (proj-017, Financial Doc Q&A)
  { id: "msg-039", conversationId: "conv-008", senderId: "expert-002", receiverId: "client-002", text: "David, the RAG pipeline is built and I'm indexing your 10-K documents now. Should be searchable within a few hours.", createdAt: "2026-05-31T16:00:00Z", isRead: false },
  { id: "msg-040", conversationId: "conv-008", senderId: "client-002", receiverId: "expert-002", text: "Great! How's the citation accuracy? We need exact references for compliance.", createdAt: "2026-05-31T16:30:00Z", isRead: false },
  { id: "msg-041", conversationId: "conv-008", senderId: "expert-002", receiverId: "client-002", text: "Citations are linked back to specific paragraphs in the source documents. I'm using page-level chunking with overlap for context preservation.", createdAt: "2026-05-31T17:00:00Z", isRead: false },
  { id: "msg-042", conversationId: "conv-008", senderId: "client-002", receiverId: "expert-002", text: "Perfect. When can I test it with the Q4 earnings reports?", createdAt: "2026-05-31T17:15:00Z", isRead: false },
  { id: "msg-043", conversationId: "conv-008", senderId: "expert-002", receiverId: "client-002", text: "Should be ready for testing by tomorrow afternoon. I'll send you the test URL once the indexing completes.", createdAt: "2026-05-31T17:30:00Z", isRead: false },
  { id: "msg-044", conversationId: "conv-008", senderId: "client-002", receiverId: "expert-002", text: "Sounds good. Looking forward to trying it out!", createdAt: "2026-05-31T17:45:00Z", isRead: false },

  // conv-002: client-001 ↔ expert-001 (proj-008, Scheduling Agent)
  { id: "msg-045", conversationId: "conv-002", senderId: "expert-001", receiverId: "client-001", text: "Sarah, I've deployed the scheduling agent to staging. You can test it at the URL I sent earlier.", createdAt: "2026-05-30T15:00:00Z", isRead: true },
  { id: "msg-046", conversationId: "conv-002", senderId: "client-001", receiverId: "expert-001", text: "Just tested it - the Google Calendar integration works smoothly. One issue: it's not suggesting alternative slots when the preferred time is taken.", createdAt: "2026-05-30T15:30:00Z", isRead: true },
  { id: "msg-047", conversationId: "conv-002", senderId: "expert-001", receiverId: "client-001", text: "Good catch. I'll add a slot suggestion feature that proposes the next 3 available times. Should be done by EOD tomorrow.", createdAt: "2026-05-30T16:00:00Z", isRead: true },
  { id: "msg-048", conversationId: "conv-002", senderId: "client-001", receiverId: "expert-001", text: "Thanks Alex. Also, the SMS reminders - are they using Twilio? I want to make sure we have the right plan.", createdAt: "2026-05-30T16:15:00Z", isRead: true },
  { id: "msg-049", conversationId: "conv-002", senderId: "expert-001", receiverId: "client-001", text: "Yes, Twilio Programmable SMS. I've set it up with a toll-free number. Cost estimate is ~$0.0075 per reminder.", createdAt: "2026-05-30T16:30:00Z", isRead: true },
  { id: "msg-050", conversationId: "conv-002", senderId: "client-001", receiverId: "expert-001", text: "Reasonable. Let's go with that. One more thing - can we add email reminders as a fallback?", createdAt: "2026-05-30T17:00:00Z", isRead: true },
  { id: "msg-051", conversationId: "conv-002", senderId: "expert-001", receiverId: "client-001", text: "Already planned! I'm using SendGrid for transactional emails. SMS + email dual channel, with fallback logic.", createdAt: "2026-05-30T17:15:00Z", isRead: true },
  { id: "msg-052", conversationId: "conv-002", senderId: "client-001", receiverId: "expert-001", text: "You've thought of everything. Great work as always Alex.", createdAt: "2026-05-30T17:30:00Z", isRead: true },

  // conv-004: client-001 ↔ expert-002 (proj-006, Image Segmentation - completed)
  { id: "msg-053", conversationId: "conv-004", senderId: "client-001", receiverId: "expert-002", text: "Priya, the segmentation tool is performing well in production. Our radiologists are very happy with it.", createdAt: "2026-04-25T10:00:00Z", isRead: true },
  { id: "msg-054", conversationId: "conv-004", senderId: "expert-002", receiverId: "client-001", text: "That's wonderful to hear Sarah! Are there any edge cases they've noticed that we should address in a future update?", createdAt: "2026-04-25T10:30:00Z", isRead: true },
  { id: "msg-055", conversationId: "conv-004", senderId: "client-001", receiverId: "expert-002", text: "One radiologist mentioned that small lesions (<3mm) sometimes get missed. Could be worth investigating.", createdAt: "2026-04-25T11:00:00Z", isRead: true },
  { id: "msg-056", conversationId: "conv-004", senderId: "expert-002", receiverId: "client-001", text: "Good feedback. I can look into a multi-scale approach that would improve detection of small features. Let me know if you'd like to scope that as a follow-up project.", createdAt: "2026-04-25T12:00:00Z", isRead: true },

  // conv-006: client-002 ↔ expert-001 (proj-013, RAG Chatbot - completed)
  { id: "msg-057", conversationId: "conv-006", senderId: "client-002", receiverId: "expert-001", text: "Alex, the RAG chatbot has been live for a month now and metrics are great. 40% reduction in support tickets.", createdAt: "2026-01-25T10:00:00Z", isRead: true },
  { id: "msg-058", conversationId: "conv-006", senderId: "expert-001", receiverId: "client-002", text: "Fantastic! How's the user satisfaction looking?", createdAt: "2026-01-25T10:30:00Z", isRead: true },
  { id: "msg-059", conversationId: "conv-006", senderId: "client-002", receiverId: "expert-001", text: "4.2/5 average rating. Users especially love the citation feature. Would you be interested in a phase 2 with multi-language support?", createdAt: "2026-01-25T11:00:00Z", isRead: true },
  { id: "msg-060", conversationId: "conv-006", senderId: "expert-001", receiverId: "client-002", text: "Definitely! I have experience with multilingual RAG systems. Let me know when you're ready to scope it.", createdAt: "2026-01-25T14:00:00Z", isRead: true },

  // conv-010: client-002 ↔ expert-002 (proj-016, Trading Signal Agent - completed)
  { id: "msg-061", conversationId: "conv-010", senderId: "client-002", receiverId: "expert-002", text: "Priya, the trading signal agent has been running for 2 weeks and the signals are showing 68% win rate. Great job!", createdAt: "2026-04-20T09:00:00Z", isRead: true },
  { id: "msg-062", conversationId: "conv-010", senderId: "expert-002", receiverId: "client-002", text: "Thank you David! I'm monitoring the performance daily. We might want to retrain the sentiment model monthly as news patterns shift.", createdAt: "2026-04-20T09:30:00Z", isRead: true },
  { id: "msg-063", conversationId: "conv-010", senderId: "client-002", receiverId: "expert-002", text: "Good suggestion. Let's set up a monthly retraining schedule. Can you automate that?", createdAt: "2026-04-20T10:00:00Z", isRead: true },
  { id: "msg-064", conversationId: "conv-010", senderId: "expert-002", receiverId: "client-002", text: "Yes, I can set up an Airflow DAG for automated monthly retraining with performance validation gates.", createdAt: "2026-04-20T10:30:00Z", isRead: true },
  { id: "msg-065", conversationId: "conv-010", senderId: "client-002", receiverId: "expert-002", text: "Perfect. Let's scope that as a small follow-up. I'll send over a brief for approval.", createdAt: "2026-04-20T11:00:00Z", isRead: true },

  // Additional messages for coverage
  { id: "msg-066", conversationId: "conv-001", senderId: "client-001", receiverId: "expert-001", text: "One more thing - can we schedule a quick call this week to discuss the deployment timeline?", createdAt: "2026-05-28T08:00:00Z", isRead: true },
  { id: "msg-067", conversationId: "conv-001", senderId: "expert-001", receiverId: "client-001", text: "How about Thursday at 2pm? I'll send a calendar invite.", createdAt: "2026-05-28T09:00:00Z", isRead: true },
  { id: "msg-068", conversationId: "conv-003", senderId: "expert-002", receiverId: "client-001", text: "Quick question - should the pipeline use ICD-10 or ICD-11 codes for diagnosis normalization?", createdAt: "2026-05-28T08:00:00Z", isRead: true },
  { id: "msg-069", conversationId: "conv-003", senderId: "client-001", receiverId: "expert-002", text: "ICD-10 for now. We'll plan ICD-11 migration for Q4.", createdAt: "2026-05-28T09:00:00Z", isRead: true },
  { id: "msg-070", conversationId: "conv-005", senderId: "expert-001", receiverId: "client-002", text: "Quick update - I've added synthetic check generation for rare fraud patterns. Should improve our recall significantly.", createdAt: "2026-05-28T10:00:00Z", isRead: true },
  { id: "msg-071", conversationId: "conv-005", senderId: "client-002", receiverId: "expert-001", text: "Great initiative. Just make sure the synthetic data doesn't leak into the test set.", createdAt: "2026-05-28T11:00:00Z", isRead: true },
  { id: "msg-072", conversationId: "conv-007", senderId: "client-002", receiverId: "expert-002", text: "Priya, our compliance team reviewed the KYC flow and gave the green light. Great work!", createdAt: "2026-05-27T08:00:00Z", isRead: true },
  { id: "msg-073", conversationId: "conv-007", senderId: "expert-002", receiverId: "client-002", text: "Excellent news! I was careful to follow all the regulatory requirements. Happy to walk them through the details if needed.", createdAt: "2026-05-27T09:00:00Z", isRead: true },
  { id: "msg-074", conversationId: "conv-009", senderId: "client-001", receiverId: "expert-001", text: "One more question - what's your estimated timeline for a working MVP?", createdAt: "2026-05-31T10:00:00Z", isRead: true },
  { id: "msg-075", conversationId: "conv-009", senderId: "expert-001", receiverId: "client-001", text: "I can have a functional MVP with basic triage for the top 20 conditions within 4 weeks. Full scope in 8 weeks.", createdAt: "2026-05-31T11:00:00Z", isRead: true },
  { id: "msg-076", conversationId: "conv-008", senderId: "expert-002", receiverId: "client-002", text: "Testing URL is ready! Check your email. Let me know if you find any issues.", createdAt: "2026-05-30T14:00:00Z", isRead: true },
  { id: "msg-077", conversationId: "conv-008", senderId: "client-002", receiverId: "expert-002", text: "Working great so far! The Q&A on the Q4 earnings report was spot-on. Citations are accurate too.", createdAt: "2026-05-30T15:00:00Z", isRead: true },
  { id: "msg-078", conversationId: "conv-002", senderId: "client-001", receiverId: "expert-001", text: "Alex, just tested the slot suggestion feature - works perfectly. The Twilio integration is solid too.", createdAt: "2026-05-28T09:00:00Z", isRead: true },
  { id: "msg-079", conversationId: "conv-002", senderId: "expert-001", receiverId: "client-001", text: "Thanks for testing! I've also added a weekly summary email that shows appointment stats.", createdAt: "2026-05-28T10:00:00Z", isRead: true },
  { id: "msg-080", conversationId: "conv-006", senderId: "expert-001", receiverId: "client-002", text: "David, circling back on the multi-language RAG idea - I've done some research and Spanish and Mandarin would be the most impactful additions.", createdAt: "2026-01-30T09:00:00Z", isRead: true },

  // conv-011: client-002 ↔ expert-001 (proj-020, Backtesting Platform - completed)
  { id: "msg-081", conversationId: "conv-011", senderId: "expert-001", receiverId: "client-002", text: "David, the backtesting platform is complete. I've run it against 5 years of historical data and it's performing well.", createdAt: "2026-01-28T14:00:00Z", isRead: true },
  { id: "msg-082", conversationId: "conv-011", senderId: "client-002", receiverId: "expert-001", text: "Great work Alex! The walk-forward optimization feature is exactly what we needed. Very happy with the result.", createdAt: "2026-01-28T15:00:00Z", isRead: true },
  { id: "msg-083", conversationId: "conv-011", senderId: "expert-001", receiverId: "client-002", text: "Thanks! Let me know if you'd like me to add any custom indicators in a follow-up engagement.", createdAt: "2026-01-28T16:00:00Z", isRead: true },
];
