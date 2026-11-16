---
name: retro
description: Run a short retrospective and turn what was learned into lasting changes. Use at the end of a working session on this site ("retro", "what did we learn", "wrap up"), or after a post has been live for a while to record how it did. Updates CLAUDE.md, the skills in .claude/skills/, mise tasks or the ideas backlog, with the author's approval.
argument-hint: "[session | post <slug>]"
---

# Retro

A retro is only worth doing if something changes afterwards. The output is a
small number of concrete edits to files in this repository, not a report.

With no argument, run a session retro. `post <slug>` runs a post retro.

## Session retro

Look back over this conversation. Use what actually happened; do not invent
friction to have something to say.

1. **Collect** (silently). Look for:
   - corrections: places the author said no, redirected you, or redid your
     work. These matter most.
   - repeats: anything explained or looked up more than once, in this session
     or (from CLAUDE.md and git history) earlier ones.
   - surprises: tool, Zola, Tera or CI behaviour that differed from what you
     assumed and cost time.
   - manual steps: a sequence of commands run by hand more than once.
   - things that worked and should be kept doing on purpose.

2. **Report** in a few lines: what went well, what cost time, and at most
   five proposed changes. For each change give the file, the edit in one
   sentence, and the incident it comes from. If nothing needs changing, say
   so and stop.

3. **Choose the right home** for each lesson:
   - a fact about this project or a standing preference of the author:
     `CLAUDE.md`
   - how a writing workflow should behave: the matching skill in
     `.claude/skills/`
   - a repeated command sequence: a task in `mise.toml` or `mise-tasks/`
   - something a human contributor needs: `README.md`
   - a post topic that came up: `ideas/backlog.md`, through `/blog-ideas`

4. **Apply** only the changes the author approves. Keep each edit short and
   specific. Record what was said and when, and label your own
   interpretation as yours. Prefer correcting or deleting an existing line
   over adding a new one, and remove any guidance the session showed to be
   wrong or out of date.

5. Do not commit or push unless asked.

### What not to record

- One-off events that will not recur, and status notes about finished work.
- Soft remarks treated as rules. If you cannot tell whether a comment was an
  instruction, ask once.
- Anything already covered by an existing line; tighten that line instead.
- Secrets, or personal details beyond what the author has put in the repo.

## Post retro

For a post that has been live long enough to judge, usually a week or more.

1. Read the post and its block in `ideas/backlog.md`.
2. Ask the author, one or two questions at a time:
   - Where was it shared, and what happened in each place (votes, comments,
     reshares, traffic if they track it)?
   - Which comments or questions came up more than once?
   - Did anyone point out an error or a missing case? Was the post corrected?
   - Did it lead to anything: a contact, an issue, a follow-up request?
   - What would they do differently in writing or sharing it?
3. Write a `retro:` field into the idea's block with the date and the
   answers in the author's words, kept to a few lines.
4. Turn recurring questions and follow-ups into new `raw` ideas through
   `/blog-ideas`.
5. If the answers show a pattern across posts (a title style that works, a
   venue that does not, a recurring review gap), propose one edit to the
   relevant skill and apply it on approval.

Do not fetch analytics or post anywhere yourself. Use the numbers the author
gives you.
