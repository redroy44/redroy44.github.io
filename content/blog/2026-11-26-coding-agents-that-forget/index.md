+++
title = "Coding agents that forget on purpose"
description = "How I run several coding agents on real tickets: a brain session writes the spec, a dispatcher keeps the queue, and crews build and review. Every context gets cleared, so everything that matters lives in files."
date = 2026-11-26
draft = true

[taxonomies]
tags = ["ai-agents", "claude-code", "workflow"]
+++

Most days I have two crews of coding agents working on two tickets, and a
third session helping me design the next one. None of them remembers
anything from yesterday. Most of them do not even remember this morning.

That is the design. It took me a few weeks to get there, and the main lesson
was simple: an agent's context is a scratchpad, not a place to keep
decisions. If a decision matters, it goes into a file the moment it is made.

The setup is a few Claude Code skills that run inside
[Herdr](https://herdr.dev), a terminal workspace for agents, on top of git worktrees
managed by [worktrunk](https://worktrunk.dev). This post follows one ticket through it.

<!-- more -->

## One long session does not scale

I started the way most people do. One Claude session per ticket: read the
ticket, talk about the design, write the code, review it, fix it, open the
PR. For small tickets this is fine.

For a real ticket it falls apart in two ways. First, the context fills up
with dead ends. By the time the agent writes code, it remembers the option
we rejected as clearly as the one we chose, and sometimes it builds the wrong
one. When the context gets compacted, the decision from an hour ago is gone.
Second, I can only follow one session at a time. While it works, I wait.

So I split the work by role, and I made every role cheap to throw away.

## The shape

<figure class="diagram">
<svg viewBox="0 0 440 532" role="img" aria-labelledby="flow-title">
<title id="flow-title">A ticket goes to the brain, which writes a spec and a queue entry. The context is cleared. The dispatcher reads the queue and starts one coordinator per ticket. Each coordinator runs a crew that ends in a PR. Coordinators send questions to the user through inbox files.</title>
<defs><marker id="flow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker></defs>
<rect class="box" x="210" y="8" width="100" height="28" rx="14"/>
<text class="t" x="260" y="27">Ticket</text>
<path class="line" d="M260 36V57" marker-end="url(#flow-head)"/>
<rect class="box key" x="140" y="60" width="240" height="56" rx="8"/>
<text class="t b" x="260" y="83">Brain</text>
<text class="m" x="260" y="103">grooms, grills, writes the spec</text>
<path class="line dash clear" d="M10 134H430"/>
<text class="m start" x="12" y="127">context cleared</text>
<path class="line" d="M260 116V149" marker-end="url(#flow-head)"/>
<rect class="box file" x="140" y="152" width="240" height="48" rx="6"/>
<text class="t mono" x="260" y="172">worktree: brief + spec</text>
<text class="t mono" x="260" y="190">queue.json: ready</text>
<path class="line" d="M260 200V229" marker-end="url(#flow-head)"/>
<rect class="box key" x="140" y="232" width="240" height="56" rx="8"/>
<text class="t b" x="260" y="255">Dispatcher</text>
<text class="m" x="260" y="275">keeps the queue, limit: 2</text>
<rect class="box" x="10" y="240" width="90" height="40" rx="20"/>
<text class="t b" x="55" y="265">You</text>
<path class="line" d="M103 260H137" marker-start="url(#flow-head)" marker-end="url(#flow-head)"/>
<path class="line" d="M230 288L198 327" marker-end="url(#flow-head)"/>
<path class="line" d="M290 288L322 327" marker-end="url(#flow-head)"/>
<rect class="box" x="140" y="330" width="110" height="48" rx="8"/>
<text class="t" x="195" y="352">Coordinator</text>
<text class="m" x="195" y="369">ticket A</text>
<rect class="box" x="270" y="330" width="110" height="48" rx="8"/>
<text class="t" x="325" y="352">Coordinator</text>
<text class="m" x="325" y="369">ticket B</text>
<path class="line dash" d="M140 354H55V283" marker-end="url(#flow-head)"/>
<text class="m start" x="60" y="346">inbox file</text>
<path class="line" d="M195 378V407" marker-end="url(#flow-head)"/>
<path class="line" d="M325 378V407" marker-end="url(#flow-head)"/>
<rect class="box" x="140" y="410" width="110" height="60" rx="8"/>
<text class="t" x="195" y="432">Crew</text>
<text class="m" x="195" y="449">implementer</text>
<text class="m" x="195" y="464">+ reviewer</text>
<rect class="box" x="270" y="410" width="110" height="60" rx="8"/>
<text class="t" x="325" y="432">Crew</text>
<text class="m" x="325" y="449">implementer</text>
<text class="m" x="325" y="464">+ reviewer</text>
<path class="line" d="M195 470V495" marker-end="url(#flow-head)"/>
<path class="line" d="M325 470V495" marker-end="url(#flow-head)"/>
<rect class="box" x="165" y="498" width="60" height="26" rx="13"/>
<text class="t" x="195" y="516">PR</text>
<rect class="box" x="295" y="498" width="60" height="26" rx="13"/>
<text class="t" x="325" y="516">PR</text>
</svg>
<figcaption>One ticket, four roles. Only files cross the dashed line.</figcaption>
</figure>

Each box is a separate session, and each one has a short list of things it
must not do. That list matters more than the list of things it does.

| Role | Does | Never does |
| --- | --- | --- |
| Brain | Checks one ticket against the code, argues the design with me, writes the spec | Write production code |
| Dispatcher | Keeps the queue, starts coordinators, collects questions for me | Design, run a crew, write code |
| Coordinator | Runs one crew from the first commit to a green PR | Write code |
| Crew | An implementer that writes the code, a reviewer that reads it | Push, merge, or post on GitHub |

## The brain: think, write it down, leave

The brain gets one ticket. Its first step is boring and important: it moves
into the ticket's worktree before it reads any code. If the worktree does not
exist, it creates one with `wt switch --create`. A worktrunk hook copies
`.env` and the build caches into it, so the crew does not start with a cold
build. Whatever the brain writes from now on lands where the crew will look.

Then it grooms the ticket. Many of our tickets are written with AI help, and
they can be confidently wrong. The brain lists every claim in the ticket ("the
tool returns X", "field Y is missing") and marks each one as true with a
`file:line`, false with what the code really does, or not checked. A crew
that starts from a wrong ticket builds the wrong thing very efficiently.

Next, it grills me on the design. This is the part I enjoy. Every time we
settle something, the brain writes one line into the brief: the decision, the
options we rejected, and why. It writes the line right away, not at the end,
because the end is exactly when the context is fullest.

The decisions then move into the spec. I use
[OpenSpec](https://openspec.dev), so that means `proposal.md` and `design.md` in a
change folder. The skill says it plainly: a decision that stays only in the
brief or in the conversation is lost.

The hand-off is a commit, a clean `git status`, and one entry in the queue:

```json
{
  "ticket": "TICKET-142",
  "state": "ready",
  "mode": "openspec",
  "level": 2,
  "worktree": "~/code/app.ticket-142",
  "input": "openspec/changes/ticket-142-retry-on-timeout"
}
```

The last thing the brain says is "You can clear this context." I do.

## The dispatcher: count my attention, not agents

The dispatcher reads the queue and starts one coordinator per ready ticket,
up to a limit. The limit is 2, and the skill explains why in one line:

> The limit counts the user's attention, not agents.

Agents are cheap. I could start ten. But every crew needs me sooner or later:
a design question, a failed check, a review comment. Ten crews means ten
people tapping my shoulder. Two crews on one laptop also fight over ports,
builds and containers.

So "active" has a careful definition. A ticket is active when a crew is
working on it, or when its PR is waiting for me: a failed check, a "changes
requested" review, an open thread, an unanswered question. A PR that only
waits for a teammate's approval is not active. That one rule keeps the queue
moving while my colleagues take their time.

The second job is questions. Coordinators do not ask me in their own tab.
They write a small file and carry on with whatever does not depend on the
answer:

```json
{
  "ticket": "TICKET-142",
  "coordinator": "coord-ticket-142",
  "questions": [{
    "q": "Retry on 503 too, or only on timeouts?",
    "options": ["Timeouts only", "Timeouts and 503"],
    "recommendation": "Timeouts only",
    "why": "The spec names timeouts; 503 needs its own backoff rule."
  }]
}
```

The dispatcher collects every inbox file into one dialog, with each
coordinator's recommendation as the first option. I answer four questions
from two tickets in a minute, instead of being pinged from four tabs. With
`/loop 10m` the dispatcher does this on its own, and I come back to a short
report.

## The coordinator and its crew

The coordinator is the only session that touches the crew. It starts two
[opencode](https://opencode.ai) agents in Herdr panes:

- an **implementer** on a Claude Opus model, which works through the tasks
  with tests and commits locally;
- a **reviewer** on a GPT model in read-only mode, which reviews
  `main...HEAD` as if it were the last gate before merge.

The reviewer comes from a different vendor on purpose. Two models from one
family tend to agree with each other.

Review runs in rounds until a round finds nothing. The coordinator checks
every finding in the code before it passes it on, because reviewers like to
overstate reach: a "cross-tenant High" that needs the victim to send a
malformed token is not high. After three rounds the coordinator stops and asks
me what is going on. By then fixes are usually creating new findings.

The coordinator forgets too. It keeps a short work state with fixed keys,
`phase` and `next` among them, and a fresh coordinator session continues
from there. Same idea again: the context is disposable, the file is not.

How much the coordinator decides alone depends on the level in the queue
entry. At level 1 it asks me about everything. At level 2 it fixes verified
high and medium findings without asking. At level 3 it can open a draft PR.
At every level it asks before a scope change, a merge, a force-push or a
comment on GitHub.

## Sharp edges

None of this worked the first time. A few things I had to learn:

- **Herdr could not see opencode's state.** It showed the agent as idle while
  it was working, and never as blocked. I wrote a small poll script that
  watches the session's last update time instead. It prints `DONE` when the
  turn ends, or `STUCK` after five quiet minutes. `STUCK` is nearly always a
  permission prompt.
- **A start script killed Docker.** Our local start script runs `kill -9` on
  whatever holds its ports, and Docker Desktop was holding one. Now the
  coordinator checks `lsof` and `docker ps` before the first server run.
- **Two implementers share one git index.** A plain `git add` and
  `git commit` can sweep up the other agent's staged files. With more than one
  implementer, each commits with a pathspec: `git commit -m "…" -- <paths>`.
- **Panes leak secrets.** Start scripts print live tokens, and agents read
  pane output. The implement prompt asks for redacted reads, and if a token
  leaks anyway, that session ends.

## Closing the loop

After every merge, a retro skill sorts the review findings into classes by
cause, such as "test does not prove its name", and adds one line to a log. A
new rule for the prompts is proposed only when a class keeps coming back.
After four PRs the numbers are not good yet: the last one took five crew
rounds. One class appeared twice with no rule, then six times, and only then
got one. That is a post for later, when I have enough PRs to say whether the
loop works.

## If you copy one thing

Write decisions into files at the moment they are made, and build every
session so you can kill it. Once that holds, clearing a context stops being
a loss. It becomes the cheapest way to get a focused agent back.
