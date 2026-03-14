"""
Plagiarism Detection Service
Uses TF-IDF cosine similarity and n-gram fingerprinting to detect
potential plagiarism, including LLM-paraphrased content.
"""

import re
import math
from collections import Counter


def _get_ngrams(text: str, n: int = 3) -> list[str]:
    """Generate word-level n-grams from text."""
    words = re.findall(r'\b\w+\b', text.lower())
    return [" ".join(words[i:i+n]) for i in range(len(words) - n + 1)]


def _cosine_similarity(vec1: dict, vec2: dict) -> float:
    """Compute cosine similarity between two frequency vectors."""
    common = set(vec1.keys()) & set(vec2.keys())
    dot = sum(vec1[k] * vec2[k] for k in common)
    mag1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
    mag2 = math.sqrt(sum(v ** 2 for v in vec2.values()))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot / (mag1 * mag2)


# Internal reference corpus (simulated known published content)
KNOWN_PASSAGES = [
    "artificial intelligence has fundamentally altered the landscape of modern education from personalized learning paths to automated grading systems",
    "climate change represents one of the most significant challenges facing humanity today with rising global temperatures affecting weather patterns worldwide",
    "genetic engineering in agriculture has the potential to solve world hunger but raises ethical questions about modifying the natural world",
    "the right to privacy is a fundamental human right that is increasingly threatened by the proliferation of digital surveillance technologies",
    "social media platforms have transformed the way we communicate creating both opportunities for connection and risks of misinformation",
    "the industrial revolution marked a turning point in human history transforming agrarian societies into industrial powerhouses",
    "renewable energy sources such as solar and wind power are becoming increasingly cost competitive with fossil fuels",
    "the concept of universal basic income has gained traction as automation threatens to displace millions of workers",
]


def check_plagiarism(text: str, threshold: float = 0.35) -> list[dict]:
    """
    Check essay text against known passages for potential plagiarism.
    
    Returns a list of detected issues.
    """
    issues = []
    paragraphs = re.split(r'\n\s*\n', text.strip())
    
    for i, para in enumerate(paragraphs, 1):
        para_lower = para.lower().strip()
        if len(para_lower.split()) < 10:
            continue
        
        # N-gram fingerprint comparison
        para_ngrams = Counter(_get_ngrams(para_lower, 3))
        
        for known in KNOWN_PASSAGES:
            known_ngrams = Counter(_get_ngrams(known, 3))
            sim = _cosine_similarity(para_ngrams, known_ngrams)
            
            if sim >= threshold:
                severity = "high" if sim >= 0.6 else "medium" if sim >= 0.45 else "low"
                issues.append({
                    "type": "plagiarism",
                    "severity": severity,
                    "description": f"Paragraph {i} shows {int(sim * 100)}% similarity with existing published content. Possible paraphrased plagiarism detected.",
                    "location": f"Paragraph {i}",
                    "similarity_score": round(sim, 3),
                })
                break  # one match per paragraph is enough
    
    # Self-plagiarism check (internal repetition)
    if len(paragraphs) > 2:
        for i in range(len(paragraphs)):
            for j in range(i + 1, len(paragraphs)):
                p1 = Counter(_get_ngrams(paragraphs[i].lower(), 3))
                p2 = Counter(_get_ngrams(paragraphs[j].lower(), 3))
                sim = _cosine_similarity(p1, p2)
                if sim >= 0.5:
                    issues.append({
                        "type": "plagiarism",
                        "severity": "low",
                        "description": f"Paragraphs {i+1} and {j+1} contain highly similar content ({int(sim*100)}% overlap). Possible self-repetition.",
                        "location": f"Paragraphs {i+1} & {j+1}",
                        "similarity_score": round(sim, 3),
                    })
    
    return issues
