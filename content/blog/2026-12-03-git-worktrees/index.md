+++
title = "Speeding up your work with git worktrees"
description = "How git worktrees let you run several tasks and review a colleague's branch at the same time, and how worktrunk hooks make each new checkout ready to use."
date = 2026-12-03
draft = true

[taxonomies]
tags = ["git", "workflow", "ai-agents"]
+++

A coding agent can work on a task while I do something else. Two agents can
work on two tasks. But with one checkout of the repository they can't, because
there is only one working directory and one branch checked out at a time.

Git worktrees fix that. This post covers plain `git worktree` first, then
[worktrunk](https://worktrunk.dev), the tool I use on top of it, and its hooks
that copy ignored files like `.env` and `target/` into each new checkout.

<!-- more -->

## One checkout, one task

Without worktrees, switching tasks looks like this. I'm halfway through a
change, a colleague asks for a review, and I have to:

1. stash or commit my half-done work,
2. check out their branch,
3. wait for the rebuild,
4. review, then switch back, pop the stash and rebuild again.

That is annoying when I'm the only one working in the repository. With an
agent working in it, it doesn't work at all. I can't check out a colleague's
branch while the agent is in the middle of editing files on mine.

## What a worktree is

A worktree is a second working directory attached to the same repository. All
worktrees share one `.git`: the same commits, branches, remotes and stash. Each
one has its own checked-out branch, its own files on disk and its own index.

<figure class="diagram">
<svg viewBox="0 0 440 196" role="img" aria-labelledby="wt-title">
<title id="wt-title">One .git directory shared by three worktrees: myapp on main where I work, myapp.feature-a where an agent works, and myapp.pr-87 where I review a colleague's branch.</title>
<rect class="box key" x="120" y="8" width="200" height="52" rx="8"/>
<text class="t b mono" x="220" y="31">.git</text>
<text class="m" x="220" y="49">commits, branches, stash</text>
<path class="line" d="M180 60L80 117"/>
<path class="line" d="M220 60V117"/>
<path class="line" d="M260 60L360 117"/>
<rect class="box" x="10" y="120" width="134" height="56" rx="8"/>
<text class="t mono" x="77" y="143">myapp</text>
<text class="m" x="77" y="162">main, me</text>
<rect class="box" x="153" y="120" width="134" height="56" rx="8"/>
<text class="t mono" x="220" y="143">myapp.feature-a</text>
<text class="m" x="220" y="162">agent at work</text>
<rect class="box" x="296" y="120" width="134" height="56" rx="8"/>
<text class="t mono" x="363" y="143">myapp.pr-87</text>
<text class="m" x="363" y="162">colleague's PR</text>
</svg>
<figcaption>One repository, three checkouts. History is shared, files on disk are separate.</figcaption>
</figure>

Creating one takes a second, because git doesn't clone anything:

```bash
# new branch "feature-a" in a sibling directory
git worktree add ../myapp.feature-a -b feature-a

# an existing branch, for example a colleague's
git fetch origin
git worktree add ../myapp.review origin/their-branch

git worktree list
git worktree remove ../myapp.review
```

A commit made in one worktree is visible in all the others straight away,
since they share the object store. There is no push and pull between them.

## Several tasks at once

With worktrees, each task gets its own directory. I start an agent in
`myapp.feature-a`, another one in `myapp.feature-b`, and keep `myapp` on `main`
for myself. They don't touch each other's files, and none of them has to wait
for me to finish something first.

This is the base of the multi-agent setup I described in
[Brain, dispatcher, crew](@/blog/2026-11-26-brain-dispatcher-crew/index.md).
Every ticket there gets its own worktree.

## Reviewing without blocking

The part I use most often is reviewing. When a colleague asks for a review, I
open their PR in a new worktree, build it, run it and read the code there. My
own work and my agents keep going in the other directories.

I check out the PR head detached, so the review doesn't leave a local branch
behind:

```bash
git fetch origin pull/87/head
git worktree add --detach ../myapp.pr-87 FETCH_HEAD
```

The worktree stays for all review rounds. After the next push I fetch again
and run `git -C ../myapp.pr-87 checkout --detach FETCH_HEAD`. When I
approve, I remove it.

The same works for agents. A review agent gets its own worktree with the
branch checked out, so it can do more than read the diff. It builds the code,
starts the local server, and tests the change against it, while the agents
writing code carry on in their own worktrees. My reviews and theirs now both
start from a running branch.

## The catch: ignored files

A new worktree has only tracked files. Everything in `.gitignore` is missing:

- `.env` and other local config, so the app doesn't start,
- `node_modules/` or `.venv/`, so nothing runs until you install again,
- `target/` in a Rust project, so the first build compiles every dependency
  from scratch.

So `git worktree add` takes a second, and then the checkout is not usable until
you have copied config by hand and waited for a full build. That cost comes
back with every new worktree, and with agents I create several a day.

## worktrunk

[worktrunk](https://worktrunk.dev) is a CLI (`wt`) that wraps git worktrees.
It picks the directory for you (by default a sibling,
`~/code/myapp.feature-a`), switches into it, and runs hooks at points like
creating, merging and removing a worktree.

The commands I use every day:

```bash
wt switch --create feature-a   # new branch and worktree, cd into it
wt switch feature-a            # back to an existing one
wt switch pr:87                # a GitHub PR's branch in its own worktree
wt list                        # all worktrees and their state
wt remove                      # remove this worktree, delete the branch if merged
```

`wt switch pr:87` does the review setup in one command. It finds the PR's
branch, creates the worktree and moves you into it. For a PR from a fork it
fetches the PR ref and sets the push remote to the fork. I still use the
detached `git worktree add` from above for reviews, because it leaves no
branch behind. For my own work I use `wt switch` with no argument, which
opens a picker.

## Hooks that copy ignored files

worktrunk (version 0.83 when I wrote this) has a built-in command for the
ignored-files problem,
`wt step copy-ignored`. It copies gitignored files from the main worktree into
the current one. Run from a hook, it fills every new worktree automatically.

Hooks for one repository live in `.config/wt.toml`, committed with the code:

```toml
# .config/wt.toml
[post-start]
copy = "wt step copy-ignored"
```

`post-start` runs once when a worktree is created, in the background, so
`wt switch --create` returns right away. If a later step needs the files
first, use `pre-start`, which blocks until it's done.

By default it copies every ignored file. To limit that, add a
`.worktreeinclude` file with gitignore-style patterns. A file is copied only if
it is ignored and matches a pattern:

```text
# .worktreeinclude
.env
target/
```

When a later step depends on the copy, a hook can be a pipeline: `[[post-start]]`
blocks run in order.

```toml
# .config/wt.toml
[[post-start]]
copy = "wt step copy-ignored"

[[post-start]]
build = "cargo build"
```

Project hooks run commands from the repository, so worktrunk asks you to
approve them the first time, and again whenever a command changes. Hooks you
want in every repository go in `~/.config/worktrunk/config.toml` instead.

That is what I do. I have no `.config/wt.toml` and no `.worktreeinclude` in
any repository. There is one hook in my user config, and it copies everything
ignored into every new worktree:

```toml
# ~/.config/worktrunk/config.toml
[post-start]
copy = "wt step copy-ignored"
```

## Don't copy a Python virtualenv

Copying everything has one trap. A `.venv/` has absolute paths inside it: the
scripts in `.venv/bin` and editable installs point at the directory the venv
was made in. A copied venv in a new worktree can import code from the main
checkout, so the tests run the wrong code and nothing tells you. The worktrunk
docs say the same and recommend `uv sync` instead, which is fast enough.

So exclude it, and let a hook create a fresh one:

```toml
# ~/.config/worktrunk/config.toml
[step.copy-ignored]
exclude = [".venv/"]
```

```toml
# .config/wt.toml in a Python project
[[post-start]]
copy = "wt step copy-ignored"

[[post-start]]
deps = "uv sync"
```

The same care applies to `node_modules/` when it has native modules built for
one path.

## Copying `target/` without filling the disk

On filesystems with copy-on-write, `copy-ignored` uses reflinks: the copy
shares disk blocks with the original until one of them changes. That is APFS
on macOS and btrfs or XFS on Linux. The worktrunk docs give 20 seconds and
almost no extra disk for a 14 GB `target/`, against 2 minutes and 14 GB for a
plain `cp -R`. They also say a reused `target/` takes a first Rust build from
about 68 seconds to about 3.

On ext4 there are no reflinks, so every file is copied in full. With several
Rust worktrees that adds up fast.

On my Mac (APFS), in a repository with a Rust server and two Node packages,
`.env` is in the new worktree about 3 seconds after `wt switch --create`.
The `node_modules/` folders and `target/` follow in the background, and
everything is there in about two and a half minutes. The `target/` in my main
checkout of that repository is 8.7 GB. Reflinks mean the copies don't cost
another 8.7 GB each, but a reflinked file stops sharing blocks once a build
rewrites it, so the disk use grows with every build in every worktree.

I measured it on [rig](https://github.com/0xPlaygrounds/rig), the Rust LLM
framework I build agents with: a debug `cargo build -p rig-core` (rig-core 0.47.1,
rustc 1.100.0, M1 Pro, 32 GB, no compiler cache, times as cargo reports them).

| Build                               | Time | Extra disk |
| ----------------------------------- | ---- | ---------- |
| First build in the main checkout    | 53 s | 511 MB     |
| New worktree, empty `target/`       | 77 s | 511 MB     |
| New worktree after `copy-ignored`   | 37 s | ~0         |

The copy took 2 seconds for 1048 files and reported "reflinked, no extra
disk". After it, cargo compiled only the two crates of the rig workspace,
because their paths changed. Every dependency came from the copy. Rebuilding
just those two crates in the main checkout takes 24 seconds, so that is the
floor for this repository. The gap is smaller than the worktrunk docs show,
because rig-core alone is a large part of the build. These are single runs on
a busy laptop, so read them as a rough size, not a benchmark. The first two
rows do the same work; the difference between them is that noise.

There is another way to share Rust build output: a compiler cache that sits in
front of `rustc` and is shared by all worktrees. I use
[kache](https://github.com/kunobi-ninja/kache) for that, and it is the next
post.

## Things to watch out for

- A branch can be checked out in only one worktree at a time. Git refuses to
  check out `main` in a second one.
- The stash is shared. A `git stash` in one worktree shows up in
  `git stash list` in all of them.
- Copied dependencies come from the main checkout, not from the branch. If
  the branch changes `package-lock.json` or `Cargo.lock`, the copied
  `node_modules/` or `target/` is for the wrong versions. I had a branch
  that needed a newer version of an internal UI package, and its tests failed
  against the old copy until I reinstalled. Run the install step after the
  copy when the lockfile differs.
- Two worktrees running the same dev server or Docker Compose project will
  fight over ports and container names. This matters more once agents start
  servers to test their changes. Give each worktree its own ports; worktrunk
  hooks can derive one from the branch name with `{{ branch | hash_port }}`.
  A server with two ports needs both to move: I once moved the main port and
  the agent's server still failed, on the console port of the main checkout.
- Containers outlive their worktree. A compose file with a fixed
  `container_name` fails in every other worktree while a stopped container
  with that name exists, even one from a worktree that is already gone. Run
  `docker compose down` before `wt remove`, for example in a `pre-remove`
  hook.
- Old worktrees pile up. Remove them when the branch is merged, and run
  `git worktree prune` if you deleted a directory by hand.

## Where to start

Next time someone asks you for a review, don't stash. Run
`git worktree add --detach ../review origin/their-branch`, review it there, and
remove it when you're done. If you start doing that every day, install worktrunk and
add the `copy-ignored` hook.
