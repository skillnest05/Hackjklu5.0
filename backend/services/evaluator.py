"""
Core Essay Evaluation Engine
Performs multi-aspect semantic analysis across 5 dimensions.
Uses NLP techniques: sentence similarity, vocabulary analysis,
discourse structure, and statistical text features.
"""

import re
import math
import string
from collections import Counter


# ──────────────────────────────────────────────
#  Text Preprocessing Utilities
# ──────────────────────────────────────────────

def _tokenize_sentences(text: str) -> list[str]:
    """Split text into sentences."""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]


def _tokenize_words(text: str) -> list[str]:
    """Split text into lowercase words, stripping punctuation."""
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    return [w for w in text.split() if w]


def _get_paragraphs(text: str) -> list[str]:
    """Split text into paragraphs."""
    paragraphs = re.split(r'\n\s*\n', text.strip())
    return [p.strip() for p in paragraphs if p.strip()]


def _word_overlap(s1: str, s2: str) -> float:
    """Compute Jaccard similarity between two sentences."""
    words1 = set(_tokenize_words(s1))
    words2 = set(_tokenize_words(s2))
    if not words1 or not words2:
        return 0.0
    intersection = words1 & words2
    union = words1 | words2
    return len(intersection) / len(union)


# ──────────────────────────────────────────────
#  Transition / Discourse Markers
# ──────────────────────────────────────────────

TRANSITION_WORDS = {
    "however", "moreover", "furthermore", "additionally", "consequently",
    "therefore", "nevertheless", "nonetheless", "meanwhile", "subsequently",
    "although", "whereas", "conversely", "similarly", "likewise",
    "in contrast", "on the other hand", "as a result", "for instance",
    "for example", "in conclusion", "to summarize", "in addition",
    "first", "second", "third", "finally", "next", "then",
    "specifically", "notably", "importantly", "significantly",
}

ARGUMENT_MARKERS = {
    "because", "since", "therefore", "thus", "hence", "consequently",
    "as a result", "due to", "owing to", "given that", "it follows",
    "evidence suggests", "research shows", "studies indicate",
    "according to", "data shows", "statistics reveal",
    "proves", "demonstrates", "confirms", "supports",
    "claim", "argue", "contend", "assert", "posit", "maintain",
}

COUNTER_ARGUMENT_MARKERS = {
    "however", "although", "despite", "nevertheless", "on the other hand",
    "conversely", "critics argue", "opponents claim", "some might say",
    "admittedly", "while it is true", "granted", "notwithstanding",
}

HEDGING_WORDS = {
    "might", "could", "perhaps", "possibly", "seemingly", "apparently",
    "it seems", "it appears", "to some extent", "arguably",
}


# ──────────────────────────────────────────────
#  1. COHERENCE SCORER (0-100)
# ──────────────────────────────────────────────

