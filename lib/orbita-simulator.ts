import {
  achievements,
  getChallengeById,
  getLessonById,
  getTrackById,
  type ChallengeDefinition,
  type ChallengeRound,
  type ExerciseDefinition,
  type LessonDefinition,
  type LevelId,
  type OrbitaProfile,
  type TrackId,
} from "@/lib/orbita-data";
import {
  getTrackProgressSnapshot,
  type CredentialDefinition,
} from "@/lib/orbita-progression";

type VisualTone = "cyan" | "violet" | "green" | "amber";

export type AcademyConcept = {
  id: string;
  trackId: TrackId;
  levelId: LevelId;
  title: string;
  deck: string;
  simpleExplanation: string;
  intuitiveExplanation: string;
  realExample: string;
  whyItMatters: string;
  visualLegend: string;
  visualNodes: { label: string; detail: string; tone: VisualTone }[];
  commonMistakes: string[];
  recap: string[];
  mentalShortcut: string;
  linkedLessonIds: string[];
  linkedChallengeIds: string[];
  tags: string[];
  masteryTarget: string;
  practicePrompt: string;
};

export type AcademyFriend = {
  id: string;
  displayName: string;
  callsign: string;
  avatarId: string;
  trackId: TrackId;
  levelId: LevelId;
  status: "online" | "queueing" | "away";
  duelRating: number;
  winRate: number;
  streak: number;
  specialty: string;
  signature: string;
  accent: string;
  recentResult: string;
};

export type DuelQuestion = {
  id: string;
  type: "multiple-choice" | "code-completion" | "bug-fix" | "output-prediction";
  prompt: string;
  snippet?: string;
  options?: string[];
  answer: string;
  explanation: string;
  conceptId: string;
  difficulty: LevelId;
  commonMistakes: string[];
  mentalShortcut: string;
};

export type DuelPack = {
  id: string;
  trackId: TrackId;
  title: string;
  description: string;
  timerSeconds: number;
  rewardXp: number;
  questions: DuelQuestion[];
};

export type QuestionInsight = {
  conceptId: string;
  conceptTitle: string;
  conceptPath: string;
  conceptBeingTested: string;
  correctAnswer: string;
  whyCorrect: string;
  whyOthersAreWrong: string[];
  difficultyLabel: string;
  commonMistakes: string[];
  mentalShortcut: string;
  practicePrompt: string;
};

export type AchievementIntel = {
  id: string;
  title: string;
  description: string;
  unlockText: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  accent: string;
  progress: number;
  unlocked: boolean;
  watermark: string;
};

export type DailyObjective = {
  id: string;
  title: string;
  detail: string;
  progress: number;
  reward: string;
};

