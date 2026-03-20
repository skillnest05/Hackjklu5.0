"""
Debate Engine — Active Learning Companion
Generates contextual counter-arguments that challenge the student's essay.
The AI adopts the OPPOSING position and targets the weakest claims.
"""

import re
import random
from collections import Counter


# ──────────────────────────────────────────────
#  Helpers
# ──────────────────────────────────────────────

def _tokenize_sentences(text: str) -> list[str]:
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if len(s.strip()) > 10]


def _tokenize_words(text: str) -> list[str]:
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return [w for w in text.split() if w]


def _get_paragraphs(text: str) -> list[str]:
    paragraphs = re.split(r'\n\s*\n', text.strip())
    return [p.strip() for p in paragraphs if len(p.strip()) > 20]


# ──────────────────────────────────────────────
#  Thesis Extraction
# ──────────────────────────────────────────────

THESIS_INDICATORS = [
    r'\bthis essay (argues?|contends?|examines?|explores?|demonstrates?)\b',
    r'\bI (argue|believe|contend|maintain|assert)\b',
    r'\bthe (main|central|key|core|primary) (argument|claim|thesis|point)\b',
    r'\bin this (essay|paper|piece|article)\b',
    r'\bthis paper (will|aims to|seeks to)\b',
]

def extract_thesis(essay_text: str) -> str:
    """Extract the main thesis from the essay (usually in first paragraph)."""
    paragraphs = _get_paragraphs(essay_text)
    sentences = _tokenize_sentences(essay_text)

    # Priority: look for explicit thesis statements in first paragraph
    first_para = paragraphs[0] if paragraphs else essay_text
    first_para_sentences = _tokenize_sentences(first_para)

    for sentence in first_para_sentences:
        for pattern in THESIS_INDICATORS:
            if re.search(pattern, sentence, re.IGNORECASE):
                return sentence.strip()

    # Fallback: return the last sentence of the first paragraph (often the thesis)
    if first_para_sentences:
        return first_para_sentences[-1].strip()

    # Last resort: first sentence of essay
    return sentences[0] if sentences else "your main argument"


# ──────────────────────────────────────────────
#  Weak Claim Detection
# ──────────────────────────────────────────────

WEAK_SIGNALS = [
    r'\b(some|many|most|often|usually|generally|typically|sometimes|perhaps|maybe)\b',
    r'\b(it (seems|appears|is believed|is thought|is said))\b',
    r'\b(might|could|may|would|should)\b',
    r'\b(everyone|always|never|all people|no one)\b',  # absolute claims without proof
]

def find_weak_claims(essay_text: str) -> list[str]:
    """Find sentences that make weak, unsubstantiated, or absolute claims."""
    sentences = _tokenize_sentences(essay_text)
    weak = []

    for sent in sentences:
        score = 0
        for pattern in WEAK_SIGNALS:
            if re.search(pattern, sent, re.IGNORECASE):
                score += 1
        if score >= 1 and 10 < len(sent.split()) < 60:
            weak.append(sent)

    # Return top 3 weakest-looking sentences
    return weak[:3] if weak else sentences[:2]


# ──────────────────────────────────────────────
#  Counter-Argument Templates
# ──────────────────────────────────────────────

OPENING_CHALLENGES = [
    "I've read your essay and I fundamentally disagree. Let me challenge you on your core thesis: **\"{thesis}\"** — Can you actually defend this? Isn't this an oversimplification?",
    "Interesting perspective, but I take the opposing view. You claim **\"{thesis}\"** — but where is your concrete proof? I'd argue the evidence points in the opposite direction.",
    "I'm going to push back on your entire argument. Your thesis **\"{thesis}\"** rests on shaky foundations. Let me tell you why, and you'll need to defend yourself.",
    "Playing Devil's Advocate here — and I mean it seriously. **\"{thesis}\"** — That's a bold claim. Can you withstand real scrutiny? Let's find out.",
]

FOLLOW_UP_CHALLENGES = [
    # When user gives a weak follow-up
    [
        "That's not convincing enough. You're just restating your original claim without adding new evidence. Try again — *why specifically* does your evidence support this?",
        "You avoided the core issue I raised. Address it directly: {weak_point}",
        "I notice you used vague language like 'many' or 'some'. Give me specific numbers or named sources. Otherwise, this is just an unsupported assertion.",
        "That's a logical fallacy — you're assuming the conclusion in your premise. Reconstruct your argument from scratch.",
    ],
    # When user gives a stronger follow-up
    [
        "Fair point — but you're still ignoring the counterexample of {context_word}. How does your argument hold up when you account for that?",
        "Interesting defense. But consider this: if your claim is true, why do experts like those studying {context_word} consistently reach the opposite conclusion?",
        "You've defended one part, but your argument still fails when applied to real-world scenarios. Give me a concrete example where your thesis works.",
        "You're getting there, but your reasoning still has a gap. Explain the causal mechanism — *how* exactly does this lead to that outcome?",
    ],
    # Escalating challenges
    [
        "Now we're getting somewhere. But let me press harder: what's your strongest piece of evidence? Not your opinion — actual verifiable evidence.",
        "Good — but the burden of proof is still on you. Your opponent (me) has a simpler, more parsimonious explanation. Why should we accept yours over mine?",
        "You've made progress. Final challenge: summarize your entire position in three sentences and address the biggest weakness in your own argument.",
    ]
]

