---
name: blog-publish
description: Take a finished blog post draft through the pre-publish checklist for this site, publish it on the author's confirmation, and prepare the text for sharing it. Use when the user says a post is ready to publish, go live or ship.
argument-hint: "[path to the post]"
---

# Publish a post

Publishing is outward-facing: once the change reaches `master`, the workflow
deploys it and the feed announces it. Run the checks, show the results, and
get an explicit yes from the author before removing `draft = true` and again
before anything is pushed or merged to `master`.

## 1. Checks

Run all of these and report each as pass or fail with the detail:

- The post has been through `/blog-review`, or the author chooses to skip it.
- Front matter: `title`; `description` of one sentence, about 160 characters
  or fewer; `date` set to the intended publication date (ask; offer today);
  at least one tag, matching tags already in use; `<!-- more -->` present.
- No leftover markers: search the post for `PLACEHOLDER`, `TODO`, `FIXME`,
  `XXX` and outline comments left over from drafting.
- The file name's date prefix and slug are what the author wants. The slug is
  the permanent URL (`/blog/<slug>/`); changing it later breaks links.
- `zola build` succeeds with the draft flag removed, and `zola check` passes
  for internal links. Report external link warnings.
- The built page has the right `<title>`, description, canonical URL and
  `og:image`. Run `mise run og` and look at `static/img/og/<slug>.png`: the
  title must fit the card without being cut off. If the post sets
  `extra.image`, that file exists.
- `mise run validate` passes on the built site.
- This repository is public: the post, its images and code samples contain
  nothing private (keys, client names, internal hostnames).

Stop at the first failure the author needs to decide on.

## 2. Publish

On the author's yes:

1. Remove the `draft = true` line and set the confirmed `date`.
2. Set the idea's status to `published` in `ideas/backlog.md` if it has one.
3. Build once more and show the post's URL path.
4. Commit with a message like `Publish: <post title>`. Then follow the
   author's usual route to `master` (ask if it is not known: direct push, or a
   branch and pull request). Do not push or open a pull request without being
   asked.

## 3. After it is live

Once the author confirms the deploy finished, fetch the live URL and check it
returns the post, and that the post appears in `/atom.xml`.

## 4. Sharing text

Offer drafts for the author to edit, one per place they plan to post. These
are the author's public words, so keep them short, factual and in their voice,
and never post anything yourself.

- **r/rust**: a plain title that states what the post covers, no clickbait.
  If a comment is wanted, two or three sentences on what was built and what
  the author would like feedback on. Remind the author to check the
  subreddit's current self-promotion rules.
- **This Week in Rust**: submissions go through a pull request to the
  `rust-lang/this-week-in-rust` repository; give the title and URL in the
  format its current draft uses, and tell the author to check the
  contribution notes there.
- **LinkedIn**: three to five short lines for a mixed audience of engineers
  and hiring managers: the problem, what the post shows, the link. No
  hashtag walls.

## Rules

- Never publish, push, merge or post without the author's explicit
  confirmation in this conversation.
- Do not edit the post's prose at this stage beyond what the author asks for.
