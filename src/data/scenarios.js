export const TEST_SCENARIOS = [
  {
    id: 'scenario-a',
    name: 'Scenario A: Complete Info',
    tag: 'Full Grounding',
    badgeClass: 'badge-emerald',
    description: 'Paragraph containing all details (title, date, venue, speaker, and topics).',
    text: `Join us for 'Advanced Transformer Architectures & LLM Fine-Tuning' scheduled on 2026-11-14 at Silicon Hall, Tech Innovation Center, San Francisco. Led by Dr. Sarah Chen, Principal NLP Research Scientist at Stanford. The intensive workshop covers parameter-efficient fine-tuning (PEFT), LoRA adaptation, FlashAttention optimization, and quantization strategies.`,
    expected: {
      title: "Advanced Transformer Architectures & LLM Fine-Tuning",
      date: "2026-11-14",
      venue: "Silicon Hall, Tech Innovation Center, San Francisco",
      speaker: "Dr. Sarah Chen",
      topics: [
        "parameter-efficient fine-tuning (PEFT)",
        "LoRA adaptation",
        "FlashAttention optimization",
        "quantization strategies"
      ]
    }
  },
  {
    id: 'scenario-b',
    name: 'Scenario B: Partial Info',
    tag: 'Null Field Handling',
    badgeClass: 'badge-amber',
    description: 'Paragraph with missing speaker and venue information (must resolve to explicit null).',
    text: `A hands-on session on 'Kubernetes for Machine Learning Workflows' will take place on October 28, 2026. Participants will explore distributed training operators, Kubeflow pipelines, and GPU autoscaling policies.`,
    expected: {
      title: "Kubernetes for Machine Learning Workflows",
      date: "2026-10-28",
      venue: null,
      speaker: null,
      topics: [
        "distributed training operators",
        "Kubeflow pipelines",
        "GPU autoscaling policies"
      ]
    }
  },
  {
    id: 'scenario-c',
    name: 'Scenario C: Irrelevant Case',
    tag: 'Negative Case Guardrail',
    badgeClass: 'badge-rose',
    description: 'Non-workshop text. Zero hallucination policy: all scalar fields default to null, topics to [].',
    text: `The quarterly cafeteria inventory audit was finalized yesterday. All beverage refrigerators in Building 4 have been restocked with sparkling water and oat milk. Please remember to label personal food items kept on shelves.`,
    expected: {
      title: null,
      date: null,
      venue: null,
      speaker: null,
      topics: []
    }
  },
  {
    id: 'scenario-d',
    name: 'Scenario D: Enterprise Seminar',
    tag: 'Complex Multi-Sentence',
    badgeClass: 'badge-purple',
    description: 'Multi-sentence technical seminar with credentials and physical auditorium venue.',
    text: `Next Friday, March 12, 2027, the developer advocacy group is hosting 'Edge AI Deployment with ONNX & TensorRT' in Auditorium B, Building 3, Tokyo Campus. Keynote presenter Alex Rivera will dive deep into model pruning, int8 quantization, latency profiling, and cross-platform compilation.`,
    expected: {
      title: "Edge AI Deployment with ONNX & TensorRT",
      date: "2027-03-12",
      venue: "Auditorium B, Building 3, Tokyo Campus",
      speaker: "Alex Rivera",
      topics: [
        "model pruning",
        "int8 quantization",
        "latency profiling",
        "cross-platform compilation"
      ]
    }
  },
  {
    id: 'scenario-e',
    name: 'Scenario E: Informal Announcement',
    tag: 'Missing Date & Speaker',
    badgeClass: 'badge-cyan',
    description: 'Informal room reservation message with missing speaker and date.',
    text: `Hey team, we reserved Room 402 for 'Graph Neural Networks in Production'. We will walk through DGL graphs, node classification, and link prediction. Bring your laptop.`,
    expected: {
      title: "Graph Neural Networks in Production",
      date: null,
      venue: "Room 402",
      speaker: null,
      topics: [
        "DGL graphs",
        "node classification",
        "link prediction"
      ]
    }
  }
];
