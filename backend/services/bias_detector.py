"""
Bias & Hallucination Detection Service
Detects fabricated facts, unverifiable references, and biased arguments.
"""

import re


# ──────────────────────────────────────────────
#  Hallucination Detection
# ──────────────────────────────────────────────

# Patterns that often indicate fabricated references
FAKE_REFERENCE_PATTERNS = [
    # Fake study/report references
    r'(?:according\s+to|as\s+reported\s+by)\s+(?:a|the)\s+\d{4}\s+(?:study|report|survey|analysis)\s+by\s+(?:the\s+)?[A-Z][a-z]+',
    r'(?:the|a)\s+(?:University\s+of\s+[A-Z][a-z]+|[A-Z][a-z]+\s+University)\s+(?:study|report|research)\s+(?:from|in|of)\s+\d{4}',
    r'Dr\.\s+[A-Z][a-z]+\s+[A-Z][a-z]+(?:\'s)?\s+(?:groundbreaking|landmark|seminal)\s+(?:study|research|work)',
]

# Patterns suggesting made-up statistics
SUSPICIOUS_STAT_PATTERNS = [
    r'\b(?:exactly|precisely)\s+\d+(?:\.\d+)?%\s+of',
    r'\b(?:9[5-9]|100)%\s+of\s+all\s+(?:scientists|experts|researchers|doctors)\s+(?:agree|confirm|support)',
    r'\b\d+(?:\.\d+)?\s+(?:billion|trillion|million)\s+(?:people|individuals)\s+(?:are|were|have)\b',
]

# Known unreliable claim patterns
HALLUCINATION_SIGNALS = [
    (r'WHO\s+(?:report|study|data)\s+(?:from|in|of)\s+20(?:2[4-9]|[3-9]\d)', 
     "References a WHO report from a future/very recent date that may not exist"),
    (r'(?:NASA|WHO|UN|UNESCO)\s+(?:confirmed|announced|declared)\s+(?:that|in)\s+20(?:2[5-9]|[3-9]\d)',
     "References an unverifiable announcement from an international organization"),
    (r'Nobel\s+(?:Prize|Laureate)\s+(?:winner|winning)\s+(?:Dr\.|Professor)\s+[A-Z][a-z]+\s+[A-Z][a-z]+',
     "References a specific Nobel laureate that may be fabricated"),
]


def detect_hallucinations(text: str) -> list[dict]:
    """
    Detect potentially hallucinated (fabricated) facts in the essay.
    Checks for fake references, suspicious statistics, and unverifiable claims.
    """
    issues = []
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    
    for i, sentence in enumerate(sentences):
        # Check fake reference patterns
        for pattern in FAKE_REFERENCE_PATTERNS:
            if re.search(pattern, sentence, re.IGNORECASE):
                # Determine which paragraph this is in
                text_before = text[:text.find(sentence)]
                para_num = text_before.count('\n\n') + 1
                
                issues.append({
                    "type": "hallucination",
                    "severity": "high",
                    "description": f"Potentially fabricated reference detected. The cited study or source could not be verified.",
                    "location": f"Paragraph {para_num}",
                })
                break
        
        # Check suspicious statistics
        for pattern in SUSPICIOUS_STAT_PATTERNS:
            if re.search(pattern, sentence, re.IGNORECASE):
                text_before = text[:text.find(sentence)]
                para_num = text_before.count('\n\n') + 1
                
                issues.append({
                    "type": "hallucination",
                    "severity": "medium",
                    "description": "Statistic appears overly precise or implausible without a cited source.",
                    "location": f"Paragraph {para_num}",
                })
                break
        
        # Check known hallucination signals
        for pattern, desc in HALLUCINATION_SIGNALS:
            if re.search(pattern, sentence, re.IGNORECASE):
                text_before = text[:text.find(sentence)]
                para_num = text_before.count('\n\n') + 1
                
                issues.append({
                    "type": "hallucination",
                    "severity": "high",
                    "description": desc,
                    "location": f"Paragraph {para_num}",
                })
                break
    
    return issues


