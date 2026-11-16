# redroy44.github.io

A personal website with a home page, blog, projects page, resume and 404 page. It is built with Zola 0.23.6 and a small hand-written theme (plain HTML templates, one CSS file, one small optional script), and deployed to GitHub Pages at https://redroy44.github.io by a GitHub Actions workflow.

## Quick start

Install [mise](https://mise.jdx.dev/getting-started.html), then run these from the repo root:

```sh
mise install     # installs the pinned Zola version
mise run serve   # http://127.0.0.1:1111, reloads on every save
```

All tasks:

| Task | What it does |
| --- | --- |
| `mise run serve` | Serve the site at http://127.0.0.1:1111 with live reload |
| `mise run drafts` | Like serve, but also shows posts marked `draft = true` |
| `mise run build` | Generate link-preview images, then build the site into `public/` |
| `mise run og` | Generate the link-preview images only (see [Link preview images](#link-preview-images)) |
| `mise run check` | Check links: a broken internal link fails, broken external links warn |
| `mise run validate` | Validate the HTML in `public/` (needs Node.js; run `build` first) |
| `mise run clean` | Delete the build output |
| `mise run new-post "Title"` | Create a dated draft post in `content/blog/` |
| `mise run set-domain example.org` | Set `base_url` and write `static/CNAME` |

`mise tasks` lists them too.

You can skip mise. Install Zola 0.23.6 yourself and run `zola serve` or `zola build` directly. Use that exact version, because 0.23 changed a lot.

## First things to edit

Everything that still needs your input is marked `PLACEHOLDER`. Work through this list:

- [ ] `zola.toml`
  - [ ] `description` (name, GitHub and LinkedIn links are already filled in from the old site)
  - [ ] `[extra]`: `email` (empty for now, so it is hidden), `role`, `location`, `twitter_handle`
  - [ ] `[extra]`: `author_bio` and `author_cta`, the box shown at the end of every post
- [ ] `content/_index.md`: the home intro and "What I work on"
- [ ] `content/blog/_index.md` and `content/projects.md`: the `description` in each
- [ ] `data/resume.toml`: see [Editing the resume](#editing-the-resume)
- [ ] `data/projects.toml`: see [Projects](#projects)
- [ ] `static/img/og-default.png`: the fallback link-preview image, 1200x630 PNG. It is only used when the generated images are missing.
- [ ] `static/favicon.svg`
- [ ] Delete `content/blog/2026-01-01-styling-sample.md` and `static/img/sample-diagram.svg` once you have checked the styling. The sample post is a draft, so it is not published; see it with `mise run drafts`.

To see what is left, run:

```sh
grep -rn PLACEHOLDER .
```

Leave `email`, `github_url`, `linkedin_url` or `twitter_handle` as an empty string to hide it.

## Writing a post

Create a draft:

```sh
mise run new-post "My first post"
```

This creates `content/blog/YYYY-MM-DD-slug.md` with `draft = true`. The date prefix is stripped from the URL, so the post lives at `/blog/slug/`.

Preview it with `mise run drafts`. To publish, delete the `draft = true` line.

### Front matter

```toml
+++
title = "My first post"
description = "One sentence. Used in lists, the meta description and link previews."
date = 2026-03-14
updated = 2026-04-02           # optional
draft = true                   # delete this line to publish

[taxonomies]
tags = ["rust", "tooling"]

[extra]
image = "img/your-image.png"   # optional, replaces the generated link-preview image
toc = false                    # optional, hides the table of contents
+++

Opening paragraph.

<!-- more -->

The rest of the post.
```

`<!-- more -->` marks the end of the summary. The summary is what the feed shows.

### Code blocks

Fence the block and give it a language tag:

````md
```rust
fn main() {
    println!("{}", "hello");
}
```
````

An unknown language tag fails the build on purpose (`error_on_missing_language`). That way a typo does not silently render without highlighting.

Add annotations after the language:

````md
```rust,linenos,hl_lines=2-3
fn main() {
    let a = 1;
    let b = 2;
}
```
````

Long lines scroll horizontally instead of wrapping.

### Images and footnotes

Put image files in `static/img/` and reference them as `/img/name.png`. Or make the post a folder, `content/blog/YYYY-MM-DD-slug/index.md`, and keep the images beside it.

Footnotes use `[^1]` in the text and `[^1]: The note.` on its own line.

### Table of contents

A post with three or more `##` headings gets a contents list of its `##` and `###` headings. It sits above the text on small screens and in the right margin on wide ones. Set `toc = false` under `[extra]` to hide it, or `toc = true` to force it on a short post.

### Link preview images

`mise run build` first runs `mise run og`, which makes a 1200x630 image for every published post (title, tags, your name and domain) and one for the site itself. They are written to `static/img/og/`, which is git-ignored, and each page's `og:image` points at its own image.

- It needs Chrome, Chromium, Edge or Brave installed. Set `CHROME=/path/to/browser` if it is not found.
- Without a browser the task prints a warning and the pages use `static/img/og-default.png`. The build still succeeds.
- `mise run serve` does not generate them. Run `mise run og` once if you want to see them locally.
- The design is `templates/og-cards.html`. To preview it, run `mise run drafts` and open `http://127.0.0.1:1111/og-cards/#card-site` or `#card-<post-slug>` in a 1200x630 window.
- Drafts get no image, so a draft title never leaks into the published files.

### Author box

Every post ends with a box showing your name, `author_bio`, `author_cta` and your contact links, all from `[extra]` in `zola.toml`. Leave `author_cta` empty to drop that line. The markup is `templates/partials/author.html`.

### Braces are safe

Zola 0.23 normally runs Markdown through its template engine first. That would choke on `{{`, `{%` and `{#` in Rust or Python code. This site turns that off with `skip_content_templating` in `zola.toml`, so braces in posts are safe. The cost is that you cannot use Tera components inside posts.

## Writing with Claude Code

The repo includes five Claude Code skills in `.claude/skills/`, and `CLAUDE.md` holds the project notes Claude reads at the start of every session. Open the repo in Claude Code and type the command. They guide and check your writing; they do not write posts for you.

| Command | What it does |
| --- | --- |
| `/blog-ideas` | Capture an idea, shape it (claim, reader, evidence), list the backlog, pick what to write next, or mine a repo or notes for topics |
| `/blog-draft` | Walk a post from idea to full draft: find the claim, agree an outline, give feedback section by section, check code and facts, settle title and tags |
| `/blog-review` | Read a draft as a critical technical editor: correctness, opening, structure, clarity, rendering |
| `/blog-publish` | Run the pre-publish checklist, remove `draft = true` once you confirm, and draft the text for sharing the post |
| `/retro` | End-of-session retrospective that turns lessons into edits to `CLAUDE.md`, the skills or the mise tasks; `/retro post <slug>` records how a published post did |

Ideas are kept in `ideas/backlog.md`. This repository is public, so that file is git-ignored and stays on your machine; `ideas/README.md` describes its format. For the same reason, a draft post is readable on GitHub as soon as you push it, even though the site does not show it. Keep a draft unpushed if it should stay private.

Each skill is one Markdown file. Edit it to change how it behaves.

## Editing the resume

Everything on `/resume/` comes from `data/resume.toml`. You should not need to touch any HTML.

| Section | What it holds |
| --- | --- |
| `name`, `headline`, `location`, `summary` | The header block at the top |
| `[[skills]]` | One block per group: `name` and `items` |
| `[[experience]]` | `role`, `company`, `start`, `end` are required (`end` can be `"Present"`). `url`, `location`, `summary`, `highlights` and `stack` are optional |
| `[[projects]]` | `name`, `url`, `description` |
| `[[education]]` | `degree`, `institution`, `start`, `end`, optional `notes` |
| `[[extras]]` | Free sections such as talks or languages: `title` and `items` |

Deleting a section removes it from the page. Entries appear in the order they are written in the file. Email, GitHub and LinkedIn come from `[extra]` in `zola.toml`, so they are not repeated here.

### Making a PDF

1. Open `/resume/` in your browser.
2. Print, then choose Save as PDF.
3. Turn off the browser's "headers and footers" option for a clean page.

The site header, footer and the hint line are hidden in print. The placeholder data prints on one A4 page.

## Projects

Edit `data/projects.toml`. Each `[[projects]]` block has:

- `name`: required
- `repo`: required, the full URL
- `description`: required, one line
- `language`: optional, shown as a small label

Projects appear in the order written.

## How the theme is organised

```
templates/
  base.html            page shell, meta tags, header, footer, CSS links
  index.html           home page
  section.html         the blog list
  post.html            a single blog post
  page.html            generic pages
  resume.html          the resume, built from data/resume.toml
  projects.html        the projects page, built from data/projects.toml
  404.html             the not-found page
  tags/list.html       all tags
  tags/single.html     the posts under one tag
  partials/post-list.html   the post list shared by home, blog and tags
  partials/author.html      the author box at the end of a post
  og-cards.html        the link-preview image design
static/
  css/style.css
  js/site.js
  fonts/
  favicon.svg
  img/
```

- `base.html` wraps every page and writes the title, description and link-preview tags.
- `index.html` renders `content/_index.md`, the latest posts and your contact links.
- `section.html` lists the posts in `content/blog/`.
- `post.html` renders one post with its date, tags, table of contents and author box.
- `page.html` renders plain pages that have no special template.
- `resume.html` turns `data/resume.toml` into the resume page and its print layout.
- `projects.html` turns `data/projects.toml` into the project list.
- `404.html` is the page GitHub Pages serves for unknown URLs.
- `tags/list.html` lists every tag.
- `tags/single.html` lists the posts for one tag.
- `partials/post-list.html` renders a list of posts, so all lists look the same.
- `static/css/style.css` is the whole theme in one file. The design tokens are at the top: colours, fonts and text width. Light and dark follow the system setting through `prefers-color-scheme`.
- `static/js/site.js` is the only script. It adds the light/dark switch in the header and the Copy buttons on code blocks. Every page works without it, and without it the site follows the system theme.
- `static/fonts/` holds self-hosted Source Serif 4 and JetBrains Mono. Both are under the SIL OFL, and the licences sit alongside.
- Syntax highlighting themes are set in `zola.toml` under `[markdown.highlighting]` (`github-light-default` and `github-dark-default`). Zola generates `giallo-light.css` and `giallo-dark.css` at build time.

The templates use Tera v2 syntax (Zola 0.23). See [the Tera docs](https://keats.github.io/tera/). It differs from many older Zola themes you will find online, so do not paste their code in unchanged.

## Deploying

The workflow `.github/workflows/deploy.yml` runs on every pull request and every push. It checks links, generates the link-preview images, builds the site and validates the HTML. On `master` it then deploys to GitHub Pages.

One-time setup: in the GitHub repo, go to Settings, Pages, Build and deployment, and set Source to "GitHub Actions". Do this before the first merge to `master`. Until then Pages serves the files in the branch directly, and the branch now holds the source, not the built site.

After that, publishing is: merge or push to `master`.

- A broken internal link or invalid HTML fails the run, and nothing is deployed.
- Broken external links only produce warnings.
- If the link-preview images cannot be generated, the run shows a warning and the site deploys with the fallback image.

The old site's post address `/2017/02/03/movielens/` redirects to the post's new address through the `aliases` line in its front matter.

### Using a custom domain later

1. Run `mise run set-domain yourdomain.tld` and commit. It sets `base_url` and writes `static/CNAME`.
2. At your registrar, for an apex domain, add four `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` record for `www` pointing to `redroy44.github.io`. Confirm the values against [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site); they can change.
3. In Settings, Pages, Custom domain, enter the domain, wait for the DNS check, then tick "Enforce HTTPS".
4. Verify the domain for your account under GitHub Settings, Pages, "Add a domain", so nobody else can claim it.

After a deploy, you can check the feed with the [W3C feed validator](https://validator.w3.org/feed/).

## Updating Zola

Change the version in `mise.toml`. CI reads the same file, so the live site builds with the version you pin. Read the Zola changelog first, since 0.23 was a breaking release.