CONCEDE_RESPONSES = [
    "I'll concede that point — you defended it well. But there's still a critical weakness in your argument around {context}. Can you address that?",
    "Strong defense on that point. I'm shifting my attack: your essay fails to account for {context}. This undermines everything you've built.",
    "Reluctantly, I'll give you that one. But your argument still has an Achilles heel — {context}. Address that and we might be close to a resolved debate.",
]

VICTORY_RESPONSES = [
    "🏆 Excellent! You've successfully defended your thesis under pressure. Your argumentation has improved significantly through this debate. Review how you responded to the toughest challenges.",
    "🎯 Well argued! You've held your ground and addressed my core challenges. This is exactly the kind of critical thinking strong essays require.",
    "✅ Strong performance! You faced opposition and built a more nuanced, evidence-backed position than when you started.",
]


# ──────────────────────────────────────────────
#  Context Word Extraction
# ──────────────────────────────────────────────

def _extract_key_noun(text: str) -> str:
    """Extract a meaningful noun from text to use in contextual responses."""
    words = _tokenize_words(text)
    stop_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'it', 'this',
                  'that', 'they', 'we', 'i', 'and', 'or', 'but', 'in', 'on',
                  'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'at'}
    meaningful = [w for w in words if w not in stop_words and len(w) > 4]
    return meaningful[0] if meaningful else "this topic"


# ──────────────────────────────────────────────
#  Main Debate Response Generator
# ──────────────────────────────────────────────

def generate_opening_challenge(essay_text: str, scores: dict) -> dict:
    """
    Generate the AI's opening challenge based on the essay's thesis and weakest areas.
    """
    thesis = extract_thesis(essay_text)
    weak_claims = find_weak_claims(essay_text)

    # Find the lowest-scoring dimension to focus the attack
    if scores:
        weakest_dim = min(scores, key=lambda k: scores.get(k, 50))
        weak_score = scores.get(weakest_dim, 50)
    else:
        weakest_dim = "argument_strength"
        weak_score = 50

    # Build opening message
    opening = random.choice(OPENING_CHALLENGES).format(thesis=thesis)

    # Add a specific challenge on the weakest point if available
    specific_attack = ""
    if weak_claims:
        specific_attack = f'\n\n⚔️ Specifically, I challenge this claim: *"{weak_claims[0]}"* — What concrete evidence supports this?'

    dim_label_map = {
        "coherence": "logical flow",
        "argumentStrength": "argument strength",
        "factualCorrectness": "factual accuracy",
        "originality": "originality",
        "writingQuality": "writing clarity",
    }

    dim_attack = ""
    if weak_score < 70:
        dim_label = dim_label_map.get(weakest_dim, weakest_dim)
        dim_attack = f"\n\n📊 Our evaluation flagged your **{dim_label}** as a key weakness (scored {weak_score}/100). I'll be focusing my attacks there."

    return {
        "role": "ai",
        "message": opening + specific_attack + dim_attack,
        "round": 0,
        "thesis": thesis,
        "weak_claims": weak_claims,
    }


def generate_debate_response(
    essay_text: str,
    user_message: str,
    conversation_history: list[dict],
    scores: dict,
    weak_claims: list[str],
    thesis: str,
) -> dict:
    """
    Generate an AI counter-argument in response to the student's defense.
    Adapts based on the quality and length of the student's response.
    """
    round_num = len([m for m in conversation_history if m.get("role") == "user"])

    user_words = _tokenize_words(user_message)
    word_count = len(user_words)
    context_word = _extract_key_noun(user_message + " " + essay_text)

    # === Determine quality of student's response ===
    has_evidence_marker = any(w in user_message.lower() for w in [
        "because", "since", "evidence", "research", "study", "data",
        "shows", "proves", "according", "example", "instance", "statistic"
    ])
    is_long_response = word_count > 40
    is_very_short = word_count < 15

    # === End of debate after 5 rounds ===
    if round_num >= 5:
        return {
            "role": "ai",
            "message": random.choice(VICTORY_RESPONSES),
            "round": round_num,
            "debate_over": True,
        }

    # === Build response based on quality ===
    if is_very_short:
        # Weak response — push harder
        response = random.choice(FOLLOW_UP_CHALLENGES[0])
        if weak_claims and round_num < len(weak_claims):
            response = response.format(weak_point=f'"{weak_claims[min(round_num, len(weak_claims)-1)]}"')
        else:
            response = response.replace("{weak_point}", "your overall thesis")

    elif has_evidence_marker and is_long_response:
        # Strong response — concede partially, pivot attack
        response = random.choice(CONCEDE_RESPONSES).format(context=context_word)
    elif round_num >= 3:
        # Late stage — escalate
        response = random.choice(FOLLOW_UP_CHALLENGES[2])
    else:
        # Medium response — follow up with targeted challenge
        response = random.choice(FOLLOW_UP_CHALLENGES[1]).format(context_word=context_word)

    # Add a specific quote from the essay occasionally for realism
    if round_num == 2 and weak_claims:
        response += f'\n\n💬 Let me quote your own essay: *"{weak_claims[-1]}"* — Does this survive the scrutiny of real-world evidence?'

    return {
        "role": "ai",
        "message": response,
        "round": round_num,
        "debate_over": False,
    }