def score_coherence(text: str) -> tuple[int, str]:
    """
    Evaluate coherence by measuring:
    - Adjacent sentence semantic overlap
    - Use of transition/discourse markers
    - Paragraph structure consistency
    - Topic continuity
    """
    sentences = _tokenize_sentences(text)
    paragraphs = _get_paragraphs(text)
    words = _tokenize_words(text)

    if len(sentences) < 3:
        return 40, "The essay is too short to fully evaluate coherence. Consider expanding your arguments."

    # 1a. Adjacent sentence similarity (topic continuity)
    similarities = []
    for i in range(len(sentences) - 1):
        sim = _word_overlap(sentences[i], sentences[i + 1])
        similarities.append(sim)

    avg_similarity = sum(similarities) / len(similarities) if similarities else 0
    # Ideal range 0.1-0.35 (some overlap but not repetitive)
    if avg_similarity < 0.05:
        similarity_score = 30
    elif avg_similarity < 0.10:
        similarity_score = 50
    elif avg_similarity < 0.35:
        similarity_score = 85 + min(15, int(avg_similarity * 100))
    else:
        similarity_score = 70  # too repetitive

    # 1b. Transition word usage
    text_lower = text.lower()
    transition_count = sum(1 for tw in TRANSITION_WORDS if tw in text_lower)
    transition_density = transition_count / max(len(sentences), 1)
    if transition_density >= 0.4:
        transition_score = 95
    elif transition_density >= 0.25:
        transition_score = 80
    elif transition_density >= 0.1:
        transition_score = 60
    else:
        transition_score = 35

    # 1c. Paragraph structure
    if len(paragraphs) >= 3:
        para_score = 85
        if len(paragraphs) >= 5:
            para_score = 95
    elif len(paragraphs) == 2:
        para_score = 60
    else:
        para_score = 40

    # 1d. Sentence length variation (indicates structured writing)
    sent_lengths = [len(_tokenize_words(s)) for s in sentences]
    if len(sent_lengths) > 1:
        avg_len = sum(sent_lengths) / len(sent_lengths)
        variance = sum((l - avg_len) ** 2 for l in sent_lengths) / len(sent_lengths)
        std_dev = math.sqrt(variance)
        if 3 < std_dev < 12:
            variation_score = 90
        elif std_dev <= 3:
            variation_score = 55  # too uniform
        else:
            variation_score = 60  # too chaotic
    else:
        variation_score = 50

    # Weighted combination
    final = int(similarity_score * 0.3 + transition_score * 0.3 + para_score * 0.2 + variation_score * 0.2)
    final = max(0, min(100, final))

    # Generate feedback
    feedback_parts = []
    if transition_score >= 80:
        feedback_parts.append("Excellent use of transition words that guide the reader through your arguments.")
    elif transition_score >= 60:
        feedback_parts.append("Good use of transitions, but adding more discourse markers would improve flow.")
    else:
        feedback_parts.append("The essay lacks sufficient transition words. Consider using connectors like 'however', 'furthermore', 'consequently' to improve flow.")

    if para_score >= 85:
        feedback_parts.append(f"Well-structured with {len(paragraphs)} distinct paragraphs.")
    else:
        feedback_parts.append("Consider breaking the essay into more paragraphs for better readability.")

    if similarity_score < 60:
        feedback_parts.append("Some sentences seem disconnected from their neighbors. Strengthen topic continuity.")

    return final, " ".join(feedback_parts)


# ──────────────────────────────────────────────
#  2. ARGUMENT STRENGTH SCORER (0-100)
# ──────────────────────────────────────────────

