<p align="center">
  <img src="https://img.shields.io/badge/EssayAI-Semantic%20Evaluator-6c63ff?style=for-the-badge&logo=openai&logoColor=white" alt="EssayAI" />
</p>

<h1 align="center">📝 EssayAI — Automated Essay Evaluation Using Multi-Aspect Semantic Understanding</h1>

<p align="center">
  <b>An AI-powered platform that evaluates long-form student essays across multiple dimensions using deep semantic analysis — going far beyond surface-level grammar checks.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/NLP-Transformers-FF6F00?style=flat-square&logo=huggingface" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## 🚨 The Problem

### Current State of Essay Evaluation is Broken

Manual essay grading in educational institutions faces **critical challenges** that affect millions of students and educators worldwide:

| Problem | Impact |
|---------|--------|
| **⏱️ Time-Consuming Manual Grading** | A single teacher spends **10-15 minutes per essay**. With 200+ students, this means **50+ hours** of grading per assignment cycle. |
| **😵 Evaluator Fatigue & Inconsistency** | After grading 30+ essays, evaluator attention drops significantly, leading to **inconsistent scoring** between the first and last essays. |
| **📊 Surface-Level Assessment Tools** | Existing tools (Grammarly, Turnitin) only check **grammar and plagiarism** — they don't understand **meaning, logic, or argument quality**. |
| **🎭 Inability to Detect Sophisticated Cheating** | Students now use **LLMs to paraphrase plagiarized content**, making traditional plagiarism detectors obsolete. AI-generated hallucinated facts go completely undetected. |
| **📉 Lack of Multi-Dimensional Feedback** | Students receive a single grade with vague comments, never understanding **which specific aspect** (coherence, argument strength, originality) needs improvement. |
| **🤖 No Detection of AI-Generated Content** | With the rise of ChatGPT, educators have **no reliable way** to detect AI-written essays, hallucinated references, or biased arguments. |
| **📚 Scalability Crisis** | Universities handling thousands of submissions per semester cannot maintain evaluation quality at scale. |

### Who Suffers?

- **Students** — Receive delayed, inconsistent, and non-actionable feedback
- **Educators** — Burn out from repetitive grading, have no time for actual teaching
- **Institutions** — Cannot guarantee evaluation fairness or academic integrity
- **Employers** — Graduate quality becomes unreliable due to inconsistent assessment

---

## ✅ Our Solution — EssayAI

EssayAI is a **multi-aspect semantic evaluation engine** that doesn't just check grammar — it **understands** the essay like a human expert would, analyzing intent, logical flow, evidence usage, and relevance to the prompt.

### 🔑 Five-Dimensional Scoring

Unlike single-score evaluation, EssayAI breaks down every essay into **5 independent dimensions**, each with a detailed score (0-100) and AI-generated explanation:

```
┌─────────────────────────────────────────────────────────┐
│                    ESSAY EVALUATION                      │
├──────────────────────┬──────────────────────────────────┤
│  1. COHERENCE        │  Logical flow, transitions,      │
│     & FLOW           │  paragraph structure, narrative   │
│                      │  consistency                      │
├──────────────────────┼──────────────────────────────────┤
│  2. ARGUMENT         │  Claim-evidence pairing,          │
│     STRENGTH         │  reasoning patterns, counter-     │
│                      │  argument handling                │
├──────────────────────┼──────────────────────────────────┤
│  3. FACTUAL          │  Named entity verification,       │
│     CORRECTNESS      │  claim plausibility, source       │
│                      │  validation                       │
├──────────────────────┼──────────────────────────────────┤
│  4. ORIGINALITY      │  Uniqueness of ideas, creative    │
│                      │  expression, paraphrase detection │
├──────────────────────┼──────────────────────────────────┤
│  5. WRITING          │  Grammar, vocabulary diversity,   │
│     QUALITY          │  sentence variation, academic     │
│                      │  tone                             │
└──────────────────────┴──────────────────────────────────┘
```

### 🛡️ Integrity Detection Suite

EssayAI goes beyond scoring to **protect academic integrity**:

- **🔴 Hallucination Detection** — Identifies fabricated facts, non-existent references, and made-up statistics that LLMs commonly generate
- **🟡 Bias Detection** — Flags unbalanced arguments, one-sided perspectives, and unsupported generalizations
- **🔵 Plagiarism Detection** — Catches paraphrased plagiarism (including LLM-rewritten content) that traditional tools miss

### 🎯 How We Overcome Each Problem

| Problem | Our Solution |
|---------|-------------|
| Slow manual grading | **< 3 seconds** per essay evaluation with full multi-dimensional analysis |
| Evaluator inconsistency | **Deterministic AI scoring** — same essay always gets the same score |
| Surface-level tools | **Deep semantic analysis** using transformer models that understand meaning, not just grammar |
| LLM-paraphrased plagiarism | **Semantic similarity detection** that catches content rewritten by AI |
| Single vague grades | **5-dimension radar chart** with per-dimension feedback and actionable suggestions |
| No AI content detection | **Hallucination and bias detectors** that flag fabricated facts and unbalanced arguments |
| Scalability issues | **Processes thousands of essays** with minimal latency via async processing |

