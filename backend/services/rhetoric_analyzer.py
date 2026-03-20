"""
Rhetoric Analyzer — Spoken Persuasiveness Engine
Analyzes transcribed speech for rhetoric quality:
- Filler word detection (uh, um, like, you know)
- Hesitation pattern analysis
- Pacing and fluency scoring
- Confidence level detection
- Persuasiveness composite metric
"""

import re
import math
from collections import Counter

# ──────────────────────────────────────────────
#  Filler Words & Hesitation Markers
# ──────────────────────────────────────────────

FILLER_WORDS = {
    "um", "uh", "uhh", "umm", "er", "erm", "ah", "ahh",
    "like", "basically", "literally", "actually", "honestly",
    "you know", "i mean", "sort of", "kind of", "i guess",
    "right", "okay", "so yeah", "well", "anyway",
}

HEDGING_PHRASES = {
    "i think", "maybe", "perhaps", "possibly", "i suppose",
    "it might be", "it could be", "im not sure", "i dont know",
    "probably", "presumably", "seemingly", "apparently",
    "in my opinion", "i believe", "i feel like",
}

CONFIDENCE_MARKERS = {
    "clearly", "obviously", "undoubtedly", "certainly", "definitely",
    "without a doubt", "it is clear", "the evidence shows",
    "research proves", "studies confirm", "data demonstrates",
    "i am convinced", "i firmly believe", "there is no question",
    "the fact is", "it is undeniable", "we must acknowledge",
}

PERSUASION_TECHNIQUES = {
    "rhetorical_question": [
        r'\b(isn\'?t it|don\'?t you think|wouldn\'?t you agree|how can we|why would anyone|who wouldn\'?t)\b',
        r'\?[^.]*\b(right|correct|true|agree)\b',
    ],
    "repetition": [],  # detected algorithmically
    "call_to_action": [
        r'\b(we must|we should|we need to|let us|let\'?s|it is time to|we have to|take action|stand up)\b',
    ],
    "emotional_appeal": [
        r'\b(imagine|consider|think about|picture this|what if|remember when|feel)\b',
        r'\b(passionate|heartfelt|deeply|profoundly|tragically|beautifully|remarkably)\b',
    ],
    "contrast": [
        r'\b(on one hand|on the other|while some|whereas|in contrast|but consider|however)\b',
        r'\b(not only|but also|instead of|rather than)\b',
    ],
}


# ──────────────────────────────────────────────
#  Text Preprocessing
# ──────────────────────────────────────────────

def _clean_text(text: str) -> str:
    return re.sub(r'[^\w\s\'?.,!]', '', text.lower())


def _tokenize_words(text: str) -> list[str]:
    return [w for w in _clean_text(text).split() if w]


def _tokenize_sentences(text: str) -> list[str]:
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if len(s.strip()) > 3]


# ──────────────────────────────────────────────
#  1. Filler Word Analysis
# ──────────────────────────────────────────────

def analyze_fillers(text: str) -> dict:
    """Detect and count filler words/phrases in transcribed speech."""
    text_lower = text.lower()
    words = _tokenize_words(text)
    total_words = len(words)

    filler_instances = []

    # Single-word fillers
    for word in words:
        if word in FILLER_WORDS:
            filler_instances.append(word)

    # Multi-word fillers
    for phrase in FILLER_WORDS:
        if ' ' in phrase:
            count = text_lower.count(phrase)
            filler_instances.extend([phrase] * count)

    filler_count = len(filler_instances)
    filler_rate = (filler_count / max(total_words, 1)) * 100
    filler_freq = Counter(filler_instances).most_common(5)

    # Score: 0 fillers = 100, escalating penalty
    if filler_rate < 1:
        score = 95
    elif filler_rate < 3:
        score = 80
    elif filler_rate < 6:
        score = 60
    elif filler_rate < 10:
        score = 40
    else:
        score = 20

    return {
        "score": score,
        "filler_count": filler_count,
        "filler_rate": round(filler_rate, 1),
        "top_fillers": filler_freq,
        "total_words": total_words,
    }


# ──────────────────────────────────────────────
#  2. Pacing & Fluency Analysis
# ──────────────────────────────────────────────

def analyze_pacing(text: str, duration_seconds: float) -> dict:
    """Analyze speaking pace based on word count and duration."""
    words = _tokenize_words(text)
    total_words = len(words)
    sentences = _tokenize_sentences(text)

    if duration_seconds <= 0:
        duration_seconds = max(total_words / 2.5, 10)  # estimate ~150 wpm

    wpm = (total_words / duration_seconds) * 60

    # Sentence length variation (fluency indicator)
    sent_lengths = [len(_tokenize_words(s)) for s in sentences]
    if len(sent_lengths) > 1:
        avg_len = sum(sent_lengths) / len(sent_lengths)
        variance = sum((l - avg_len) ** 2 for l in sent_lengths) / len(sent_lengths)
        std_dev = math.sqrt(variance)
    else:
        avg_len = total_words
        std_dev = 0

    # Ideal speaking pace: 130-170 wpm
    if 130 <= wpm <= 170:
        pace_score = 95
        pace_label = "Ideal"
    elif 110 <= wpm < 130 or 170 < wpm <= 200:
        pace_score = 80
        pace_label = "Slightly fast" if wpm > 170 else "Slightly slow"
    elif 80 <= wpm < 110 or 200 < wpm <= 230:
        pace_score = 60
        pace_label = "Too fast" if wpm > 200 else "Too slow"
    else:
        pace_score = 35
        pace_label = "Much too fast" if wpm > 230 else "Much too slow"

    # Fluency from sentence variation (3-10 std_dev is natural)
    if 3 < std_dev < 10:
        fluency_score = 90
    elif std_dev <= 3:
        fluency_score = 60  # monotonous
    else:
        fluency_score = 55  # chaotic

    combined = int(pace_score * 0.6 + fluency_score * 0.4)

    return {
        "score": combined,
        "wpm": round(wpm, 1),
        "pace_label": pace_label,
        "avg_sentence_length": round(avg_len, 1),
        "sentence_variation": round(std_dev, 1),
        "duration_seconds": round(duration_seconds, 1),
    }


