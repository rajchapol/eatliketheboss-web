# Translation drafts (not published)

Files here are drafts waiting for the Boss's approval. Nothing in this folder is published:
`.github/workflows/post-article.yml` only publishes `posts/*.md`.

After the Boss approves a draft, move it to `posts/<slug>.<lang>.md` (image paths `./images/<slug>/…` then resolve)
and push to main. The workflow publishes it as `article-<slug>-<lang>`, linked to the Thai article.
If Studio already holds a draft with that id (made with "+ English"), discard that draft in Studio first.