def score_argument_strength(text: str, prompt: str = "") -> tuple[int, str]:
    """
    Evaluate argument strength by measuring:
    - Presence of claims and evidence markers
    - Counter-argument handling
    - Logical structure markers
    - Prompt relevance
    """
    text_lower = text.lower()
    sentences = _tokenize_sentences(text)
    words = _tokenize_words(text)

    if len(words) < 50:
        return 35, "The essay is too brief to develop strong arguments. Expand your points with evidence."

    # 2a. Argument markers density
    arg_count = sum(1 for m in ARGUMENT_MARKERS if m in text_lower)
    arg_density = arg_count / max(len(sentences), 1)
    if arg_density >= 0.5:
        arg_score = 95
    elif arg_density >= 0.3:
        arg_score = 80
    elif arg_density >= 0.15:
        arg_score = 65
    else:
        arg_score = 40

    # 2b. Counter-argument handling
    counter_count = sum(1 for m in COUNTER_ARGUMENT_MARKERS if m in text_lower)
    if counter_count >= 3:
        counter_score = 95
    elif counter_count >= 2:
        counter_score = 80
    elif counter_count >= 1:
        counter_score = 60
    else:
        counter_score = 30

    # 2c. Evidence patterns (numbers, statistics, quotes, citations)
    number_pattern = re.findall(r'\b\d+(?:\.\d+)?%?\b', text)
    quote_pattern = re.findall(r'["\u201c][^"\u201d]+["\u201d]', text)
    citation_pattern = re.findall(r'\([A-Z][a-z]+,?\s*\d{4}\)', text)
    
    evidence_count = len(number_pattern) + len(quote_pattern) * 2 + len(citation_pattern) * 3
    if evidence_count >= 8:
        evidence_score = 95
    elif evidence_count >= 5:
        evidence_score = 80
    elif evidence_count >= 2:
        evidence_score = 60
    else:
        evidence_score = 35

    # 2d. Prompt relevance (if prompt provided)
    if prompt:
        prompt_words = set(_tokenize_words(prompt))
        essay_words = set(words)
        overlap = len(prompt_words & essay_words) / max(len(prompt_words), 1)
        relevance_score = min(100, int(overlap * 120) + 30)
    else:
        relevance_score = 75  # neutral if no prompt

    # Weighted
    final = int(arg_score * 0.3 + counter_score * 0.2 + evidence_score * 0.3 + relevance_score * 0.2)
    final = max(0, min(100, final))

    # Feedback
    feedback_parts = []
    if arg_score >= 80:
        feedback_parts.append("Strong argumentative language with well-constructed logical claims.")
    else:
        feedback_parts.append("Consider strengthening your arguments with clearer claim-evidence structures using phrases like 'research shows', 'evidence suggests'.")

    if counter_score >= 60:
        feedback_parts.append("Good handling of counter-arguments, showing balanced perspective.")
    else:
        feedback_parts.append("The essay would benefit from addressing counter-arguments to demonstrate critical thinking.")

    if evidence_score >= 60:
        feedback_parts.append("Effective use of evidence including data points and references.")
    else:
        feedback_parts.append("Include more concrete evidence — statistics, quotes, or citations — to support your claims.")

    return final, " ".join(feedback_parts)


# ──────────────────────────────────────────────
#  3. FACTUAL CORRECTNESS SCORER (0-100)
# ──────────────────────────────────────────────

# Common factual claim patterns to check
SUSPICIOUS_PATTERNS = [
    r'studies\s+show\s+that\s+\d+%',
    r'according\s+to\s+a\s+\d{4}\s+report',
    r'research\s+from\s+\d{4}',
    r'a\s+recent\s+study\s+found',
    r'\d+%\s+of\s+(?:all\s+)?(?:people|students|experts|scientists)',
]

KNOWN_FALSEHOODS_SIGNALS = [
    r'100%\s+of\s+(?:all\s+)?(?:scientists|experts|researchers)\s+agree',
    r'has\s+been\s+(?:completely|totally|fully)\s+(?:proven|disproven)',
    r'no\s+(?:scientist|expert|researcher)\s+(?:disagrees|denies)',
    r'everyone\s+(?:knows|agrees)\s+that',
]


