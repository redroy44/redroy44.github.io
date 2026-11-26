# Post ideas

Format and status values: see `ideas/README.md`. This file is public.

## Brain, dispatcher, crew: a multi-agent coding workflow that survives context clears
- status: raw
- added: 2026-11-26
- source: the author's claude-skills repo (brain, crew-dispatch, herdr-crew, ticket-groom, spec-review skills)
- claim: (candidate, not confirmed) In a multi-agent coding setup, most of the design is about what survives a context clear: hand off through files (brief, spec, queue, inbox), not through an agent's memory.
- reader: engineers already using Claude Code or similar agents at work who want to run more than one task at a time
- evidence: the skills themselves; the flow brain → queue.json → dispatcher → coordinator → crew (implementer + reviewer on a different vendor's model); the decision inbox that batches every crew's questions into one pass; the WIP limit that "counts the user's attention, not agents"; worktrunk worktrees with post-start hooks; Herdr tabs and panes as the control surface
- notes: Name Herdr and worktrunk; they are part of the story. Strip all employer data: repo and org names, the Jira prefix and ticket numbers, internal hosts, services and environment details. The workflow is the author's own. Companion post on the retro loop below; this one can mention it in one paragraph.

## Every review finding that comes back is a missing rule: a retro loop for agent crews
- status: raw
- added: 2026-11-26
- source: the pr-retro skill and its RETRO.md log in claude-skills
- claim: (candidate, not confirmed) Classify review findings by cause, log them per PR, and add a rule only when a class repeats; over N PRs that should show in fewer rounds per PR.
- reader: same as above, plus anyone tuning agent prompts or skills by hand
- evidence: RETRO.md so far has 4 PRs (rounds 2+1, 2+6, 1+2, 5+1). Not yet enough: rounds have not gone down. "Stale async continuation after reset" appeared x2 with no rule, then x6, and only then got a rule, which suggests the threshold for adding a rule was too slow.
- notes: Wait for 10-15 merged PRs. Then check whether classes stop recurring after their rule lands and whether rounds per PR fall. A negative result is still a post. Same stripping rules as above: ticket and PR numbers become "PR 1, PR 2…", no repo names.
