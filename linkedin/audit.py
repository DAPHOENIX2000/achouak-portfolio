#!/usr/bin/env python3
"""Audit a LinkedIn draft against the 2026 rules in .claude/references/.

Usage: python3 linkedin/audit.py linkedin/week-01/post-1-tue.md
Reads the block-quoted draft (lines starting '> ') out of a draft file.
"""
import re, sys, pathlib

BANNED_VOCAB = ["leverage","utilize","facilitate","streamline","robust","seamless",
    "delve","unlock","harness","foster","cultivate","fundamentally","essentially",
    "ultimately","crucially","notably","ecosystem","paradigm","realm","tapestry",
    "game-changer","game changer","deep dive","at the end of the day",
    "in today's fast-paced","thrilled to announce","excited to share","passionate about"]
BAD_OPENERS = ["here's what","here's how","stop ","it's not "]
REVEAL_BRIDGES = ["the result?","plot twist:","here's the thing","what nobody tells you",
    "what most people miss","this is where it gets interesting","the real question is"]

def audit(text):
    issues, notes = [], []
    lines = [l for l in text.split("\n") if l.strip()]
    first = lines[0] if lines else ""

    # Hook rules
    if first.rstrip().endswith("?"):
        issues.append("FAIL line 1 is a question (-34% median likes)")
    if first.isupper():
        issues.append("FAIL line 1 is all caps")
    if any(first.lower().startswith(b) for b in BAD_OPENERS):
        issues.append(f"FAIL banned opener: {first[:40]!r}")
    NUMWORDS = r"\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|hundred|thousand|million|first|second|third)\b"
    has_num = re.search(r"\d", first) or re.search(NUMWORDS, first, re.I)
    notes.append("PASS number in line 1 (+34%)" if has_num
                 else "WARN no number in line 1 (number-first is +34%)")

    # Density rule
    contrasts = len(re.findall(r"\b(?:is|it's|its|was|are)\s+not\s+\w+[,.]?\s+(?:it|they)?\s*(?:is|it's|are)\b|\bnot\s+\w+\.\s+It\s+is\b", text, re.I))
    if contrasts > 1:
        issues.append(f"FAIL {contrasts} 'not X, it's Y' contrasts (max 1)")
    for b in REVEAL_BRIDGES:
        if b in text.lower():
            issues.append(f"FAIL reveal bridge: {b!r}")

    # Question placement
    qs = [i for i, l in enumerate(lines) if l.rstrip().endswith("?")]
    if qs and qs[-1] != len(lines) - 1 and not lines[-1].startswith("#"):
        notes.append("WARN last question is not the final line")
    notes.append("PASS closing question (+3%)" if qs else "WARN no closing question")

    # Vocab
    for w in BANNED_VOCAB:
        if w in text.lower():
            issues.append(f"FAIL banned vocab: {w!r}")

    # Em dash density
    words = len(text.split())
    em = text.count("—")
    cap = max(1, words // 100)
    if em > cap:
        issues.append(f"FAIL {em} em dashes, cap is {cap} for {words} words")

    # Length
    n = len(text)
    notes.append(f"{'PASS' if n >= 1000 else 'WARN'} {n} chars "
                 f"({'1.18x reach lift' if n >= 1000 else 'under 1,000, no length lift'})")
    sents = len(re.findall(r"[.!?](?:\s|$)", text))
    notes.append(f"{'PASS' if sents >= 20 else 'WARN'} {sents} sentences "
                 f"({'1.14x lift' if sents >= 20 else 'under 20'})")

    # Hook window
    notes.append(f"{'PASS' if len(first) <= 210 else 'WARN'} hook is {len(first)} chars (fold at 210)")

    # Links
    if re.search(r"https?://", text):
        issues.append("FAIL external link in body (move to first comment)")

    return issues, notes

for path in sys.argv[1:]:
    raw = pathlib.Path(path).read_text()
    draft = "\n".join(l[2:] if l.startswith("> ") else "" for l in raw.split("\n") if l.startswith(">"))
    if "[[" in draft:
        print(f"\n=== {path} ===\n  SKIP scaffold, has unfilled [[slots]]")
        continue
    issues, notes = audit(draft.strip())
    print(f"\n=== {path} ===")
    for n in notes: print("  " + n)
    for i in issues: print("  " + i)
    if not issues: print("  -> CLEAN")
