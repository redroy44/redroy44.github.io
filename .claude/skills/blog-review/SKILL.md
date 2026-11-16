---
name: blog-review
description: Review a blog post draft for this site as a critical technical editor, covering correctness, structure, clarity for the target reader, and how it renders. Use when the user asks for feedback on a draft, asks whether a post is ready, or finishes a draft with /blog-draft.
argument-hint: "[path to the post; defaults to the newest draft]"
---

# Post review

Read the whole post before commenting. If no path is given, review the most
recently modified file in `content/blog/` that has `draft = true`, and say
which file you chose.

Review as the sceptical reader the post will actually get: an engineer who
clicked through from r/rust, This Week in Rust or LinkedIn, knows the field,
and will leave or comment the moment something is wrong or slow. Report
findings; do not edit the post unless the author asks you to apply specific
ones.

## What to check

**1. Correctness** (most important)
- Extract each code block and compile or run it where the toolchain is
  available. Report exactly which blocks you ran, which failed, and which you
  could not test.
- Check claims about languages, crates, APIs and protocols against current
  documentation or source. Flag anything stated as fact that you could not
  confirm.
- Check that numbers are consistent with each other and have a stated method.
- Look for the objection a knowledgeable commenter would raise first. Is it
  answered in the post?

**2. The opening**
- Do the first three sentences say what the post delivers and for whom?
- Would the title and description make the right reader click, and do they
  promise only what the post delivers?

**3. Structure**
- State the post's claim in one sentence from what is written. If you cannot,
  that is the main finding.
- For each section: what does it establish, and is it in the right place?
  Name any section that could be cut or merged.
- Is anything the reader needs introduced after it is first used?

**4. Clarity**
- Terms used before they are defined, steps skipped, and places where the
  reader has to guess what "this" or "it" refers to.
- Passages that explain what the reader already knows.
- Long paragraphs that hide the one sentence that matters.

**5. Rendering and metadata**
- Run `zola build --drafts`; it must succeed. Start `mise run drafts` and
  look at the post at phone and desktop widths, in light and dark.
- Code blocks: language tags present, no line so long that the key part is
  hidden off screen on a phone, highlighting applied.
- Images have alt text that says what the image shows. Tables fit or scroll.
- Front matter: `title`, `description` (one sentence, about 160 characters or
  fewer), `date`, tags that match existing ones, `<!-- more -->` after the
  opening paragraph.
- Links resolve (`zola check` for the internal ones).

## How to report

Lead with a verdict in one or two sentences: ready, ready after small fixes,
or needs another pass, and the single most important reason.

Then list findings in order of importance, not in document order. For each:
quote the few words it concerns, say what the problem is, and say what would
fix it. Separate what must change (wrong, broken, misleading) from what is a
suggestion. Do not pad the list; five findings that matter beat twenty that
do not.

Finish with what you verified and what you could not.

## Rules

- Do not rewrite the author's prose or flatten their voice. Suggest the
  change and let them make it.
- Do not praise by default. Mention what works only where it tells the author
  what to keep.
- Do not remove `draft = true`, commit or push.