def score_factual_correctness(text: str) -> tuple[int, str]:
    """
    Evaluate factual correctness by checking:
    - Presence of verifiable claims
    - Statistical claims plausibility
    - Absolute language (red flag)
    - Citation/reference presence
    """
    text_lower = text.lower()
    sentences = _tokenize_sentences(text)
    words = _tokenize_words(text)

    if len(words) < 50:
        return 50, "The essay is too short for comprehensive factual analysis."

    base_score = 80  # Start optimistic

    # 3a. Check for absolute/exaggerated claims (suspicious)
    absolute_count = 0
    for pattern in KNOWN_FALSEHOODS_SIGNALS:
        matches = re.findall(pattern, text_lower)
        absolute_count += len(matches)

    if absolute_count >= 3:
        base_score -= 25
    elif absolute_count >= 1:
        base_score -= 12

    # 3b. Unsupported statistical claims
    stat_claims = []
    for pattern in SUSPICIOUS_PATTERNS:
        stat_claims.extend(re.findall(pattern, text_lower))

    # Check if stats have citations nearby
    citation_count = len(re.findall(r'\([A-Z][a-z]+,?\s*\d{4}\)', text))
    if len(stat_claims) > 0 and citation_count == 0:
        base_score -= 10  # stats without citations
    elif citation_count >= 2:
        base_score += 8  # good citation practice

    # 3c. Hedging language (can indicate intellectual honesty)
    hedge_count = sum(1 for h in HEDGING_WORDS if h in text_lower)
    if hedge_count >= 2:
        base_score += 5  # appropriate caution

    # 3d. Specific vs vague claims
    specific_markers = re.findall(r'\b(?:specifically|namely|in particular|for instance|for example)\b', text_lower)
    if len(specific_markers) >= 2:
        base_score += 5

    # 3e. Sensational language (often correlates with inaccuracy)
    sensational = re.findall(r'\b(?:shocking|unbelievable|insanely|mind-blowing|revolutionary|groundbreaking)\b', text_lower)
    if len(sensational) >= 2:
        base_score -= 8

    final = max(0, min(100, base_score))

    # Feedback
    feedback_parts = []
    if absolute_count > 0:
        feedback_parts.append(f"Found {absolute_count} absolute claim(s) that overstate certainty. Use more measured language.")
    if len(stat_claims) > 0 and citation_count == 0:
        feedback_parts.append("Statistical claims lack citations. Always provide sources for numerical data.")
    if citation_count >= 2:
        feedback_parts.append("Good use of citations to support factual claims.")
    if not feedback_parts:
        if final >= 80:
            feedback_parts.append("Claims appear measured and plausible. Good use of factual language.")
        else:
            feedback_parts.append("Some claims may need verification. Consider adding references to strengthen credibility.")

    return final, " ".join(feedback_parts)


# ──────────────────────────────────────────────
#  4. ORIGINALITY SCORER (0-100)
# ──────────────────────────────────────────────

CLICHE_PHRASES = [
    "in today's world", "since the dawn of time", "in this day and age",
    "it goes without saying", "at the end of the day", "it is what it is",
    "in conclusion", "to summarize", "all in all",
    "plays a vital role", "is a hot topic", "has its pros and cons",
    "a double-edged sword", "the elephant in the room",
    "think outside the box", "paradigm shift",
]


def score_originality(text: str) -> tuple[int, str]:
    """
    Evaluate originality by measuring:
    - Vocabulary richness (type-token ratio)
    - Cliché density
    - Unique word usage
    - Structural creativity
    """
    words = _tokenize_words(text)
    sentences = _tokenize_sentences(text)
    text_lower = text.lower()

    if len(words) < 50:
        return 45, "The essay is too brief to fully assess originality. Expand your ideas."

    # 4a. Type-Token Ratio (vocabulary diversity)
    unique_words = set(words)
    ttr = len(unique_words) / len(words)
    # Expected TTR decreases with length; normalize
    adjusted_ttr = ttr * math.sqrt(len(words)) / 10
    if adjusted_ttr >= 1.8:
        vocab_score = 95
    elif adjusted_ttr >= 1.2:
        vocab_score = 80
    elif adjusted_ttr >= 0.8:
        vocab_score = 65
    else:
        vocab_score = 45

    # 4b. Cliché detection
    cliche_count = sum(1 for c in CLICHE_PHRASES if c in text_lower)
    if cliche_count == 0:
        cliche_score = 95
    elif cliche_count <= 2:
        cliche_score = 70
    elif cliche_count <= 4:
        cliche_score = 50
    else:
        cliche_score = 30

    # 4c. Advanced vocabulary (words > 8 chars as proxy)
    long_words = [w for w in words if len(w) > 8]
    long_ratio = len(long_words) / max(len(words), 1)
    if long_ratio >= 0.15:
        advanced_score = 90
    elif long_ratio >= 0.10:
        advanced_score = 75
    elif long_ratio >= 0.05:
        advanced_score = 60
    else:
        advanced_score = 40

    # 4d. Sentence structure variety (std dev of sentence lengths)
    sent_lengths = [len(_tokenize_words(s)) for s in sentences]
    if len(sent_lengths) > 2:
        avg = sum(sent_lengths) / len(sent_lengths)
        std = math.sqrt(sum((l - avg) ** 2 for l in sent_lengths) / len(sent_lengths))
        if 4 < std < 10:
            structure_score = 90
        elif std <= 4:
            structure_score = 55
        else:
            structure_score = 65
    else:
        structure_score = 50

    final = int(vocab_score * 0.3 + cliche_score * 0.25 + advanced_score * 0.25 + structure_score * 0.2)
    final = max(0, min(100, final))

    # Feedback
    feedback_parts = []
    if vocab_score >= 80:
        feedback_parts.append("Rich and diverse vocabulary demonstrates sophisticated language skills.")
    else:
        feedback_parts.append("Consider expanding your vocabulary to express ideas more uniquely.")

    if cliche_count > 0:
        feedback_parts.append(f"Found {cliche_count} cliché phrase(s). Replace overused expressions with more original phrasing.")
    else:
        feedback_parts.append("No cliché phrases detected — great original expression.")

    if advanced_score < 65:
        feedback_parts.append("Incorporate more advanced vocabulary to enhance the depth of your writing.")

    return final, " ".join(feedback_parts)