export type CredentialMeta = {
  trackLabel: string;
  levelLabel: string;
  ladderLabel: string;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildLevelLabel(levelId: LevelId) {
  return levelId.charAt(0).toUpperCase() + levelId.slice(1);
}

export const academyConcepts: AcademyConcept[] = [
  {
    id: "ai-pattern-recognition",
    trackId: "ai",
    levelId: "beginner",
    title: "AI Basics",
    deck: "Pattern recognition before the hype.",
    simpleExplanation:
      "A basic AI system looks at examples, finds patterns, and uses those patterns to make a guess.",
    intuitiveExplanation:
      "Think of AI like a very fast pattern spotter. It does not understand the world like a person; it detects shapes in data and predicts what usually comes next.",
    realExample:
      "A spam filter reads lots of emails, notices which patterns often show up in spam, then uses that pattern memory to label a new message.",
    whyItMatters:
      "Once AI stops feeling magical, you can reason about when it works, when it fails, and which product promises are realistic.",
    visualLegend: "Signal flows from examples to pattern memory to prediction.",
    visualNodes: [
      {
        label: "Examples",
        detail: "Images, text, clicks, or numbers enter the system.",
        tone: "cyan",
      },
      {
        label: "Patterns",
        detail: "The model compresses repeated structure into weights.",
        tone: "violet",
      },
      {
        label: "Prediction",
        detail: "A fresh input triggers the closest learned guess.",
        tone: "green",
      },
    ],
    commonMistakes: [
      "Thinking AI always knows the correct answer.",
      "Confusing a confident prediction with true understanding.",
      "Assuming good performance on training examples means good real-world performance.",
    ],
    recap: [
      "AI starts with data, not intuition.",
      "Patterns are learned from examples.",
      "Predictions are guesses, not certainty.",
    ],
    mentalShortcut: "Examples in, pattern out, guess next.",
    linkedLessonIds: ["ai-beginner-pattern-sense"],
    linkedChallengeIds: ["challenge-ai-beginner-vector-vault"],
    tags: ["AI basics", "Prediction", "Models"],
    masteryTarget: "Explain AI without using magical language.",
    practicePrompt:
      "Describe one everyday app as pattern recognition instead of smartness.",
  },
  {
    id: "ai-machine-learning",
    trackId: "ai",
    levelId: "intermediate",
    title: "Machine Learning",
    deck: "Learning from data instead of hand-writing every rule.",
    simpleExplanation:
      "Machine learning trains a model from examples so the model can predict or classify new cases.",
    intuitiveExplanation:
      "Instead of hard-coding every if/else rule, you show the system many labeled examples and let it discover the rule boundary that best fits them.",
    realExample:
      "A fraud system sees thousands of transactions marked safe or suspicious, then learns which patterns tend to indicate fraud.",
    whyItMatters:
      "Machine learning is the bridge between raw data and useful predictions in products like recommendations, ranking, and classification.",
    visualLegend: "A labeled dataset sharpens the boundary between categories.",
    visualNodes: [
      {
        label: "Features",
        detail: "Clues the system is allowed to use.",
        tone: "cyan",
      },
      {
        label: "Labels",
        detail: "Known answers used during supervised learning.",
        tone: "amber",
      },
      {
        label: "Decision Boundary",
        detail: "The learned rule that separates one group from another.",
        tone: "green",
      },
    ],
    commonMistakes: [
      "Mixing up features and labels.",
      "Thinking more data always beats better data.",
      "Forgetting to test on unseen examples.",
    ],
    recap: [
      "Features are clues.",
      "Labels are target answers.",
      "The model learns a boundary, not a fact list.",
    ],
    mentalShortcut: "Clues plus labels train a boundary.",
    linkedLessonIds: ["ai-intermediate-classifier-clinic"],
    linkedChallengeIds: ["challenge-ai-intermediate-overfit-escape"],
    tags: ["Machine learning", "Supervised learning", "Features"],
    masteryTarget: "Explain how training data shapes a classifier.",
    practicePrompt:
      "Write three possible features for a model that predicts if a movie review is positive.",
  },
  {
    id: "ai-neural-networks",
    trackId: "ai",
    levelId: "beginner",
    title: "Neural Networks",
    deck: "Stacks of small signal mixers.",
    simpleExplanation:
      "A neural network combines many tiny weighted calculations across layers to turn input into output.",
    intuitiveExplanation:
      "Picture a relay team. Each layer adds a little processing, and the later layers get a richer signal than the early ones had alone.",
    realExample:
      "In image recognition, early layers may notice edges, later layers notice shapes, and final layers identify an object category.",
    whyItMatters:
      "Neural networks power much of modern AI, from image systems to language models.",
    visualLegend: "Each layer transforms raw signal into a more useful internal feature.",
    visualNodes: [
      {
        label: "Input Layer",
        detail: "Receives the raw numbers.",
        tone: "cyan",
      },
      {
        label: "Hidden Layers",
        detail: "Mix and reweight signals into stronger features.",
        tone: "violet",
      },
      {
        label: "Output Layer",
        detail: "Turns the final pattern into a prediction.",
        tone: "green",
      },
    ],
    commonMistakes: [
      "Treating neurons like tiny human brains.",
      "Assuming more layers always means a better model.",
      "Ignoring how much data and compute deeper systems need.",
    ],
    recap: [
      "Neurons mix weighted inputs.",
      "Layers compound useful features.",
      "The output is still just a prediction.",
    ],
    mentalShortcut: "Mix, stack, predict.",
    linkedLessonIds: ["ai-beginner-neural-garden"],
    linkedChallengeIds: ["challenge-ai-beginner-vector-vault"],
    tags: ["Neural networks", "Layers", "Signals"],
    masteryTarget: "Explain what each layer contributes.",
    practicePrompt:
      "Describe what changes as a signal moves from input layer to output layer.",
  },
  {
    id: "ai-deep-learning",
    trackId: "ai",
    levelId: "advanced",
    title: "Deep Learning",
    deck: "Neural networks with enough depth to learn rich features.",
    simpleExplanation:
      "Deep learning is neural network learning with many layers, letting the model build more complex internal representations.",
    intuitiveExplanation:
      "If a shallow model sees rough shapes, a deep model can climb from pixels or tokens to detailed patterns, relationships, and context.",
    realExample:
      "Speech recognition systems learn from raw audio waves through many layers until they can output text with strong accuracy.",
    whyItMatters:
      "Deep learning underpins modern language models, image generation, speech systems, and much of today's AI product wave.",
    visualLegend: "Depth lets the model build more abstract features as the signal rises.",
    visualNodes: [
      {
        label: "Shallow Features",
        detail: "Edges, tokens, or local fragments.",
        tone: "cyan",
      },
      {
        label: "Mid-level Features",
        detail: "Shapes, phrases, or patterns of patterns.",
        tone: "violet",
      },
      {
        label: "High-level Features",
        detail: "Objects, intent, or semantic structure.",
        tone: "green",
      },
    ],
    commonMistakes: [
      "Calling every neural model deep learning without checking its depth or scope.",
      "Ignoring the larger cost of training and inference.",
      "Assuming depth alone solves poor data quality.",
    ],
    recap: [
      "Deep learning is layered representation learning.",
      "Depth brings power and cost together.",
      "Good data still matters.",
    ],
    mentalShortcut: "More depth, richer features, higher cost.",
    linkedLessonIds: ["ai-beginner-neural-garden", "ai-advanced-architecture-arena"],
    linkedChallengeIds: ["challenge-ai-advanced-tradeoff-gauntlet"],
    tags: ["Deep learning", "Layers", "Representation"],
    masteryTarget: "Explain why depth changes capability and cost.",
    practicePrompt:
      "Name one task where shallow rules struggle but deeper representation learning helps.",
  },
  {
    id: "ai-nlp",
    trackId: "ai",
    levelId: "advanced",
    title: "NLP",
    deck: "Working with language as structured signal.",
    simpleExplanation:
      "Natural language processing turns text or speech into forms a model can analyze, compare, classify, or generate.",
    intuitiveExplanation:
      "A language model does not read like a human; it turns words into tokens and vectors, then predicts useful continuations or labels from those patterns.",
    realExample:
      "Customer support systems classify incoming messages, retrieve related documents, and draft a suggested reply.",
    whyItMatters:
      "Most modern AI products touch language somewhere, whether that is search, chat, summarization, or moderation.",
    visualLegend: "Language becomes tokens, tokens become vectors, vectors drive decisions.",
    visualNodes: [
      {
        label: "Tokenize",
        detail: "Split language into model-friendly units.",
        tone: "cyan",
      },
      {
        label: "Represent",
        detail: "Map those units into internal numeric space.",
        tone: "violet",
      },
      {
        label: "Predict or Classify",
        detail: "Use the representation to answer or label.",
        tone: "green",
      },
    ],
    commonMistakes: [
      "Assuming language models store exact meanings for every phrase.",
      "Treating generated text as proof of factual grounding.",
      "Skipping retrieval or validation in high-stakes workflows.",
    ],
    recap: [
      "Language becomes tokens and vectors.",
      "Prediction is pattern-based, not human understanding.",
      "Grounding matters in real products.",
    ],
    mentalShortcut: "Tokenize, represent, predict.",
    linkedLessonIds: ["ai-intermediate-embedding-explorer", "ai-advanced-architecture-arena"],
    linkedChallengeIds: ["challenge-ai-beginner-vector-vault", "challenge-ai-advanced-tradeoff-gauntlet"],
    tags: ["NLP", "Tokens", "Language models"],
    masteryTarget: "Explain how text becomes model-ready.",
    practicePrompt:
      "Describe one place where retrieval would help an NLP assistant stay accurate.",
  },
  {
    id: "ai-embeddings",
    trackId: "ai",
    levelId: "intermediate",
    title: "Embeddings",
    deck: "Meaning as coordinates.",
    simpleExplanation:
      "Embeddings represent text, images, or other items as vectors so similar meaning lands near similar meaning.",
    intuitiveExplanation:
      "Imagine every sentence placed on a giant meaning map. Similar sentences end up close together, so search and retrieval become geometric problems.",
    realExample:
      "A documentation assistant embeds the user's question and the docs themselves, then finds the closest matches before answering.",
    whyItMatters:
      "Embeddings power semantic search, retrieval-augmented generation, recommendations, clustering, and more.",
    visualLegend: "Distance inside vector space approximates similarity in meaning.",
    visualNodes: [
      {
        label: "Embed",
        detail: "Turn each item into a numeric vector.",
        tone: "cyan",
      },
      {
        label: "Compare",
        detail: "Measure how close vectors are.",
        tone: "violet",
      },
      {
        label: "Retrieve",
        detail: "Use the nearest matches as context.",
        tone: "green",
      },
    ],
    commonMistakes: [
      "Thinking vectors are labels instead of coordinates.",
      "Using embeddings without understanding chunking or retrieval quality.",
      "Assuming near always means correct for the current task.",
    ],
    recap: [
      "Embeddings are coordinates.",
      "Near vectors often mean related meaning.",
      "Retrieval quality depends on the whole pipeline.",
    ],
    mentalShortcut: "Embed, compare, retrieve.",
    linkedLessonIds: ["ai-intermediate-embedding-explorer"],
    linkedChallengeIds: ["challenge-ai-beginner-vector-vault", "challenge-ai-intermediate-overfit-escape"],
    tags: ["Embeddings", "Vectors", "Retrieval"],
    masteryTarget: "Explain why similarity search works.",
    practicePrompt:
      "Describe how a product could use embeddings to find the most relevant help article.",
  },
  {
    id: "ai-classification",
    trackId: "ai",
    levelId: "intermediate",
    title: "Classification",
    deck: "Assigning the right label from learned clues.",
    simpleExplanation:
      "Classification predicts which category an example belongs to.",
    intuitiveExplanation:
      "You are teaching the model how to sort examples into bins by noticing which clues usually point toward each label.",
    realExample:
      "An email tool labels messages as support, billing, or sales based on wording patterns.",
    whyItMatters:
      "Classification shows up everywhere: moderation, spam filtering, fraud detection, triage, sentiment analysis, and routing.",
    visualLegend: "The model maps clues to one of several allowed buckets.",
    visualNodes: [
      {
        label: "Observe Features",
        detail: "Read the input clues.",
        tone: "cyan",
      },
      {
        label: "Score Labels",
        detail: "Estimate how strongly each label fits.",
        tone: "amber",
      },
      {
        label: "Choose Bucket",
        detail: "Return the best matching category.",
        tone: "green",
      },
    ],
    commonMistakes: [
      "Forgetting classification needs a clear label set.",
      "Confusing labels with features.",
      "Using accuracy alone when classes are imbalanced.",
    ],
    recap: [
      "Classification picks from a label set.",
      "Features inform the label score.",
      "Evaluation matters beyond one metric.",
    ],
    mentalShortcut: "Clues in, label out.",
    linkedLessonIds: ["ai-intermediate-classifier-clinic"],
    linkedChallengeIds: ["challenge-ai-intermediate-overfit-escape"],
    tags: ["Classification", "Labels", "Evaluation"],
    masteryTarget: "Explain why features and labels are different jobs.",
    practicePrompt:
      "Pick a product workflow and name its possible classification labels.",
  },
  {
    id: "ai-overfitting",
    trackId: "ai",
    levelId: "intermediate",
    title: "Overfitting",
    deck: "When the model memorizes the homework.",
    simpleExplanation:
      "Overfitting happens when a model does great on training examples but struggles on new data.",
    intuitiveExplanation:
      "The model has memorized too many details of the practice set instead of learning the bigger pattern that transfers.",
    realExample:
      "A classifier gets near-perfect training accuracy but mislabels fresh customer reviews because it latched onto quirks in the training set.",
    whyItMatters:
      "The whole point of a model is to generalize. If it only succeeds on seen data, it fails the real job.",
    visualLegend: "Training score can rise while real-world reliability falls.",
    visualNodes: [
      {
        label: "Training Set",
        detail: "Model learns from known examples.",
        tone: "cyan",
      },
      {
        label: "Validation Set",
        detail: "Fresh examples check if learning transfers.",
        tone: "violet",
      },
      {
        label: "Generalization Gap",
        detail: "The warning sign appears when validation lags badly.",
        tone: "amber",
      },
    ],
    commonMistakes: [
      "Only measuring training accuracy.",
      "Assuming more complexity always helps.",
      "Treating memorization as mastery.",
    ],
    recap: [
      "Training success is not enough.",
      "Validation protects realism.",
      "Generalization is the real goal.",
    ],
    mentalShortcut: "If it only aces practice, it is not ready.",
    linkedLessonIds: ["ai-intermediate-classifier-clinic", "ai-advanced-training-relay"],
    linkedChallengeIds: ["challenge-ai-intermediate-overfit-escape"],
    tags: ["Overfitting", "Validation", "Generalization"],
    masteryTarget: "Spot the difference between memorization and transfer.",
    practicePrompt:
      "Name one sign that your model is memorizing the training set.",
  },
  {
    id: "ai-training-vs-inference",
    trackId: "ai",
    levelId: "advanced",
    title: "Training vs Inference",
    deck: "Change the model in one phase, use it in the other.",
    simpleExplanation:
      "Training updates a model using many examples. Inference uses the trained model to answer a new request.",
    intuitiveExplanation:
      "Training is the expensive bootcamp. Inference is the live mission.",
    realExample:
      "A speech model is trained for weeks on audio data, then later used in milliseconds to transcribe a user's voice note.",
    whyItMatters:
      "A lot of product planning mistakes come from mixing up training cost, serving cost, and where quality improvements actually happen.",
    visualLegend: "Training shapes the model; inference spends the model.",
    visualNodes: [
      {
        label: "Collect + Prepare Data",
        detail: "Build the learning set.",
        tone: "cyan",
      },
      {
        label: "Train",
        detail: "Update the model's parameters.",
        tone: "violet",
      },
      {
        label: "Serve",
        detail: "Run new inputs through the trained model.",
        tone: "green",
      },
    ],
    commonMistakes: [
      "Calling prompt engineering training.",
      "Forgetting inference has cost and latency constraints too.",
      "Assuming a better prompt changes the underlying model weights.",
    ],
    recap: [
      "Training changes weights.",
      "Inference uses weights.",
      "Product decisions depend on knowing which phase you are touching.",
    ],
    mentalShortcut: "Train the brain, infer the answer.",
    linkedLessonIds: ["ai-advanced-training-relay"],
    linkedChallengeIds: [
      "challenge-ai-beginner-vector-vault",
      "challenge-ai-advanced-tradeoff-gauntlet",
    ],
    tags: ["Training", "Inference", "Serving"],
    masteryTarget: "Separate model-building work from model-using work.",
    practicePrompt:
      "Explain whether changing a prompt is training or inference-time control.",
  },
  {
    id: "ai-llm-prompting",
    trackId: "ai",
    levelId: "beginner",
    title: "LLM and Prompt Basics",
    deck: "Good instructions shape better generations.",
    simpleExplanation:
      "A prompt gives a language model the role, goal, context, and output constraints it should use.",
    intuitiveExplanation:
      "You are setting the mission briefing. The clearer the briefing, the less the model has to guess about what good looks like.",
    realExample:
      "Instead of asking Summarize this, you ask Summarize this email in three bullets for a busy product manager and flag any deadlines.",
    whyItMatters:
      "Prompt quality strongly affects usefulness, tone, format, and reliability in LLM-based products.",
    visualLegend: "Role plus context plus constraints shapes the response lane.",
    visualNodes: [
      {
        label: "Role",
        detail: "Tell the model what job it is doing.",
        tone: "cyan",
      },
      {
        label: "Context",
        detail: "Provide the information it should use.",
        tone: "violet",
      },
      {
        label: "Constraints",
        detail: "Specify format, boundaries, or style.",
        tone: "green",
      },
    ],
    commonMistakes: [
      "Leaving the goal vague.",
      "Skipping important context.",
      "Asking for format after the model already guessed the shape.",
    ],
    recap: [
      "Role narrows the task.",
      "Context reduces guessing.",
      "Constraints shape the final output.",
    ],
    mentalShortcut: "Role, goal, context, format.",
    linkedLessonIds: ["ai-beginner-pattern-sense"],
    linkedChallengeIds: ["challenge-ai-beginner-vector-vault"],
    tags: ["LLM", "Prompting", "Instructions"],
    masteryTarget: "Write prompts that reduce ambiguity.",
    practicePrompt:
      "Rewrite a vague prompt so the role, audience, and output format are explicit.",
  },
  {
    id: "python-functions",
    trackId: "python",
    levelId: "intermediate",
    title: "Python Functions",
    deck: "Reusable logic with clear inputs and outputs.",
    simpleExplanation:
      "A function packages behavior behind a name so you can call it without rewriting the same logic each time.",
    intuitiveExplanation:
      "It is like turning a mini workflow into a button you can press whenever you need it.",
    realExample:
      "A data cleaning script uses one function to normalize names and another to validate email addresses.",
    whyItMatters:
      "Functions are how code becomes maintainable, testable, and easier to reason about.",
    visualLegend: "Inputs enter, logic runs, result returns.",
    visualNodes: [
      {
        label: "Parameters",
        detail: "Values the function receives.",
        tone: "cyan",
      },
      {
        label: "Body",
        detail: "The reusable logic itself.",
        tone: "violet",
      },
      {
        label: "Return",
        detail: "The result sent back.",
        tone: "green",
      },
    ],
    commonMistakes: [
      "Mixing input and output responsibilities.",
      "Writing overly long functions.",
      "Hiding side effects inside utility functions.",
    ],
    recap: [
      "Functions package work.",
      "Parameters feed them data.",
      "Returns send useful results back.",
    ],
    mentalShortcut: "Input, logic, return.",
    linkedLessonIds: ["python-intermediate-function-forecast"],
    linkedChallengeIds: ["challenge-python-intermediate-debug-drift"],
    tags: ["Python", "Functions"],
    masteryTarget: "Refactor repeated code into reusable units.",
    practicePrompt:
      "Turn a repeated calculation into a small function with one clear return value.",
  },
  {
    id: "sql-query-flow",
    trackId: "sql",
    levelId: "beginner",
    title: "SQL Query Flow",
    deck: "Read the clause order like a pipeline.",
    simpleExplanation:
      "A SQL query selects data from a table, filters it, and can then sort or summarize it.",
    intuitiveExplanation:
      "You are pulling records through a pipeline: choose source, narrow rows, then shape the final view.",
    realExample:
      "A dashboard query selects order totals from the sales table and filters to only shipped orders this week.",
    whyItMatters:
      "Query order is foundational for data work, analytics, and backend features that depend on clean retrieval.",
    visualLegend: "Source first, then filter, then shape.",
    visualNodes: [
      {
        label: "FROM",
        detail: "Choose the table or source.",
        tone: "cyan",
      },
      {
        label: "WHERE",
        detail: "Keep only the rows that matter.",
        tone: "amber",
      },
      {
        label: "SELECT / ORDER",
        detail: "Choose columns and final arrangement.",
        tone: "green",
      },
    ],
    commonMistakes: [
      "Forgetting the source table.",
      "Mixing clause order.",
      "Confusing row filtering with sorting.",
    ],
    recap: [
      "Start from the source.",
      "Filter rows with WHERE.",
      "Present the result at the end.",
    ],
    mentalShortcut: "Source, filter, shape.",
    linkedLessonIds: ["sql-beginner-select-sprint"],
    linkedChallengeIds: ["challenge-sql-beginner-query-sprint"],
    tags: ["SQL", "Querying"],
    masteryTarget: "Read and write simple queries in clause order.",
    practicePrompt:
      "Describe what changes if you remove a WHERE clause from a query.",
  },
  {
    id: "html-layout-hierarchy",
    trackId: "html-css",
    levelId: "beginner",
    title: "HTML/CSS Layout Hierarchy",
    deck: "Structure tells the story; spacing protects it.",
    simpleExplanation:
      "HTML provides the structure and CSS controls spacing, alignment, and presentation.",
    intuitiveExplanation:
      "Think of HTML as the frame of a building and CSS as how you arrange the rooms, paths, and breathing space inside it.",
    realExample:
      "A landing page uses sections and headings for structure, then flex and gap to keep content aligned and readable.",
    whyItMatters:
      "Good layout is the difference between a usable interface and visual noise.",
    visualLegend: "Structure creates order, spacing preserves clarity.",
    visualNodes: [
      {
        label: "Structure",
        detail: "Sections, headers, lists, and semantic blocks.",
        tone: "cyan",
      },
      {
        label: "Layout",
        detail: "Flex, grid, and alignment patterns.",
        tone: "violet",
      },
      {
        label: "Spacing",
        detail: "Gap, padding, and rhythm that make hierarchy obvious.",
        tone: "green",
      },
    ],
    commonMistakes: [
      "Using divs when semantics would help.",
      "Trying to solve every spacing issue with random margins.",
      "Letting hierarchy collapse on smaller screens.",
    ],
    recap: [
      "HTML shapes the meaning.",
      "CSS shapes the presentation.",
      "Spacing is part of the system, not an afterthought.",
    ],
    mentalShortcut: "Structure first, polish second.",
    linkedLessonIds: ["html-css-beginner-flexbox-flow"],
    linkedChallengeIds: ["challenge-html-css-beginner-layout-league"],
    tags: ["HTML", "CSS", "Layout"],
    masteryTarget: "Separate structure decisions from spacing decisions.",
    practicePrompt:
      "Name one semantic HTML element and one spacing property that usually work together well.",
  },
];

export const academyFriends: AcademyFriend[] = [
  {
    id: "rhea",
    displayName: "Rhea Kade",
    callsign: "RHEA-7",
    avatarId: "echo",
    trackId: "cpp",
    levelId: "advanced",
    status: "online",
    duelRating: 1842,
    winRate: 68,
    streak: 9,
    specialty: "Systems duel specialist",
    signature: "Memory Maze",
    accent: "#7ca4ff",
    recentResult: "Won 2 duels in the last hour",
  },
  {
    id: "taro",
    displayName: "Taro Venn",
    callsign: "TARO-3",
    avatarId: "orbit",
    trackId: "ai",
    levelId: "advanced",
    status: "queueing",
    duelRating: 1778,
    winRate: 62,
    streak: 6,
    specialty: "Latency and architecture tradeoffs",
    signature: "Tradeoff Gauntlet",
    accent: "#7df1cf",
    recentResult: "Queued for AI specialization battles",
  },
  {
    id: "selene",
    displayName: "Selene Mora",
    callsign: "SELENE-2",
    avatarId: "mira",
    trackId: "javascript",
    levelId: "intermediate",
    status: "online",
    duelRating: 1656,
    winRate: 57,
    streak: 4,
    specialty: "Interaction timing and UI polish",
    signature: "Async Pulse",
    accent: "#c67cff",
    recentResult: "Requested a rematch 15 minutes ago",
  },
  {
    id: "isaac",
    displayName: "Isaac Vale",
    callsign: "ISAAC-9",
    avatarId: "nova",
    trackId: "python",
    levelId: "intermediate",
    status: "away",
    duelRating: 1588,
    winRate: 51,
    streak: 2,
    specialty: "Automation and debugging routes",
    signature: "Debug Drift",
    accent: "#65d5ff",
    recentResult: "Away, last duel 3 hours ago",
  },
];

export const duelPacks: DuelPack[] = [
  {
    id: "duel-ai",
    trackId: "ai",
    title: "Neural Arena // AI Foundations",
    description:
      "Fast-response duel pack focused on vectors, generalization, prompting, and model deployment logic.",
    timerSeconds: 90,
    rewardXp: 110,
    questions: [
      {
        id: "duel-ai-1",
        type: "multiple-choice",
        prompt: "Which explanation best matches an embedding?",
        options: [
          "A hard-coded database label",
          "A vector that places meaning into numeric space",
          "A random seed for training",
          "A GPU memory block",
        ],
        answer: "A vector that places meaning into numeric space",
        explanation:
          "Embeddings are useful because they turn meaning into coordinates that can be compared.",
        conceptId: "ai-embeddings",
        difficulty: "intermediate",
        commonMistakes: [
          "Thinking embeddings are category labels instead of vectors.",
          "Ignoring that similarity is approximate, not perfect.",
        ],
        mentalShortcut: "Embeddings are coordinates for meaning.",
      },
      {
        id: "duel-ai-2",
        type: "code-completion",
        prompt: "Complete the anti-overfitting playbook.",
        snippet:
          "1. Hold out validation data\n2. Train on the training set\n3. Evaluate on ___ data",
        answer: "unseen",
        explanation:
          "Generalization is tested on examples the model did not train on.",
        conceptId: "ai-overfitting",
        difficulty: "intermediate",
        commonMistakes: [
          "Reusing the training set as if it were a real evaluation.",
          "Only tracking training accuracy.",
        ],
        mentalShortcut: "If the data is seen, it is not a real test.",
      },
      {
        id: "duel-ai-3",
        type: "bug-fix",
        prompt: "A prompt keeps producing vague answers. Which patch is strongest?",
        snippet:
          "Current prompt: 'Tell me about this report.'\nPatch options:\nA. Add a role, context, and output format.\nB. Remove all detail so the model can improvise.\nC. Ask three questions at once with no structure.\nD. Use more adjectives only.",
        options: [
          "Add a role, context, and output format.",
          "Remove all detail so the model can improvise.",
          "Ask three questions at once with no structure.",
          "Use more adjectives only.",
        ],
        answer: "Add a role, context, and output format.",
        explanation:
          "Better prompt structure narrows the task and reduces ambiguity.",
        conceptId: "ai-llm-prompting",
        difficulty: "beginner",
        commonMistakes: [
          "Treating prompt quality like decoration.",
          "Skipping role or audience information.",
        ],
        mentalShortcut: "Role plus context beats vague intent.",
      },
      {
        id: "duel-ai-4",
        type: "output-prediction",
        prompt: "Which phase actually changes the model's weights?",
        options: ["Training", "Inference", "Caching", "Retrieval"],
        answer: "Training",
        explanation:
          "Inference uses the model; training changes the model.",
        conceptId: "ai-training-vs-inference",
        difficulty: "advanced",
        commonMistakes: [
          "Calling prompt changes training.",
          "Forgetting that serving costs happen during inference, not training.",
        ],
        mentalShortcut: "Training changes; inference uses.",
      },
    ],
  },
  {
    id: "duel-python",
    trackId: "python",
    title: "Automation Pit // Python Circuit",
    description:
      "Four fast questions on variables, functions, control flow, and reliable debugging.",
    timerSeconds: 85,
    rewardXp: 95,
    questions: [
      {
        id: "duel-py-1",
        type: "multiple-choice",
        prompt: "What makes a function worth keeping?",
        options: [
          "It hides logic in the global scope",
          "It packages reusable behavior with clear input and output",
          "It prints every intermediate value forever",
          "It can only be used once",
        ],
        answer: "It packages reusable behavior with clear input and output",
        explanation:
          "Functions help by making code reusable and easier to reason about.",
        conceptId: "python-functions",
        difficulty: "intermediate",
        commonMistakes: [
          "Mixing reuse with hidden side effects.",
          "Creating functions with no clear return contract.",
        ],
        mentalShortcut: "Reusable logic needs a clear interface.",
      },
      {
        id: "duel-py-2",
        type: "code-completion",
        prompt: "Complete the loop condition.",
        snippet: "for value in values:\n    if value > 10:\n        ___('high')",
        answer: "print",
        explanation:
          "The missing name needs to be a callable that outputs the message.",
        conceptId: "python-functions",
        difficulty: "beginner",
        commonMistakes: [
          "Forgetting Python needs a function call, not plain text.",
        ],
        mentalShortcut: "Actions usually need parentheses.",
      },
      {
        id: "duel-py-3",
        type: "bug-fix",
        prompt: "Which patch best fixes a mutable default trap?",
        snippet:
          "def collect(item, bucket=[]):\n    bucket.append(item)\n    return bucket",
        options: [
          "Use bucket=None and create a list inside the function",
          "Delete the append line",
          "Rename bucket to data",
          "Print the bucket before returning",
        ],
        answer: "Use bucket=None and create a list inside the function",
        explanation:
          "Mutable defaults persist across calls, so you usually create them inside the function.",
        conceptId: "python-functions",
        difficulty: "advanced",
        commonMistakes: [
          "Assuming default list values are recreated every call.",
        ],
        mentalShortcut: "Mutable defaults live longer than you think.",
      },
      {
        id: "duel-py-4",
        type: "output-prediction",
        prompt: "What prints?",
        snippet: "count = 2\ncount += 3\nprint(count)",
        options: ["5", "23", "2", "count"],
        answer: "5",
        explanation:
          "`+=` updates the existing value by adding the right-hand side.",
        conceptId: "python-functions",
        difficulty: "beginner",
        commonMistakes: [
          "Reading += as string concatenation everywhere.",
        ],
        mentalShortcut: "Read it as count becomes count plus 3.",
      },
    ],
  },
  {
    id: "duel-js",
    trackId: "javascript",
    title: "Reactive Relay // JavaScript Arena",
    description:
      "Snappy duel pack around arrays, events, async UX, and DOM thinking.",
    timerSeconds: 85,
    rewardXp: 95,
    questions: [
      {
        id: "duel-js-1",
        type: "multiple-choice",
        prompt: "What usually keeps async UX calm during a slow request?",
        options: [
          "Show a loading state",
          "Freeze the whole app",
          "Hide every control without explanation",
          "Pretend the click never happened",
        ],
        answer: "Show a loading state",
        explanation:
          "Users need feedback that the system heard them and is working.",
        conceptId: "html-layout-hierarchy",
        difficulty: "intermediate",
        commonMistakes: ["Ignoring perceived performance."],
        mentalShortcut: "A calm interface acknowledges the click immediately.",
      },
      {
        id: "duel-js-2",
        type: "output-prediction",
        prompt: "What does this log?",
        snippet: "const items = [1, 2, 3];\nconsole.log(items.length);",
        options: ["3", "2", "undefined", "[1,2,3]"],
        answer: "3",
        explanation: "The array contains three elements, so .length is 3.",
        conceptId: "html-layout-hierarchy",
        difficulty: "beginner",
        commonMistakes: [
          "Counting from zero and then forgetting length is count, not last index.",
        ],
        mentalShortcut: "Length is total items, not final position.",
      },
      {
        id: "duel-js-3",
        type: "bug-fix",
        prompt: "A click handler runs too early. Which patch is right?",
        snippet: "button.addEventListener('click', saveData())",
        options: [
          "Pass saveData without calling it",
          "Wrap it in JSON.stringify",
          "Rename click to press",
          "Move it outside the file",
        ],
        answer: "Pass saveData without calling it",
        explanation:
          "Event listeners need a function reference, not the result of calling the function immediately.",
        conceptId: "html-layout-hierarchy",
        difficulty: "intermediate",
        commonMistakes: ["Calling a handler instead of passing it."],
        mentalShortcut: "Listeners want the function, not the function result.",
      },
      {
        id: "duel-js-4",
        type: "code-completion",
        prompt: "Complete the array method.",
        snippet: "const doubled = numbers.___(value => value * 2)",
        answer: "map",
        explanation: "map transforms each item into a new array.",
        conceptId: "html-layout-hierarchy",
        difficulty: "intermediate",
        commonMistakes: ["Using forEach when a new array is needed."],
        mentalShortcut: "Map transforms; forEach just visits.",
      },
    ],
  },
];

const conceptById = new Map(academyConcepts.map((concept) => [concept.id, concept]));

const lessonConceptMap = new Map<string, string>(
  academyConcepts.flatMap((concept) =>
    concept.linkedLessonIds.map((lessonId) => [lessonId, concept.id]),
  ),
);

const challengeConceptMap = new Map<string, string>(
  academyConcepts.flatMap((concept) =>
    concept.linkedChallengeIds.map((challengeId) => [challengeId, concept.id]),
  ),
);

const achievementTierMap: Record<
  string,
  { tier: AchievementIntel["tier"]; accent: string; watermark: string }
> = {
  "first-liftoff": {
    tier: "Bronze",
    accent: "#b97a4b",
    watermark: "INITIATION",
  },
  "combo-keeper": {
    tier: "Bronze",
    accent: "#78d0ff",
    watermark: "CHAIN",
  },
  "constellation-runner": {
    tier: "Silver",
    accent: "#c3d2ff",
    watermark: "ROUTE",
  },
  "ai-cartographer": {
    tier: "Gold",
    accent: "#7df1cf",
    watermark: "AI",
  },
  "seven-day-spark": {
    tier: "Gold",
    accent: "#9f8cff",
    watermark: "STREAK",
  },
  "boss-mode": {
    tier: "Platinum",
    accent: "#7ae7ff",
    watermark: "DUEL",
  },
};

const credentialMetaMap: Record<string, CredentialMeta> = {
  "python-variables-micro": {
    trackLabel: "Python",
    levelLabel: "Beginner",
    ladderLabel: "Micro Badge",
  },
  "cpp-basics-micro": {
    trackLabel: "C++",
    levelLabel: "Beginner",
    ladderLabel: "Micro Badge",
  },
  "sql-queries-micro": {
    trackLabel: "SQL",
    levelLabel: "Beginner",
    ladderLabel: "Micro Badge",
  },
  "neural-network-basics-micro": {
    trackLabel: "AI",
    levelLabel: "Beginner",
    ladderLabel: "Micro Badge",
  },
  "frontend-flex-micro": {
    trackLabel: "HTML/CSS",
    levelLabel: "Beginner",
    ladderLabel: "Micro Badge",
  },
  "python-beginner-certificate": {
    trackLabel: "Python",
    levelLabel: "Beginner",
    ladderLabel: "Track Certificate",
  },
  "javascript-intermediate-certificate": {
    trackLabel: "JavaScript",
    levelLabel: "Intermediate",
    ladderLabel: "Track Certificate",
  },
  "ai-foundations-certificate": {
    trackLabel: "AI",
    levelLabel: "Beginner",
    ladderLabel: "Track Certificate",
  },
  "mastery-bronze": {
    trackLabel: "Cross-track",
    levelLabel: "Bronze",
    ladderLabel: "Mastery Tier",
  },
  "mastery-silver": {
    trackLabel: "Cross-track",
    levelLabel: "Silver",
    ladderLabel: "Mastery Tier",
  },
  "mastery-gold": {
    trackLabel: "Cross-track",
    levelLabel: "Gold",
    ladderLabel: "Mastery Tier",
  },
  "mastery-platinum": {
    trackLabel: "Cross-track",
    levelLabel: "Platinum",
    ladderLabel: "Mastery Tier",
  },
  "prompt-engineering-practitioner": {
    trackLabel: "AI",
    levelLabel: "Beginner",
    ladderLabel: "Specialization",
  },
  "vector-sense-specialization": {
    trackLabel: "AI",
    levelLabel: "Intermediate",
    ladderLabel: "Specialization",
  },
  "frontend-fundamentals-specialization": {
    trackLabel: "Frontend",
    levelLabel: "Beginner",
    ladderLabel: "Skill Badge",
  },
  "ai-architect-elite": {
    trackLabel: "AI",
    levelLabel: "Advanced",
    ladderLabel: "Capstone Credential",
  },
  "systems-gauntlet-elite": {
    trackLabel: "Cross-track",
    levelLabel: "Advanced",
    ladderLabel: "Capstone Credential",
  },
};

function getExerciseCorrectAnswer(exercise: ExerciseDefinition) {
  if (exercise.type === "multiple-choice" || exercise.type === "output") {
    return exercise.answer;
  }

  if (exercise.type === "fill-blank") {
    return exercise.answer;
  }

  if (exercise.type === "reorder") {
    return exercise.answer.join(" -> ");
  }

  if (exercise.type === "match") {
    return exercise.pairs
      .map((pair) => `${pair.left} -> ${pair.right}`)
      .join(", ");
  }

  return "";
}

function buildDifficultyLabel(levelId: LevelId, mode: string) {
  const base = buildLevelLabel(levelId);

  if (mode === "output" || mode === "bug-fix" || mode === "sequence") {
    return `${base} tactical`;
  }

  if (mode === "match" || mode === "sort") {
    return `${base} pattern drill`;
  }

  return `${base} concept check`;
}

function deriveWrongReasons(
  options: string[] | undefined,
  answer: string,
  conceptTitle: string,
) {
  if (!options?.length) {
    return [
      `Any other response would break the logic of ${conceptTitle.toLowerCase()} or the required syntax path.`,
    ];
  }

  return options
    .filter((option) => option !== answer)
    .slice(0, 3)
    .map(
      (option) =>
        `${option}: tempting because it sounds adjacent, but it does not match the exact rule this question is testing about ${conceptTitle.toLowerCase()}.`,
    );
}

export function getPlayerLevel(xp: number) {
  return Math.floor(xp / 140) + 1;
}

export function getXpToNextLevel(xp: number) {
  const currentLevel = getPlayerLevel(xp);
  const currentFloor = (currentLevel - 1) * 140;
  const nextFloor = currentLevel * 140;

  return {
    currentLevel,
    currentInLevel: xp - currentFloor,
    required: nextFloor - currentFloor,
    progress: clamp(((xp - currentFloor) / (nextFloor - currentFloor)) * 100),
  };
}

export function getConceptById(conceptId: string) {
  return conceptById.get(conceptId);
}

export function getConceptsForTrack(trackId: TrackId) {
  return academyConcepts.filter((concept) => concept.trackId === trackId);
}

export function getConceptsForLevel(levelId: LevelId) {
  return academyConcepts.filter((concept) => concept.levelId === levelId);
}

export function getPrimaryConceptForLesson(lessonId: string) {
  const conceptId = lessonConceptMap.get(lessonId);

  return conceptId ? getConceptById(conceptId) : undefined;
}

export function getPrimaryConceptForChallenge(challengeId: string) {
  const conceptId = challengeConceptMap.get(challengeId);

  return conceptId ? getConceptById(conceptId) : undefined;
}

export function getConceptMastery(profile: OrbitaProfile, concept: AcademyConcept) {
  const completedLessons = concept.linkedLessonIds.filter((lessonId) =>
    profile.completedLessonIds.includes(lessonId),
  );
  const completedChallenges = concept.linkedChallengeIds.filter((challengeId) =>
    profile.completedChallengeIds.includes(challengeId),
  );
  const lessonAccuracy = average(
    completedLessons.map((lessonId) => profile.lessonPerformance[lessonId] ?? 0),
  );
  const challengeAccuracy = average(
    completedChallenges.map(
      (challengeId) => profile.challengePerformance[challengeId] ?? 0,
    ),
  );
  const progress = clamp(
    (completedLessons.length / Math.max(1, concept.linkedLessonIds.length)) * 55 +
      (completedChallenges.length / Math.max(1, concept.linkedChallengeIds.length)) *
        25 +
      (lessonAccuracy * 0.12 + challengeAccuracy * 0.08),
  );

  const status =
    progress >= 88
      ? "Mastered"
      : progress >= 60
        ? "Operational"
        : progress >= 28
          ? "In training"
          : "Untrained";

  return {
    progress,
    status,
    lessonAccuracy,
    challengeAccuracy,
    completedLessons: completedLessons.length,
    completedChallenges: completedChallenges.length,
  };
}

export function buildExerciseInsight(
  lesson: LessonDefinition,
  exercise: ExerciseDefinition,
): QuestionInsight {
  const concept =
    getPrimaryConceptForLesson(lesson.id) ??
    academyConcepts.find((item) => item.trackId === lesson.trackId) ??
    academyConcepts[0];

  return {
    conceptId: concept.id,
    conceptTitle: concept.title,
    conceptPath: `/concepts/${concept.id}`,
    conceptBeingTested: concept.deck,
    correctAnswer: getExerciseCorrectAnswer(exercise),
    whyCorrect: exercise.feedback,
    whyOthersAreWrong:
      exercise.type === "multiple-choice" || exercise.type === "output"
        ? deriveWrongReasons(exercise.options, exercise.answer, concept.title)
        : [
            `Alternative responses would break the logic path of ${concept.title.toLowerCase()} or the expected exercise structure.`,
          ],
    difficultyLabel: buildDifficultyLabel(lesson.levelId, exercise.type),
    commonMistakes: concept.commonMistakes,
    mentalShortcut: concept.mentalShortcut,
    practicePrompt: concept.practicePrompt,
  };
}

export function buildChallengeInsight(
  challenge: ChallengeDefinition,
  round: ChallengeRound,
): QuestionInsight {
  const concept =
    getPrimaryConceptForChallenge(challenge.id) ??
    academyConcepts.find((item) => item.trackId === challenge.trackId) ??
    academyConcepts[0];

  const correctAnswer =
    round.type === "rapid"
      ? round.answer
      : round.type === "sequence"
        ? round.answer.join(" -> ")
        : round.cards.map((card) => `${card.label} -> ${card.answer}`).join(", ");

  const wrongOptions =
    round.type === "rapid"
      ? deriveWrongReasons(round.options, round.answer, concept.title)
      : [
          `A different ordering or bucket assignment would break the logic of ${concept.title.toLowerCase()}.`,
        ];

  return {
    conceptId: concept.id,
    conceptTitle: concept.title,
    conceptPath: `/concepts/${concept.id}`,
    conceptBeingTested: concept.deck,
    correctAnswer,
    whyCorrect: round.feedback,
    whyOthersAreWrong: wrongOptions,
    difficultyLabel: buildDifficultyLabel(challenge.levelId, round.type),
    commonMistakes: concept.commonMistakes,
    mentalShortcut: concept.mentalShortcut,
    practicePrompt: concept.practicePrompt,
  };
}

export function getAchievementIntel(profile: OrbitaProfile): AchievementIntel[] {
  return achievements.map((achievement) => {
    let progress = 0;

    switch (achievement.id) {
      case "first-liftoff":
        progress = clamp(profile.completedLessonIds.length * 100);
        break;
      case "combo-keeper":
        progress = clamp(profile.completedChallengeIds.length * 100);
        break;
      case "constellation-runner":
        progress = clamp((profile.completedLessonIds.length / 5) * 100);
        break;
      case "ai-cartographer":
        progress = clamp(
          (profile.completedLessonIds.filter((lessonId) => lessonId.startsWith("ai-"))
            .length /
            2) *
            100,
        );
        break;
      case "seven-day-spark":
        progress = clamp((profile.streak / 7) * 100);
        break;
      case "boss-mode":
        progress = clamp((profile.completedChallengeIds.length / 3) * 100);
        break;
      default:
        progress = 0;
        break;
    }

    const tierData = achievementTierMap[achievement.id];

    return {
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      unlockText: achievement.unlockText,
      tier: tierData.tier,
      accent: tierData.accent,
      progress,
      unlocked: progress >= 100,
      watermark: tierData.watermark,
    };
  });
}

export function getDailyObjectives(profile: OrbitaProfile): DailyObjective[] {
  const track = getTrackById(profile.trackId);
  const level = buildLevelLabel(profile.levelId);
  const trackSnapshot = getTrackProgressSnapshot(profile, profile.trackId, profile.levelId);

  return [
    {
      id: "daily-lesson",
      title: "Clear one simulator lesson",
      detail: `${track.name} ${level} route is currently ${Math.round(
        trackSnapshot.lessonCompletionRate,
      )}% complete.`,
      progress: Math.min(profile.completedLessonIds.length * 18, 100),
      reward: "+35 XP",
    },
    {
      id: "daily-accuracy",
      title: "Keep answer accuracy above 78%",
      detail: "Stability matters more than speed for certificate ladders.",
      progress: Math.min(
        average(Object.values(profile.lessonPerformance)) || 0,
        100,
      ),
      reward: "Accuracy boost",
    },
    {
      id: "daily-duel",
      title: "Open one skill duel",
      detail: "Challenge a friend to pressure-test the same question set.",
      progress: clamp((profile.completedChallengeIds.length / 2) * 100),
      reward: "+1 streak shield",
    },
  ];
}

export function getDuelPack(trackId: TrackId) {
  return (
    duelPacks.find((pack) => pack.trackId === trackId) ??
    duelPacks.find((pack) => pack.trackId === "ai") ??
    duelPacks[0]
  );
}

export function getFriendById(friendId: string) {
  return academyFriends.find((friend) => friend.id === friendId) ?? academyFriends[0];
}

export function getCredentialMeta(definition: CredentialDefinition): CredentialMeta {
  return (
    credentialMetaMap[definition.id] ?? {
      trackLabel: "Cross-track",
      levelLabel: "Adaptive",
      ladderLabel: definition.kind.replace("-", " "),
    }
  );
}

export function getFeaturedTrackConcepts(profile: OrbitaProfile) {
  return getConceptsForTrack(profile.trackId).map((concept) => ({
    concept,
    mastery: getConceptMastery(profile, concept),
  }));
}

export function getRecommendedConceptForLesson(lessonId: string) {
  return (
    getPrimaryConceptForLesson(lessonId) ??
    academyConcepts.find((concept) =>
      concept.linkedLessonIds.some((candidate) => candidate === lessonId),
    )
  );
}

export function getRecommendedConceptForChallenge(challengeId: string) {
  return (
    getPrimaryConceptForChallenge(challengeId) ??
    academyConcepts.find((concept) =>
      concept.linkedChallengeIds.some((candidate) => candidate === challengeId),
    )
  );
}

export function getSimulatorOverview(profile: OrbitaProfile) {
  const track = getTrackById(profile.trackId);
  const trackSnapshot = getTrackProgressSnapshot(profile, profile.trackId, profile.levelId);

  return {
    trackName: track.name,
    lessonPressure: Math.round(trackSnapshot.lessonCompletionRate),
    challengePressure: Math.round(trackSnapshot.challengeCompletionRate),
    accuracyPressure: Math.round(trackSnapshot.accuracyRate),
    academyStanding: getPlayerLevel(profile.xp),
    sectorCount: getConceptsForTrack(profile.trackId).length,
    trackAccent: track.accent,
  };
}

export function getRelatedLessonCards(concept: AcademyConcept) {
  return concept.linkedLessonIds
    .map((lessonId) => getLessonById(lessonId))
    .filter(Boolean) as LessonDefinition[];
}

export function getRelatedChallengeCards(concept: AcademyConcept) {
  return concept.linkedChallengeIds
    .map((challengeId) => getChallengeById(challengeId))
    .filter(Boolean) as ChallengeDefinition[];
}