# ──────────────────────────────────────────────
#  Bias Detection
# ──────────────────────────────────────────────

STRONG_POSITIVE_MARKERS = [
    r'\b(?:always|every|all|undeniably|unquestionably|obviously|clearly|certainly)\b',
    r'\b(?:perfect|flawless|without\s+doubt|beyond\s+question|absolute)\b',
    r'\b(?:the\s+best|the\s+only|the\s+greatest|the\s+most\s+important)\b',
]

STRONG_NEGATIVE_MARKERS = [
    r'\b(?:never|none|nothing|no\s+one|nobody|impossible|terrible)\b',
    r'\b(?:worst|disastrous|catastrophic|completely\s+wrong|utterly\s+failed)\b',
    r'\b(?:dangerous|harmful|destructive|toxic|corrupt)\b',
]

ONE_SIDED_PATTERNS = [
    r'\b(?:everyone\s+(?:knows|agrees|understands)|it\s+is\s+(?:obvious|clear)\s+that)\b',
    r'\b(?:only\s+(?:fools|idiots)|anyone\s+who\s+(?:disagrees|opposes))\b',
    r'\b(?:there\s+is\s+no\s+(?:argument|debate|question)\s+(?:that|about))\b',
]


def detect_bias(text: str) -> list[dict]:
    """
    Detect biased arguments in the essay by analyzing:
    - One-sided argument patterns
    - Extreme positive/negative language balance
    - Dismissive language toward opposing views
    """
    issues = []
    text_lower = text.lower()
    paragraphs = re.split(r'\n\s*\n', text.strip())
    
    # Count positive vs negative markers
    positive_count = sum(len(re.findall(p, text_lower)) for p in STRONG_POSITIVE_MARKERS)
    negative_count = sum(len(re.findall(p, text_lower)) for p in STRONG_NEGATIVE_MARKERS)
    
    total_markers = positive_count + negative_count
    
    # Check for one-sided language
    if total_markers >= 4:
        if positive_count > 0 and negative_count == 0:
            issues.append({
                "type": "bias",
                "severity": "medium",
                "description": f"Essay shows strongly positive framing ({positive_count} positive markers) without acknowledging any limitations or opposing views.",
                "location": "Throughout",
            })
        elif negative_count > 0 and positive_count == 0:
            issues.append({
                "type": "bias",
                "severity": "medium",
                "description": f"Essay shows strongly negative framing ({negative_count} negative markers) without acknowledging any positive aspects.",
                "location": "Throughout",
            })
        elif total_markers >= 8:
            issues.append({
                "type": "bias",
                "severity": "low",
                "description": "Essay uses frequent absolute language. Consider using more measured, nuanced expressions.",
                "location": "Throughout",
            })
    
    # Check for one-sided dismissive patterns
    for pattern in ONE_SIDED_PATTERNS:
        matches = re.findall(pattern, text_lower)
        if matches:
            # Find which paragraph
            for j, para in enumerate(paragraphs, 1):
                if re.search(pattern, para.lower()):
                    issues.append({
                        "type": "bias",
                        "severity": "medium",
                        "description": f"Dismissive language detected that shuts down opposing viewpoints rather than addressing them.",
                        "location": f"Paragraph {j}",
                    })
                    break
    
    # Check for generalization about groups
    group_generalization = re.findall(
        r'\b(?:all|every|no)\s+(?:men|women|students|teachers|scientists|politicians|Americans|Indians|people)\s+(?:are|is|do|have|think|believe|want)\b',
        text_lower
    )
    if group_generalization:
        issues.append({
            "type": "bias",
            "severity": "low",
            "description": "Broad generalization about a group of people detected. Avoid sweeping statements about entire demographics.",
            "location": "Multiple locations",
        })
    
    return issues
