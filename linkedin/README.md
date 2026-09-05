# LinkedIn Growth System — Achouak Yassine

## Status

| Capability | State | Blocker |
|---|---|---|
| Voice profile | **Live** | — |
| Strategy + pillars | **Live** | — |
| Profile rewrite (headline/About/Featured) | **Drafted** | Needs your live profile text to audit against |
| Week 1 posts (5 drafts) | **Drafted** | Personal anecdotes need your confirmation |
| Daily engagement playbook | **Live** | — |
| Auto-publishing to LinkedIn | **Blocked** | No `PUBLORA_API_KEY` |
| Reading feeds / who engaged | **Blocked** | No `APIFY_TOKEN` |
| Daily automation | **Blocked** | Depends on the two above |

See `SETUP.md` to unblock the last three.

## Files

- `strategy.md` — positioning, ICP, content pillars, the wedge
- `profile-rewrite.md` — headline options, About section, Featured, banner, skills
- `engagement-playbook.md` — the daily commenting routine (this matters more than posting)
- `week-01/plan.md` — the 7-day calendar
- `week-01/post-*.md` — five finished drafts, one per posting day
- `SETUP.md` — how to turn on publishing and automation
- `audit.py` — runs any draft against the 2026 rules (`python3 linkedin/audit.py <file>`)

Your voice profile lives at `../.claude/references/voice-profile.md` and is
marked `filled: yes`, so every skill in the bundle now writes as you by default.