# ──────────────────────────────────────────────
#  3. Confidence Level Analysis
# ──────────────────────────────────────────────

def analyze_confidence(text: str) -> dict:
    """Measure confidence vs. hedging in spoken language."""
    text_lower = text.lower()
    words = _tokenize_words(text)
    total_words = len(words)

    # Count confidence markers
    confidence_count = 0
    confidence_found = []
    for marker in CONFIDENCE_MARKERS:
        if marker in text_lower:
            count = text_lower.count(marker)
            confidence_count += count
            confidence_found.append(marker)

    # Count hedging phrases
    hedge_count = 0
    hedges_found = []
    for hedge in HEDGING_PHRASES:
        if hedge in text_lower:
            count = text_lower.count(hedge)
            hedge_count += count
            hedges_found.append(hedge)

    # Confidence ratio
    total_markers = confidence_count + hedge_count
    if total_markers > 0:
        confidence_ratio = confidence_count / total_markers
    else:
        confidence_ratio = 0.5  # neutral

    # Score based on ratio
    if confidence_ratio >= 0.7:
        score = 90
        level = "High Confidence"
    elif confidence_ratio >= 0.5:
        score = 75
        level = "Moderate Confidence"
    elif confidence_ratio >= 0.3:
        score = 55
        level = "Somewhat Uncertain"
    else:
        score = 35
        level = "Low Confidence"

    return {
        "score": score,
        "level": level,
        "confidence_markers": confidence_count,
        "hedging_markers": hedge_count,
        "confidence_ratio": round(confidence_ratio, 2),
        "top_confidence": confidence_found[:3],
        "top_hedges": hedges_found[:3],
    }


# ──────────────────────────────────────────────
#  4. Persuasion Technique Detection
# ──────────────────────────────────────────────

def analyze_persuasion(text: str) -> dict:
    """Detect rhetorical and persuasion techniques in speech."""
    text_lower = text.lower()
    words = _tokenize_words(text)
    techniques_found = {}

    # Regex-based detection
    for technique, patterns in PERSUASION_TECHNIQUES.items():
        if technique == "repetition":
            continue
        count = 0
        for pattern in patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            count += len(matches)
        if count > 0:
            techniques_found[technique] = count

    # Repetition detection (key phrases repeated 2+ times)
    word_counts = Counter(words)
    meaningful_words = {w for w, c in word_counts.items()
                        if c >= 2 and len(w) > 4
                        and w not in {'their', 'there', 'these', 'those', 'which', 'would', 'could', 'should', 'about'}}
    if len(meaningful_words) >= 2:
        techniques_found["repetition"] = len(meaningful_words)

    total_techniques = sum(techniques_found.values())

    if total_techniques >= 6:
        score = 95
    elif total_techniques >= 4:
        score = 80
    elif total_techniques >= 2:
        score = 65
    elif total_techniques >= 1:
        score = 50
    else:
        score = 30

    return {
        "score": score,
        "techniques": techniques_found,
        "total_count": total_techniques,
    }


# ──────────────────────────────────────────────
#  5. Composite Persuasiveness Score
# ──────────────────────────────────────────────

def analyze_rhetoric(text: str, duration_seconds: float = 0) -> dict:
    """
    Full rhetoric analysis pipeline.
    Returns composite persuasiveness score and sub-metrics.
    """
    fillers = analyze_fillers(text)
    pacing = analyze_pacing(text, duration_seconds)
    confidence = analyze_confidence(text)
    persuasion = analyze_persuasion(text)

    # Weighted composite
    persuasiveness = int(
        fillers["score"] * 0.20 +
        pacing["score"] * 0.25 +
        confidence["score"] * 0.25 +
        persuasion["score"] * 0.30
    )
    persuasiveness = max(0, min(100, persuasiveness))

    # Generate feedback
    feedback = []
    if fillers["score"] < 60:
        feedback.append(f"High filler word usage ({fillers['filler_count']} fillers detected). Practice pausing instead of using '{fillers['top_fillers'][0][0] if fillers['top_fillers'] else 'um'}'.")
    elif fillers["score"] >= 80:
        feedback.append("Excellent speech clarity with minimal filler words.")

    if pacing["score"] < 60:
        feedback.append(f"Speaking pace is {pacing['pace_label'].lower()} at {pacing['wpm']} WPM. Aim for 130-170 WPM.")
    elif pacing["score"] >= 80:
        feedback.append(f"Good pacing at {pacing['wpm']} WPM — natural and engaging tempo.")

    if confidence["score"] < 60:
        feedback.append(f"Speech shows uncertainty ({confidence['hedge_count']} hedging phrases). Use more definitive language.")
    elif confidence["score"] >= 80:
        feedback.append("Strong, confident delivery with assertive language.")

    if persuasion["score"] < 50:
        feedback.append("Add rhetorical techniques: ask questions, use contrasts, make emotional appeals.")
    elif persuasion["score"] >= 80:
        techniques_list = ", ".join(t.replace("_", " ") for t in persuasion["techniques"].keys())
        feedback.append(f"Effective use of persuasion techniques: {techniques_list}.")

    return {
        "persuasiveness_score": persuasiveness,
        "fillers": fillers,
        "pacing": pacing,
        "confidence": confidence,
        "persuasion": persuasion,
        "feedback": feedback,
    }