---

## 🖥️ Screenshots

### Dashboard — Analytics Overview
> Stat cards, score distribution, weekly submissions, dimension averages radar chart

### Submit Essay — AI Analysis
> Rich text input with real-time word/sentence stats, animated AI evaluation pipeline

### Results — Multi-Dimensional Scoring
> Animated SVG score ring, 5-axis radar chart, tabbed score breakdown with AI explanations, issues panel

### History — Browse Past Evaluations
> Searchable/filterable essay list with overall score circles and mini dimension bars

### Settings — Configurable Evaluation
> Scoring weight sliders, plagiarism/hallucination/bias detection toggles, API configuration

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)              │
│  ┌──────────┬──────────┬──────────┬──────────┬────────┐ │
│  │Dashboard │ Submit   │ Results  │ History  │Settings│ │
│  └────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬───┘ │
│       │          │          │          │          │       │
│       └──────────┴──────────┴──────────┴──────────┘       │
│                          │ Axios                          │
└──────────────────────────┼────────────────────────────────┘
                           │ REST API
┌──────────────────────────┼────────────────────────────────┐
│                     BACKEND (FastAPI)                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Multi-Aspect Evaluator                  │  │
│  │  ┌───────────┬────────────┬──────────┬───────────┐  │  │
│  │  │Coherence  │ Argument   │ Factual  │Originality│  │  │
│  │  │Analyzer   │ Evaluator  │ Checker  │ Scorer    │  │  │
│  │  └───────────┴────────────┴──────────┴───────────┘  │  │
│  │  ┌───────────┬────────────┬──────────────────────┐  │  │
│  │  │Writing    │Plagiarism  │ Hallucination & Bias │  │  │
│  │  │Quality    │Detector    │ Detector             │  │  │
│  │  └───────────┴────────────┴──────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                │
│  ┌───────────────────────┼─────────────────────────────┐  │
│  │          NLP Pipeline (Transformers + spaCy)         │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                │
│  ┌───────────────────────┼─────────────────────────────┐  │
│  │              SQLite Database                         │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API docs at http://localhost:8000/docs
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Fast, modern SPA |
| **Styling** | Vanilla CSS + Glassmorphism | Premium dark-themed UI |
| **Charts** | Recharts | Radar charts, bar charts, area charts |
| **Animations** | Framer Motion | Smooth page transitions, micro-interactions |
| **Icons** | React Icons | Consistent iconography |
| **Backend** | Python FastAPI | High-performance async API |
| **NLP Engine** | Hugging Face Transformers | Semantic understanding & scoring |
| **Text Analysis** | spaCy + NLTK | Named entity recognition, POS tagging |
| **Database** | SQLite | Lightweight persistent storage |

---

## 🧠 Core AI Technology (The "Secret Weapon")

Many educational AI tools simply wrap a generic LLM API. **EssayAI is different.** We engineered a custom, rule-based Natural Language Processing (NLP) engine directly in Python, giving us complete, mathematically objective control over the evaluation:

### 1. The Core AI & NLP Engine (Backend)
- **Lexical Diversity:** The engine calculates the **Type-Token Ratio (TTR)** and cross-references word frequencies against academic lexicons to score how advanced and varied the student's vocabulary is.
- **Discourse & Coherence Mapping:** We use Regex algorithms and tokenization to scan for transition words and structural markers ("Consequently," "However," "To illustrate"). This maps the logical flow of arguments.
- **Empirical Readability Metrics:** The system calculates syllables, word length, and sentence complexity in real-time to generate a true **Flesch Reading Ease** score for objective Writing Quality.
- **Pattern Recognition:** String matching and pattern recognition detect sweeping generalizations (bias) and potential factual inconsistencies. 

### 2. The Interactive Frontend
- **Dynamic Visualization:** We use **Recharts** to dynamically render the 5-dimensional Radar charts on the fly, translating complex NLP data into an immediate visual "Wow Factor".
- **Micro-Interactions:** **Framer Motion** powers smooth UI transitions, ensuring the platform feels like a premium, enterprise-grade product.

### 3. The Backend Infrastructure
- **Lightning Fast API:** Using **FastAPI** provides highly-performant, asynchronous endpoints. The heavy NLP structural analysis happens in *milliseconds* locally, completely eliminating the extreme latency and high costs associated with standard GPT wrappers.

---

## 📂 Project Structure

