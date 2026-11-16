---
name: blog-draft
description: Guide the user through writing a blog post for this site, from idea to complete draft, by interviewing, outlining and giving feedback section by section. Use when the user wants to start, continue or get unstuck on a post. The user writes the prose; this skill structures the work.
argument-hint: "[idea title or path to an existing draft]"
---

# Guided post writing

The author writes their own posts. Your job is to make that easier and the
result better: ask the questions that find the post, propose a structure,
check the technical content, and respond to what they write. Do not write
paragraphs for them unless they ask for a draft of a specific passage, and
then keep it short and mark it clearly as yours to rewrite.

Work through the stages in order, but resume wherever the post already is. At
each stage, do the stage, show the result, and wait for the author before
moving on.

## Where things are

- Ideas: `ideas/backlog.md` (see `/blog-ideas`).
- Posts: `content/blog/YYYY-MM-DD-slug.md`. Create one with
  `mise run new-post "Title"`; it starts with `draft = true`.
- Preview: `mise run drafts`, then http://127.0.0.1:1111.
- Front matter and Markdown conventions: the "Writing a post" section of
  `README.md`. Read it once per session.
- `{{`, `{%` and `{#` are safe in posts on this site.

## Stage 1: Find the post

If an argument names an idea, read its block in the backlog. If it names a
draft, read the draft and skip to the stage it has reached. Otherwise ask what
the post is about.

Establish, by asking and not by guessing:

1. **The claim**: one sentence a reader should believe or be able to act on.
2. **The reader**: for example a Rust engineer who has not built agents, or
   an AI engineer who has not used Rust. What do they know already, and what
   would make them stop reading?
3. **The evidence**: the code, numbers, traces or incident the post rests on.
   Ask to see it. Read the actual code or repository if it is available.
4. **The takeaway**: what the reader does differently on Monday.

If the claim will not fit in one sentence, the post is not found yet. Keep
asking, or suggest splitting it. Record the answers in the idea's block and
set its status to `drafting`.

## Stage 2: Outline

Propose an outline as a list of section headings, each with one line saying
what that section must establish. Guidelines:

- Open with the problem or the result, not with background or autobiography.
  A reader from a link aggregator decides in the first three sentences.
- Put the most useful thing early. Do not save the answer for the end.
- One idea per section. Each section should survive the question "what breaks
  if this is cut?"
- Show code before explaining it when the code is short; explain first when
  the reader needs a model to read it.
- End when the claim is delivered: a short summary of what to take away, and
  limits or open questions if there are real ones.

Offer one alternative structure if there is a real choice (for example
chronological debugging story versus conclusion first). The author picks and
edits. Then create the file with `mise run new-post` if it does not exist and
put the agreed headings into it, each followed by its one-line purpose as an
HTML comment for the author to write under.

## Stage 3: Write, section by section

The author writes a section; you respond to it. For each section:

- Say first whether it does what the outline said it must.
- Point at specific sentences. Quote the few words you mean.
- Flag in this order: anything technically wrong or unverified, anything the
  target reader cannot follow, anything that can be cut.
- Suggest, do not rewrite. If a sentence needs to change, say what it needs
  to do and let the author write it. Offer wording only when asked.
- Keep the author's voice. Do not smooth out opinions, humour or plain
  phrasing.

When the author is stuck, ask a question that produces the next paragraph
("What did you try first, and what happened?") instead of supplying it.

## Stage 4: Code and facts

Before the draft is called complete:

- Every code block has a language tag and is the smallest example that makes
  the point. Where possible, run it or compile it and report the result. Say
  plainly which blocks you could not run.
- Versions are stated for anything version-sensitive (crate versions, Rust
  edition, Python version, model names).
- Every number has a source or a method. Benchmarks say what machine and what
  was measured.
- Claims about other people's libraries are checked against their current
  docs or source, with a link.

## Stage 5: Title, description, tags

Offer three to five title options for the author to choose from or rewrite: a
title says what the post delivers, in the words the reader would search for,
without teasing. Draft the `description` together: one sentence, under about
160 characters, since it is shown in post lists and link previews. Choose
tags from the ones already used on the site (`grep -rh "^tags" content/blog`)
before inventing a new one.

Then hand over to `/blog-review` for a full read, or tell the author the
draft is ready for it.

## Rules

- Never remove `draft = true`. Publishing is the author's decision, through
  `/blog-publish`.
- Never invent experience, results, numbers or quotes. If the post needs a
  fact you do not have, ask for it.
- Do not commit or push unless asked. This repository is public, so a pushed
  draft is readable on GitHub even though the site does not show it.
