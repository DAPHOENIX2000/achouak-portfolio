# Turning on publishing and automation

Right now I can write, audit, and plan. I cannot post, read your feed, or see who
engaged. Three things are missing, in order of how much they unlock.

## 1. Publishing — `PUBLORA_API_KEY` + `LINKEDIN_PLATFORM_ID`

[Publora](https://publora.com) is the posting layer the skills use. LinkedIn's own
API does not hand out personal posting access to individuals, which is why the
bundle routes through a scheduler.

1. Sign up, connect your LinkedIn account
2. Copy the API key, and the platform ID for the connected LinkedIn account
3. Put them in `.claude/.env` (already gitignored):

```
PUBLORA_API_KEY=sk_...
LINKEDIN_PLATFORM_ID=linkedin-...
```

Unlocks: publishing and scheduling posts, comments, and replies.

## 2. Reading — `APIFY_TOKEN`

[Apify](https://apify.com) actors fetch public LinkedIn data without a login. Free
tier covers this easily: roughly $0.001 per post fetch, $0.005 per comment tree.

```
APIFY_TOKEN=apify_api_...
```

Unlocks: auditing your live profile, fetching a post before commenting on it,
`linkedin-thread-monitor` (which of your comments earned author replies),
`linkedin-engager-analytics` (who liked your posts, segmented by ICP fit).

## 3. Python dependencies

```bash
pip install -r .claude/requirements.txt
```

---

## About this environment

One thing to know before you set the automation up: **this session runs in a
disposable cloud container.** It gets reclaimed after a period of inactivity, and
anything not committed to git disappears with it. Credentials in `.claude/.env`
here would not survive either.

So there are two real options for daily posting:

### Option A — Routine (automation lives with Claude)

I can set up a scheduled Routine that fires every morning, starts a fresh session,
drafts the day's post from the plan, audits it, and pushes it to your phone for
approval. You tap approve, it publishes.

Needs: credentials stored as **environment variables on the Claude Code
environment** rather than in a file, so each fresh session inherits them.

This is the one I would recommend, and I can arm it in about two minutes once the
keys exist. Say the word and I will.

### Option B — Local (automation lives on your machine)

Clone this repo, put `.claude/.env` on your own machine, run Claude Code locally.
The skills work identically and the credentials never leave your laptop. You lose
the unattended scheduling unless you set up cron yourself.

---

## What I will not do without you

Even with all the keys, I am not going to publish to your account unattended on
day one. The first week goes out with you approving each post, for two reasons:

1. Two of the five drafts contain a personal story only you can verify. Publishing
   an invented anecdote under your name would be the single worst thing this system
   could do to you.
2. Your voice profile is built from your portfolio copy, not from posts you have
   written. It is a good first approximation and it will be wrong in places. The
   fastest way to fix it is you reacting to five real drafts.

After week one, if the drafts are landing right, tell me and I will move to
publishing on a schedule with a notification rather than an approval gate. That is
your call to make, not mine to assume.
