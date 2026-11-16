+++
title = "Styling sample: every element in one post"
description = "A sample post that exercises headings, code, tables, images, quotes and footnotes. Delete it once you have checked the styling."
date = 2026-01-01
# Draft, so it is not published. Preview it with `mise run drafts`.
draft = true

[taxonomies]
tags = ["meta", "rust", "python"]
+++

This is a styling test post. It exists only so the site owner can check how each element looks in the theme, and it should be deleted afterwards.

<!-- more -->

## Text and inline elements

Paragraphs should have comfortable spacing and line length. This one contains inline `code`, **bold** text, *italic* text, a [link to the Zola site](https://www.getzola.org), and ~~strikethrough~~ text.

### A third-level heading

Third-level headings should be clearly smaller than second-level ones, but still distinct from body text.

#### A fourth-level heading

Fourth-level headings are the smallest heading size used in this post.

## Code blocks

### Rust

This block includes one very long line to test horizontal scrolling.

```rust
use axum::{extract::State, http::StatusCode, Json};
use serde::Serialize;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize)]
pub struct Post<'a> {
    pub slug: &'a str,
    pub title: String,
    pub views: u32,
}

pub struct AppState {
    pub posts: Vec<Post<'static>>,
}

// Return the most viewed post, or a 404 if there are none.
pub async fn top_post(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Post<'static>>, StatusCode> {
    let greeting = "Looking up the most viewed post";
    println!("{greeting}, out of {} posts", state.posts.len());

    let very_long_line = format!("This is a deliberately very long line of code that should overflow the width of the code block and force a horizontal scrollbar: {} {} {}", 1, 2, 3);
    println!("{very_long_line}");

    state
        .posts
        .iter()
        .max_by_key(|p| p.views)
        .cloned()
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}
```

### Python

```python
from dataclasses import dataclass
import asyncio
import functools


def logged(fn):
    @functools.wraps(fn)
    async def wrapper(*args, **kwargs):
        print(f"calling {fn.__name__}")
        return await fn(*args, **kwargs)
    return wrapper


@dataclass
class Item:
    name: str
    price: float
    quantity: int = 1


# Simulate a slow lookup and report the total.
@logged
async def total(items: list[Item], delay: float = 0.1) -> float:
    await asyncio.sleep(delay)
    return sum(i.price * i.quantity for i in items)


print(asyncio.run(total([Item("pen", 1.5, 4), Item("book", 12.0)])))
```

### Other languages

```toml
[package]
name = "styling-sample"
version = "0.1.0"
edition = "2021"
```

```bash
# Build the site and serve it locally
zola build
zola serve --port 1111
```

A fenced block with no language:

```
Plain text with no syntax highlighting.
    Indentation and spacing are preserved.
```

## Table

| Name    | Kind     | Size (KB) | Notes         |
|:--------|:---------|----------:|:--------------|
| alpha   | text     |        12 | First row     |
| beta    | image    |     1,024 | Second row    |
| gamma   | font     |       256 | Third row     |
| delta   | script   |         8 | Fourth row    |

## Image

![Placeholder diagram: three boxes joined by arrows](/img/sample-diagram.svg)

## Blockquote

> This is the first paragraph of a blockquote. It is here to check the quote border, indentation and text color.
>
> This is the second paragraph of the same blockquote, to check spacing between paragraphs inside a quote.
>
> - Placeholder Author, *Placeholder Source*

## Lists

- An unordered list item
- Another item with a nested list
  - A nested item
  - Another nested item
    - A deeper nested item
- A final item

1. First ordered item
2. Second ordered item
3. Third ordered item

Task list:

- [x] A completed task
- [ ] An open task
- [ ] Another open task

## Footnotes

Footnotes appear at the end of the post.[^1] Here is a second one to check numbering.[^2]

## Keyboard keys and details

To copy text, press <kbd>Ctrl</kbd> + <kbd>C</kbd>. To stop a running command, the same keys usually work.

<details>
<summary>Click to expand this details block</summary>

This content is hidden until the summary is clicked. It can contain **formatting** and `code`.

</details>

---

That horizontal rule above separates this closing line from the rest of the post.

[^1]: This is the first footnote definition.
[^2]: This is the second footnote definition.