# ──────────────────────────────────────────────
#  5. WRITING QUALITY SCORER (0-100)
# ──────────────────────────────────────────────

COMMON_GRAMMAR_ERRORS = [
    (r'\bi\b(?!\s*[.\'\"])', "Capitalize 'I'"),
    (r'\b(their|there|they\'re)\b.*\b(their|there|they\'re)\b', None),
    (r'\s{2,}', "Multiple spaces detected"),
    (r'[.!?]\s*[a-z]', "Sentence may not start with a capital letter"),
    (r'\b(alot|irregardless|supposably|could of|should of|would of)\b', "Common word error"),
]


def score_writing_quality(text: str) -> tuple[int, str]:
    """
    Evaluate writing quality by measuring:
    - Grammar patterns
    - Sentence complexity & variation
    - Vocabulary sophistication
    - Paragraph formatting
    - Punctuation usage & variety
    """
    sentences = _tokenize_sentences(text)
    words = _tokenize_words(text)
    paragraphs = _get_paragraphs(text)

    if len(words) < 30:
        return 40, "The essay is too short for comprehensive quality analysis."

    base_score = 78

    # 5a. Grammar error patterns
    error_count = 0
    error_details = []
    for pattern, desc in COMMON_GRAMMAR_ERRORS:
        matches = re.findall(pattern, text)
        if matches:
            error_count += len(matches)
            if desc:
                error_details.append(desc)

    if error_count == 0:
        base_score += 10
    elif error_count <= 2:
        base_score += 2
    elif error_count <= 5:
        base_score -= 8
    else:
        base_score -= 18

    # 5b. Sentence length variety
    sent_lengths = [len(_tokenize_words(s)) for s in sentences]
    avg_sent_len = sum(sent_lengths) / max(len(sent_lengths), 1)

    # Ideal average sentence length: 15-25 words
    if 12 <= avg_sent_len <= 25:
        base_score += 5
    elif avg_sent_len < 8:
        base_score -= 10  # too short / choppy
    elif avg_sent_len > 35:
        base_score -= 8  # too long / run-on risk

    # 5c. Punctuation variety (commas, semicolons, colons, dashes)
    punct_variety = sum(1 for p in [';', ':', '—', '--', '(', ')'] if p in text)
    if punct_variety >= 3:
        base_score += 5
    elif punct_variety == 0:
        base_score -= 5

    # 5d. Paragraph quality (not too short, not too long)
    if len(paragraphs) >= 3:
        para_lengths = [len(_tokenize_words(p)) for p in paragraphs]
        avg_para = sum(para_lengths) / len(para_lengths)
        if 50 <= avg_para <= 200:
            base_score += 5
        elif avg_para < 30:
            base_score -= 5

    # 5e. Word repetition check (overuse of same words)
    word_freq = Counter(words)
    common_words = {"the", "a", "an", "is", "are", "was", "were", "and", "or", "but",
                    "in", "on", "at", "to", "for", "of", "with", "that", "this", "it",
                    "be", "as", "by", "from", "not", "has", "have", "had", "do", "does"}
    content_words = {w: c for w, c in word_freq.items() if w not in common_words and len(w) > 3}
    if content_words:
        max_freq = max(content_words.values())
        if max_freq > len(sentences) * 0.5:
            base_score -= 5  # word overuse

    final = max(0, min(100, base_score))

    # Feedback
    feedback_parts = []
    if error_count == 0:
        feedback_parts.append("Excellent grammar with no detected errors.")
    elif error_count <= 2:
        feedback_parts.append(f"Minor grammar issues found ({', '.join(error_details[:2])}). Overall quality is good.")
    else:
        feedback_parts.append(f"Several grammar issues detected ({error_count} patterns). Proofread carefully.")

    if avg_sent_len < 8:
        feedback_parts.append("Sentences are very short — combine some for better flow.")
    elif avg_sent_len > 35:
        feedback_parts.append("Some sentences are very long. Break them up to improve readability.")
    else:
        feedback_parts.append("Good sentence length variation that maintains reader engagement.")

    if punct_variety >= 3:
        feedback_parts.append("Effective use of varied punctuation demonstrating advanced writing skills.")

    return final, " ".join(feedback_parts)