```
hackjklu5.0/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/        # Sidebar, Navbar, Layout
│   │   │   ├── Cards/         # StatCard
│   │   │   ├── Charts/        # RadarChart, ScoreDistribution
│   │   │   ├── Essay/         # ScoreBreakdown, IssueCard
│   │   │   └── Common/        # LoadingSpinner, Badge
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Analytics overview
│   │   │   ├── Submit.jsx     # Essay submission form
│   │   │   ├── Results.jsx    # Multi-dimensional results
│   │   │   ├── History.jsx    # Past evaluations
│   │   │   └── Settings.jsx   # Configuration
│   │   ├── data/
│   │   │   └── mockData.js    # Sample essays & scores
│   │   ├── App.jsx            # Router setup
│   │   └── index.css          # Global design system
│   └── package.json
├── backend/
│   ├── main.py                # FastAPI app
│   ├── routes/                # API endpoints
│   ├── services/              # Evaluation engines
│   └── requirements.txt
└── README.md
```

---

## 🏆 Key Differentiators

| Feature | Traditional Tools | EssayAI |
|---------|-------------------|---------|
| Grammar Check | ✅ | ✅ |
| Plagiarism Detection | Basic exact-match | ✅ Semantic + LLM paraphrase |
| Argument Analysis | ❌ | ✅ Claim-evidence pairing |
| Coherence Scoring | ❌ | ✅ Semantic flow analysis |
| Factual Verification | ❌ | ✅ Named entity + claim check |
| Originality Scoring | ❌ | ✅ TF-IDF + creative analysis |
| Hallucination Detection | ❌ | ✅ Fabricated fact flagging |
| Bias Detection | ❌ | ✅ Balanced argument check |
| Multi-Dimensional Radar | ❌ | ✅ 5-axis visualization |
| Explainable Scores | ❌ | ✅ Per-dimension AI feedback |
| Processing Speed | Manual (10-15 min) | ✅ < 3 seconds |

---

## 🚀 Upcoming Hackathon Innovations (Roadmap)

To push the boundaries of what an AI educational tool can be, we are actively developing three "Wow Factor" features:

### 1. Interactive "Argument Map" (Visual AI)
Instead of just providing text-based feedback, EssayAI will parse the logical structure of an essay and generate an **interactive Node Graph**. This mind map will visually connect the student's core claims to their supporting evidence, exposing logical gaps and unsupported premises at a glance.

### 2. Live "Debate Mode" (Active Learning Companion)
Transforming from a passive grader to an active AI Tutor. After evaluation, students can enter "Debate Mode" where the AI adopts the **opposing side** of their essay. The AI will challenge the student's weakest points in a real-time chat interface, forcing them to actively defend their thesis and improve their argumentation skills.

### 3. Voice-Dictated Rhetoric Analysis (Multimodal AI)
A multimodal accessibility feature where students can **speak** their essays or practice answers into the microphone. The system transcribes the speech in real-time and evaluates their *spoken rhetoric* — detecting hesitations, pacing, and confidence levels to generate a unique "Persuasiveness" metric.

---

## 👥 Team

Built for **Inter-IIT Tech Meet — HackJKLU 5.0**

---

## 📄 License


Essay Title
Automation and the Changing Landscape of Human Employment

Essay Prompt / Question
Discuss the potential impacts of automation and artificial intelligence on the future of the global workforce. Consider both the economic benefits and the societal challenges.

Essay Content
The rapid advancement of artificial intelligence and automation technologies is reshaping the global workforce at an unprecedented pace. While historically, technological revolutions have displaced certain jobs only to create new, higher-paying opportunities, the current wave of automation presents a unique set of economic and societal challenges that require careful navigation.

On one hand, the economic benefits of automation are undeniable. By taking over repetitive and dangerous tasks—from assembly line manufacturing to basic data entry—automation significantly increases industrial productivity and efficiency. Companies can operate around the clock with reduced operational costs, leading to cheaper goods and services for consumers. Furthermore, AI systems are now assisting in complex fields such as medical diagnostics and climate modeling, augmenting human capabilities and accelerating scientific innovation.

However, the societal challenges accompanying this shift are profound. Unlike previous industrial revolutions that primarily automated physical labor, modern AI is increasingly capable of performing cognitive tasks. This threatens a wide swath of middle-class, white-collar jobs, ranging from paralegals to financial analysts. The transition could lead to severe economic inequality if the wealth generated by automated systems is concentrated among a small percentage of technology owners, while large segments of the population face structural unemployment.

Some critics argue that extreme measures are the only viable solution, yet this ignores the intrinsic value and purpose that many individuals derive from their careers. Instead, society must prioritize massive reskilling and education initiatives. Governments and corporations must collaborate to equip workers with skills that machines cannot easily replicate—namely, emotional intelligence, complex problem-solving, and creative thinking.

In conclusion, while automation offers the promise of unprecedented economic growth and efficiency, it simultaneously poses a significant threat to global employment stability. A proactive approach focused on education and equitable wealth distribution is essential to ensure that the future of work benefits all of humanity.