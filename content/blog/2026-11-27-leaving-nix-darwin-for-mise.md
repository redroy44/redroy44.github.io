+++
title = "Leaving nix-darwin for mise without breaking my Mac"
description = "I moved my Mac from nix-darwin and home-manager to mise. What I had, how I moved without burning the way back, and what I gave up."
date = 2026-11-27
draft = true

[taxonomies]
tags = ["tooling", "macos", "mise", "nix"]
+++

The last thing I added to my nix config was this:

```nix
(direnv.overrideAttrs (_: {
  doCheck = false;
}))
```

direnv's test suite was getting killed inside the nix build sandbox, so my system wouldn't build. I didn't even have direnv turned on. I just wanted my laptop to update, so I told nix to skip the tests and moved on.

That's more or less how nix went for me. Every few updates something broke, the error made no sense, and I poked at it until it went away. At some point my other Mac's flake stopped evaluating altogether. The error told me to "open an issue at nix-darwin". The actual problem was three options that got renamed or removed.

In September I moved my main Mac to [mise](https://mise.jdx.dev). So far it works way nicer. Here's what I had, how I moved it one layer at a time without losing the way back, and what went wrong.

<!-- more -->

## What I had

I set up nix at the end of 2022. Almost four years later the flake was 20 files and about 1,200 lines, with eight inputs: two nixpkgs inputs (the 25.11 release branch, and master for things I wanted fresh), home-manager, nix-darwin, flake-utils, and separate flakes for terraform, Ghostty and one neovim plugin.

Before anyone says it: yes, pulling in nixpkgs master is asking for trouble. But direnv came from the release branch, and so did the nix-darwin options that got renamed.

nix-darwin did the system: Homebrew casks, App Store apps, Dock and Finder settings, the firewall, Touch ID for sudo. home-manager did my user: the CLI tools, and a nix module for every dotfile. My zsh config wasn't a `.zshrc`. It was this:

```nix
programs.zsh = {
  enable = true;
  autosuggestion.enable = true;
  syntaxHighlighting.enable = true;
  oh-my-zsh = {
    enable = true;
    theme = "lambda";
    plugins = [ "aws" "git" "tmux" "fzf" "direnv" ];
  };
};
```

which turned into a `.zshrc` with a dozen `/nix/store` paths in it. New CLI tool? Edit a nix file, `darwin-rebuild switch`, wait.

mise was already on the machine, by the way. home-manager was the thing putting `mise activate` in my `.zshenv`. I used it for per-project tool versions and never looked any further.

## Moving

mise does a lot more these days. It installs tools, Homebrew packages and casks, and App Store apps. It sets macOS defaults, clones git repos and symlinks dotfiles, and `mise bootstrap` runs all of it. That's pretty much everything nix-darwin and home-manager were doing for me, in one TOML file. A Brewfile would have covered the packages, but not the per-project versions, the macOS defaults, the dotfiles or a lockfile.

I didn't want to rip nix out and hope for the best. So I went one layer at a time, with nix still underneath and a way back at every step.

<figure class="diagram">
<svg viewBox="0 0 440 340" role="img" aria-labelledby="move-title">
<title id="move-title">Six steps from nix to mise: dotfiles, tools, cutover, system part, dress rehearsal, teardown. A rollback path stays open through the first five steps.</title>
<defs><marker id="move-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0L10 5L0 10z"/></marker></defs>
<rect class="box" x="0" y="4" width="350" height="44" rx="8"/>
<text class="t b start" x="14" y="23">1. Dotfiles out of home-manager</text>
<text class="m start" x="14" y="40">plain files in the repo, linked by mise</text>
<path class="line" d="M175 48V59" marker-end="url(#move-head)"/>
<rect class="box" x="0" y="60" width="350" height="44" rx="8"/>
<text class="t b start" x="14" y="79">2. Tools into mise, next to nix</text>
<text class="m start" x="14" y="96">57 tools installed, nothing switched yet</text>
<path class="line" d="M175 104V115" marker-end="url(#move-head)"/>
<rect class="box" x="0" y="116" width="350" height="44" rx="8"/>
<text class="t b start" x="14" y="135">3. Cutover</text>
<text class="m start" x="14" y="152">home-manager removed from the flake</text>
<path class="line" d="M175 160V171" marker-end="url(#move-head)"/>
<rect class="box" x="0" y="172" width="350" height="44" rx="8"/>
<text class="t b start" x="14" y="191">4. System part declared in mise</text>
<text class="m start" x="14" y="208">casks, App Store apps, defaults: nothing to change</text>
<path class="line" d="M175 216V227" marker-end="url(#move-head)"/>
<rect class="box key" x="0" y="228" width="350" height="44" rx="8"/>
<text class="t b start" x="14" y="247">5. Dress rehearsal</text>
<text class="m start" x="14" y="264">nix stripped to what mise cannot do, 13 days</text>
<path class="line" d="M175 272V283" marker-end="url(#move-head)"/>
<rect class="box" x="0" y="284" width="350" height="44" rx="8"/>
<text class="t b start" x="14" y="303">6. Teardown</text>
<text class="m start" x="14" y="320">darwin-uninstaller, nix removed</text>
<path class="line dash clear" d="M372 4V268"/>
<path class="line clear" d="M366 4H378M366 268H378"/>
<text class="m" x="408" y="136" transform="rotate(90 408 136)">way back still open</text>
</svg>
<figcaption>The move. Until the last step, git checkout and darwin-rebuild switch undid everything.</figcaption>
</figure>

Dotfiles first. I copied the files home-manager had generated, took the store paths out, committed them as plain files and let mise symlink them. Then the tools: 57 of them went into `[tools]` and got installed next to the nix ones. Then I deleted home-manager from the flake and rebuilt. Then the casks, App Store apps and macOS defaults went into `mise.toml`.

During all of that, mise wasn't allowed to change anything. Everything was already installed and already set, so `mise bootstrap --dry-run` had to come back with nothing to do. When it wanted to change something, my config was wrong, not the machine.

That took a morning. Then I stripped everything mise now owned out of the nix config and lived on that for 13 days. If I'd missed something I could still roll back. I hadn't. Then `darwin-uninstaller`, and nix was gone.

Stuff that went wrong on the way, so you don't have to find it yourself:

- I'd put `mas` in `[tools]`. mise installs tools after packages, so the App Store apps were marked "skipped" and the run still looked green. `brew:mas` in `[bootstrap.packages]` fixed it.
- nix had been installing the wrong Spark the whole time. The `spark-app` cask is a keyboard shortcut manager. Never opened once. My actual email client came from the App Store.
- Touch ID for sudo couldn't move until nix was completely gone, because `/etc/pam.d/sudo_local` was a symlink into the nix store.
- mise doesn't do root. Running `mise bootstrap files apply` under sudo reported success after doing nothing, because under sudo `$HOME` is `/var/root` and mise finds no config. The firewall and a few other root settings now live in a small shell script.

Claude Code did most of the typing. It read the generated configs, wrote the `mise.toml`, ran the dry runs and kept notes between sessions. I mostly decided the order and when to wait.

## What I have now

<figure class="diagram">
<svg viewBox="0 0 440 320" role="img" aria-labelledby="own-title">
<title id="own-title">Who manages each part of the Mac, before and after. Before: nix-darwin manages root settings, macOS defaults and the cask list; home-manager manages CLI tools and dotfiles; direnv with nix-direnv loads project environments. After: a shell script manages root settings, and mise manages everything else. Homebrew still installs casks in both.</title>
<text class="t b" x="195" y="20">Before</text>
<text class="t b" x="360" y="20">After</text>
<text class="m start" x="0" y="58">Root settings</text>
<rect class="box" x="120" y="34" width="150" height="38" rx="6"/>
<text class="t" x="195" y="58">nix-darwin</text>
<rect class="box" x="285" y="34" width="150" height="38" rx="6"/>
<text class="t" x="360" y="58">shell script</text>
<text class="m start" x="0" y="105">macOS defaults</text>
<rect class="box" x="120" y="81" width="150" height="38" rx="6"/>
<text class="t" x="195" y="105">nix-darwin</text>
<rect class="box key" x="285" y="81" width="150" height="38" rx="6"/>
<text class="t" x="360" y="105">mise</text>
<text class="m start" x="0" y="152">Casks, App Store</text>
<rect class="box" x="120" y="128" width="150" height="38" rx="6"/>
<text class="t" x="195" y="145">nix-darwin</text>
<text class="m" x="195" y="160">via Homebrew</text>
<rect class="box key" x="285" y="128" width="150" height="38" rx="6"/>
<text class="t" x="360" y="145">mise</text>
<text class="m" x="360" y="160">via Homebrew</text>
<text class="m start" x="0" y="199">CLI tools</text>
<rect class="box" x="120" y="175" width="150" height="38" rx="6"/>
<text class="t" x="195" y="199">home-manager</text>
<rect class="box key" x="285" y="175" width="150" height="38" rx="6"/>
<text class="t" x="360" y="199">mise</text>
<text class="m start" x="0" y="246">Dotfiles</text>
<rect class="box" x="120" y="222" width="150" height="38" rx="6"/>
<text class="t" x="195" y="239">home-manager</text>
<text class="m" x="195" y="254">generated files</text>
<rect class="box key" x="285" y="222" width="150" height="38" rx="6"/>
<text class="t" x="360" y="239">mise</text>
<text class="m" x="360" y="254">plain files</text>
<text class="m start" x="0" y="293">Project env</text>
<rect class="box" x="120" y="269" width="150" height="38" rx="6"/>
<text class="t" x="195" y="286">direnv</text>
<text class="m" x="195" y="301">+ nix-direnv</text>
<rect class="box key" x="285" y="269" width="150" height="38" rx="6"/>
<text class="t" x="360" y="293">mise</text>
</svg>
<figcaption>Who manages what. Accent boxes are mise.</figcaption>
</figure>

One `mise.toml`, 190 lines with comments, and a folder of normal dotfiles. What used to be the `homebrew` block and `system.defaults` now looks like this:

```toml
[bootstrap.packages]
"brew:mas" = "latest"
"brew-cask:ghostty" = "latest"
"brew-cask:obsidian" = "latest"
"mas:6445813049" = "latest"   # Spark, the email one

[bootstrap.macos.defaults."com.apple.dock"]
orientation = "left"
autohide = false
```

Tools are just `name = "version"` lines under `[tools]`, and `mise.lock` pins their versions and checksums. Only the tools, though. The Homebrew packages, casks and App Store apps are `"latest"` and nothing locks them, so this is a lot less reproducible than `flake.lock` was.

direnv is gone. I only had it for nix-direnv, and a `mise.toml` in a project already sets the tool versions and env vars when I `cd` in. So the thing I patched at the top of this post, I didn't need at all.

I can still grab a tool for one command without installing it, like with `nix shell`:

```sh
mise exec hyperfine -- hyperfine 'sleep 0.1'
```

No config mentions it, so the next `mise prune` cleans it up.

## Was it worth it

For me, yes. I can read my config, and when something breaks the error is about my config. Adding a tool is one line. Changing a dotfile doesn't need a rebuild. No nix daemon, no `/nix` volume, no build users. And the learning curve is a lot flatter. I had it working in a morning, after almost four years of not really understanding my nix setup.

What I gave up is mostly generations. There's no previous system to boot back into. Rollback is git and `mise install` now. And as I said, only the tools are locked, so a fresh install won't give me exactly the same machine. For one laptop I can live with that.

Casks still belong to Homebrew, so `brew upgrade --cask` is on me. nix-darwin used to do that on every rebuild. I could hand them over to mise, but it would reinstall every app and reset its privacy permissions, and no thanks. Root settings live in that separate script, so a fresh machine is two commands instead of one.

mise has rough edges too. Besides the `mas` thing, `mise lock --global` wrote a second lockfile when I ran it from my home directory, and then preferred that one. For a while I had two versions of atuin depending on which directory I was in. Also set `lockfile_platforms = ["macos-arm64"]`, or your lockfile fills up with Linux and Windows builds. The setting doesn't clean up what's already there, so run `mise lock --global --upgrade` after it. Mine went from 4,534 lines to 1,615.

If you have one Mac and you're tired of fixing your flake, give it a try. Get mise to describe your machine first, take nix out a layer at a time, and keep the way back until the end. My config is in [redroy44/dotfiles](https://github.com/redroy44/dotfiles) if you want to steal from it.
