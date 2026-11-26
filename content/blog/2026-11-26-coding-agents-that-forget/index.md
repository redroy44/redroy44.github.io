+++
title = "Coding agents that forget on purpose"
description = "How I run several coding agents on real tickets with Claude Code, Herdr and worktrunk, and why every decision goes into a file before the context is cleared."
date = 2026-11-26

[taxonomies]
tags = ["ai-agents", "claude-code", "workflow"]
+++

Most days I have two crews of coding agents working on two tickets, and a
third Claude session where I design the next ticket. Each of these sessions
gets its context cleared at some point, usually several times a day.

It took me a few weeks to set this up so that clearing a context loses
nothing. One rule made it work: when a decision is made, the agent writes it
into a file right away. The context only holds the work in progress.

The setup is a few Claude Code skills. They run inside
[Herdr](https://herdr.dev), a terminal workspace for agents, and use git
worktrees managed by [worktrunk](https://worktrunk.dev). Below I follow one
ticket from the start to the PR.

<!-- more -->

## Why one long session was not enough

I started with one Claude session per ticket. In that session I read the
ticket, discussed the design, and had the agent write the code, review it,
fix it and open the PR. For small tickets this works.

For bigger tickets I hit two problems. The context fills up with options we
tried and dropped. When the agent starts coding, those rejected options are
still in its context next to the chosen one, and now and then it implements
the wrong one. After compaction, decisions from an hour earlier can be gone.
The second problem is me: I can only follow one session at a time.

So I split the work into roles. Each role runs in its own session, and any
session can be cleared or restarted without losing work.

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

Each box in the diagram is a separate session. Each role also has a list of
things it must not do, and those limits keep the sessions apart.

| Role | Does | Never does |
| --- | --- | --- |
| Brain | Checks one ticket against the code, discusses the design with me, writes the spec | Write production code |
| Dispatcher | Keeps the queue, starts coordinators, collects questions for me | Design, run a crew, write code |
| Coordinator | Runs one crew from the first commit to a green PR | Write code |
| Crew | An implementer writes the code, a reviewer reads it | Push, merge, or post on GitHub |

## The brain

The brain works on one ticket. Before it reads any code, it switches into the
ticket's worktree. If there is no worktree yet, it creates one with
`wt switch --create`. A worktrunk hook copies `.env` and the build caches
into it, so the crew's first build is not a cold one. Everything the brain
writes from then on is where the crew will look for it.

Then it grooms the ticket. Many of our tickets are written with AI help, and
some of their claims are wrong. The brain lists every claim in the ticket
("the tool returns X", "field Y is missing") and marks it as true (with a
`file:line`), false (with what the code actually does), or not checked. If a
crew starts from a wrong claim, it will implement it.

Next, it grills me on the design. For each decision we make, the brain adds
one line to the brief with the decision, the rejected options and the reason.
It writes the line as soon as the decision is made. At the end of the
session the context is at its fullest, so that is the worst time to write
things down.

Then the decisions go into the spec. I use [OpenSpec](https://openspec.dev),
so that means `proposal.md` and `design.md` in a change folder. Anything that
stays only in the brief or in the chat is lost when the context is cleared.

The hand-off is a commit, a clean `git status` and one entry in the queue:

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

At the end the brain tells me the ticket is ready and that I can clear the
context, and I clear it.

## The dispatcher

The dispatcher reads the queue and starts one coordinator per ready ticket,
up to a limit. The limit is 2. The skill gives the reason:

> The limit counts the user's attention, not agents.

Starting more agents costs almost nothing. My time is what runs out. Every
crew needs me at some point, for a design question, a failed check or a
review comment, and with more than two crews I stop keeping up. Two crews on
one laptop also already compete for ports and build caches.

So a ticket only counts as active when it needs a crew or me. It is active
while a crew works on it, or when its PR waits for me: a failed check, a
requested change, an open thread or an unanswered question. A PR that only
waits for a colleague's approval does not count, so the next ticket can start
in the meantime.

The dispatcher also handles questions. Coordinators do not ask me in their
own tabs. They write the question to a file and continue with work that does
not depend on the answer:

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

The dispatcher collects all inbox files and shows them in one dialog, with
each coordinator's recommendation as the first option. I answer the questions
of both tickets in one go. With `/loop 10m` the dispatcher repeats this every
ten minutes and gives me a short report.

## The coordinator and its crew

The coordinator is the only session that talks to the crew. It starts two
[opencode](https://opencode.ai) agents in Herdr panes:

- An implementer on a Claude Opus model. It works through the tasks with
  tests and commits locally.
- A reviewer on a GPT model in read-only mode. It reviews `main...HEAD` as
  the last check before merge.

Review runs in rounds until a round has no findings. The coordinator checks
every finding in the code before it sends it to the implementer, because
reviewers often rate findings too high. For example, a "cross-tenant, high"
finding that only works if the victim sends a malformed token is low in
practice. After three rounds the coordinator stops and asks me what to do. By
then the fixes usually cause new findings.

The coordinator's context gets cleared too. It keeps a short work state with
fixed keys, such as `phase` and `next`, and a new coordinator session starts
from there.

The level in the queue entry sets how much the coordinator decides alone. At
level 1 it asks me about everything. At level 2 it fixes verified high and
medium findings without asking. At level 3 it can also open a draft PR. At
every level it asks before a scope change, a merge, a force-push or a comment
on GitHub.

## Problems I ran into

Herdr does not detect the state of opencode. It showed the agent as idle
while it was working, and never as blocked. I wrote a small script that polls
the session's last update time instead. It prints `DONE` when the turn ends
and `STUCK` after five minutes without a change. So far `STUCK` has almost
always meant a permission prompt.

Our local start script runs `kill -9` on whatever holds its ports, and one of
them was held by Docker Desktop. Now the coordinator checks `lsof` and
`docker ps` before the first server start.

When two implementers work in one worktree, they share one git index. A plain
`git add` and `git commit` from one of them can include files the other one
staged. So each implementer commits with a pathspec:
`git commit -m "…" -- <paths>`.

Start scripts print live tokens, and the agents read pane output. The
implement prompt asks agents to redact tokens when they quote it. If a token
leaks anyway, I end that session.

## The retro

After each merge, a retro skill sorts the review findings by cause, for
example "test does not prove its name", and adds one line to a log. It
proposes a new prompt rule only when a class keeps coming back. After four
PRs the numbers do not show an improvement yet. The latest PR took five crew
rounds, and one class appeared twice without getting a rule, then six times
before it got one. I will write about this once I have enough PRs to see
whether it helps.

## Where to start

If you want to try something like this, start with the hand-off. Let one
session write its decisions and a spec into the repo, clear its context, and
start a second session from those files only. If the second session can do
the work without asking what was decided, you can add the other roles one at
a time.
