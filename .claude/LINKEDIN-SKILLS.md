# LinkedIn Skills (vendored)

Eleven LinkedIn content skills from
[sergebulaev/linkedin-skills](https://github.com/sergebulaev/linkedin-skills),
copied into this repo so they load automatically as project skills for anyone
working in `achouak-portfolio` — no marketplace install or network access needed.

- Upstream version: `1.0.29`
- Upstream commit: `388f0c3dba63a1156ce906e8e6fb2a5c2b0dde0f`
- License: MIT — see `LICENSE-linkedin-skills`

## Skills

| Skill | What it does |
|---|---|
| `linkedin-post-writer` | Drafts a post from scratch using 20+ hook formulas |
| `linkedin-comment-drafter` | Writes comments on a specific post |
| `linkedin-reply-handler` | Drafts thread replies (handles LinkedIn's 2-level flattening) |
| `linkedin-humanizer` | Rewrites AI-sounding copy; `--mode audit` for a pre-publish check |
| `linkedin-hook-extractor` | Reverse-engineers the formula behind a viral post |
| `linkedin-content-planner` | Builds a 7-day posting plan |
| `linkedin-thread-monitor` | Tracks author replies in the warm-reply window |
| `linkedin-engager-analytics` | Segments likers/commenters by ICP |
| `linkedin-profile-optimizer` | Rewrites headline, About, featured sections |
| `linkedin-employee-advocacy` | Plans a team advocacy program |
| `linkedin-repurposer` | Converts content from other platforms |

Ask for what you want in plain language ("write me a LinkedIn post about X",
"audit this draft") and the matching skill triggers on its own.

## Layout

The skills cite shared files with paths relative to their own directory
(`../../references/hook-formulas.md`), so the upstream root layout is preserved
one level up from `skills/`:

```
.claude/
├── skills/<skill>/SKILL.md   # the 11 skills
├── references/               # shared: hook formulas, voice rules, benchmarks
├── lib/                      # Apify / Publora / Pixfaro clients, URL parser
├── scripts/                  # post_comment.py, schedule_post.py
├── requirements.txt          # requests, python-dotenv
└── .env.example              # API keys the optional network features read
```

Do not move `references/`, `lib/`, or `scripts/` — the relative links break.

## Optional API setup

Drafting and auditing work with no setup. Only the features that read live
LinkedIn data or publish need keys: copy `.claude/.env.example` to
`.claude/.env` and fill in `APIFY_TOKEN` (fetching posts/comments/engagers)
and/or `PUBLORA_API_KEY` + `LINKEDIN_PLATFORM_ID` (scheduling). `.claude/.env`
is gitignored. Python deps: `pip install -r .claude/requirements.txt`.

## Updating

```bash
git clone --depth 1 https://github.com/sergebulaev/linkedin-skills.git /tmp/ls
rm -rf .claude/skills .claude/references .claude/lib .claude/scripts
cp -r /tmp/ls/{skills,references,lib,scripts} .claude/
cp /tmp/ls/{requirements.txt,requirements-lock.txt,.env.example} .claude/
rm -f .claude/scripts/sync_codex_marketplace.py   # upstream-only tooling
```