# ──────────────────────────────────────────────
#  MAIN EVALUATOR — Orchestrator
# ──────────────────────────────────────────────

def evaluate_essay(text: str, prompt: str = "", weights: dict | None = None) -> dict:
    """
    Run all 5 scoring dimensions and produce a comprehensive evaluation.
    
    Args:
        text: The full essay text
        prompt: The essay prompt/question (optional)
        weights: Custom scoring weights (optional), keys: coherence, argument_strength,
                 factual_correctness, originality, writing_quality. Values should sum to 100.
    
    Returns:
        dict with scores, feedback, and overall score
    """
    default_weights = {
        "coherence": 20,
        "argument_strength": 25,
        "factual_correctness": 25,
        "originality": 15,
        "writing_quality": 15,
    }
    w = weights or default_weights

    # Run all scorers
    coh_score, coh_feedback = score_coherence(text)
    arg_score, arg_feedback = score_argument_strength(text, prompt)
    fac_score, fac_feedback = score_factual_correctness(text)
    ori_score, ori_feedback = score_originality(text)
    wri_score, wri_feedback = score_writing_quality(text)

    # Weighted overall
    overall = int(
        coh_score * w["coherence"] / 100 +
        arg_score * w["argument_strength"] / 100 +
        fac_score * w["factual_correctness"] / 100 +
        ori_score * w["originality"] / 100 +
        wri_score * w["writing_quality"] / 100
    )
    overall = max(0, min(100, overall))

    # Generate actionable improvement tips
    tips = []
    if coh_score < 75:
        tips.append("Improve coherence by using more transition words (e.g., 'however', 'furthermore') and ensuring each sentence logically connects to the next.")
    if arg_score < 75:
        tips.append("Strengthen your arguments by explicitly stating claims and backing them up with concrete evidence or data.")
    if fac_score < 75:
        tips.append("Ensure factual correctness by avoiding absolute statements and adding proper citations for specific claims.")
    if ori_score < 75:
        tips.append("Boost originality by varying your sentence structures, using more advanced vocabulary, and avoiding common clichés.")
    if wri_score < 75:
        tips.append("Enhance writing quality by carefully proofreading for basic grammar errors and varying your punctuation usage.")
    
    if not tips:
        tips.append("Your essay is very strong! To push for mastery, focus on stylistic nuance and deeper critical analysis of counter-arguments.")

    # Generate practice questions based on length and weaknesses
    words = text.split()
    word_count = len(words)
    num_questions = 1
    if word_count > 300:
        num_questions = 3
    elif word_count > 100:
        num_questions = 2
        
    questions = []
    # Identify weakest areas
    scores_dict = {
        "coherence": coh_score,
        "argument_strength": arg_score,
        "factual_correctness": fac_score,
        "originality": ori_score,
        "writing_quality": wri_score
    }
    sorted_weaknesses = sorted(scores_dict.items(), key=lambda x: x[1])
    
    for i in range(num_questions):
        weakness = sorted_weaknesses[i % len(sorted_weaknesses)][0]
        if weakness == "coherence":
            questions.append("Practice: Take two disconnected sentences from your essay and rewrite them using a logical transition word (e.g., 'Consequently', 'Furthermore').")
        elif weakness == "argument_strength":
            questions.append("Practice: Write a single, strong paragraph addressing the strongest possible counter-argument to your main thesis.")
        elif weakness == "factual_correctness":
            questions.append("Practice: Find one statistical claim or generalization in your essay and rewrite it attributing a specific, credible source.")
        elif weakness == "originality":
            questions.append("Practice: Identify a cliché or overused phrase in your writing and replace it with a unique, original metaphor or vivid description.")
        elif weakness == "writing_quality":
            questions.append("Practice: Rewrite your longest run-on sentence by breaking it into two crisp, concise sentences.")

    return {
        "overall_score": overall,
        "scores": {
            "coherence": coh_score,
            "argument_strength": arg_score,
            "factual_correctness": fac_score,
            "originality": ori_score,
            "writing_quality": wri_score,
        },
        "feedback": {
            "coherence": coh_feedback,
            "argument_strength": arg_feedback,
            "factual_correctness": fac_feedback,
            "originality": ori_feedback,
            "writing_quality": wri_feedback,
            "improvement_tips": tips,
            "practice_questions": questions,
        },
    }


