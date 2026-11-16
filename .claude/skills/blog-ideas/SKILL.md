---
name: blog-ideas
description: Capture, shape and prioritise blog post ideas in ideas/backlog.md. Use when the user mentions something that could become a post, wants to record an idea, asks what to write next, or wants to mine recent work (commits, PRs, notes, a conversation) for post topics.
argument-hint: "[idea text | list | next | mine <path or topic>]"
---

# Blog ideas

The backlog is `ideas/backlog.md`. It is git-ignored because this repository
is public, so it may not exist yet: create it if missing, starting from the
format in `ideas/README.md`. Read it before doing anything, and keep that
format: one `##` block per idea. Never delete an idea; set `status: dropped` instead.

The site's readers are working engineers, plus hiring managers and potential
clients who arrive from r/rust, This Week in Rust or LinkedIn. The author
builds production AI agents in Rust and is adding Python AI engineering. An
idea is good for this blog when it shows something the author actually built,
measured or debugged.

Pick the mode from the arguments. With no arguments, ask which the user wants.

## Capture (the user gives an idea)

1. Write it down immediately as a new block with `status: raw`, today's date,
   and whatever fields the user's words already answer. Use their phrasing.
   Do not make them answer questions before the idea is saved.
2. Check the backlog for an existing idea that overlaps. If one does, say so
   and ask whether to merge.
3. Then offer to shape it now or leave it raw.

## Shape (turn a raw idea into one worth drafting)

Ask these one or two at a time, and write the answers into the block as you
go. Stop when the user runs out of answers; an honest gap is useful.

- **Claim**: what should a reader believe or be able to do afterwards, in one
  sentence? "Notes on X" is a topic, not a claim.
- **Reader**: who is it for, and what do they already know?
- **Evidence**: what can you show? Code that runs, a benchmark, a trace, a
  production incident, a before and after.
- **Why you**: what do you know here that the docs and the top search results
  do not say?
- **Size**: is this one post, or is it two?

Set `status: shaped` only when claim, reader and evidence are all filled in.
If the evidence is missing, say what experiment or measurement would supply it
and record that under `notes`.

## List

Show the backlog grouped by status as a short table: title, status, claim.
Leave out `published` and `dropped` unless asked.

## Next (what should I write?)

Recommend one shaped idea and give the reason in two sentences. Prefer ideas
where the evidence already exists, the claim is specific, and the topic fits
what the author wants to be known for. Name one runner-up. If nothing is
shaped, say so and offer to shape the most promising raw idea.

## Mine (find ideas in existing material)

The user points at a repository, a set of commits, notes or a pasted thread.
Read it and propose at most five candidate ideas, each as a working title plus
a one-sentence claim and the specific material it came from. Look for: bugs
that took more than an hour, decisions with a rejected alternative, numbers
that surprised, things the author had to explain to someone twice, and library
behaviour that contradicts its docs. Add only the ones the user picks.

## Rules

- These are the author's ideas. Record and sharpen them; do not pad the
  backlog with topics the author did not raise or pick.
- Do not write post prose here. Drafting is `/blog-draft`.
- After editing the backlog, say in one line what changed.