def evaluate_practice_answer(question: str, answer: str) -> dict:
    """
    Lightweight evaluation for practice question answers.
    Checks relevance (overlap with question intents), length, and basic structure.
    """
    text = answer.strip()
    if not text:
        return {"score": 0, "feedback": "Answer cannot be empty."}

    words = _tokenize_words(text)
    if len(words) < 5:
        return {"score": 20, "feedback": "Your answer is too short. Please try to write a complete sentence or paragraph."}

    score = 100
    feedback_notes = []

    # 1. Relevance / Following Instructions check
    q_words = set(_tokenize_words(question.lower()))
    
    if "transition" in q_words or "however" in q_words:
        # Check if they used a transition word
        has_transition = any(w in TRANSITION_WORDS for w in words)
        if not has_transition:
            score -= 30
            feedback_notes.append("You didn't seem to include clear transition words like 'however' or 'furthermore'.")
        else:
            feedback_notes.append("Great job using clear transition words!")

    elif "counter-argument" in q_words or "counterargument" in q_words:
        # Check for counter-argument markers
        has_counter = any(marker in text.lower() for marker in COUNTER_ARGUMENT_MARKERS)
        if not has_counter:
            score -= 20
            feedback_notes.append("Consider using phrases like 'Critics argue' or 'On the other hand' when introducing a counter-argument.")
        else:
            feedback_notes.append("Excellent framing of the counter-argument.")

    elif "credible source" in q_words or "citation" in q_words:
        # Check for citation markers like "according to", "studies show", numbers
        has_citation = any(m in text.lower() for m in ["according to", "study by", "research from", "published"]) or any(char.isdigit() for char in text)
        if not has_citation:
            score -= 20
            feedback_notes.append("Make sure to explicitly mention a source or include data to back up the claim.")
        else:
            feedback_notes.append("Good job attributing the information.")

    # 2. Grammar / Quality Check
    sentences = _tokenize_sentences(text)
    if not text[0].isupper():
        score -= 10
        feedback_notes.append("Make sure to capitalize the first letter of your sentences.")
    if not text[-1] in ".!?":
        score -= 10
        feedback_notes.append("Don't forget proper ending punctuation.")

    if not feedback_notes:
        feedback_notes.append("Well done! This is a solid improvement.")

    # Bound score
    score = max(0, min(100, score))

    return {
        "score": score,
        "feedback": " ".join(feedback_notes)
    }
