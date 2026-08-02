# adrianfang.dev — personal site

Static, dependency-free personal site built around my 2026 résumé.
Plain HTML/CSS/JS — no build step, no framework, nothing to install.

```
index.html      markup + all content
styles.css      dark theme, layout, animation
script.js       particle field, scroll reveals, nav state
assets/         résumé PDF
.nojekyll       tells GitHub Pages to serve files as-is
```

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

## Deploy to GitHub Pages

1. Create a repo. For a site at `https://<username>.github.io`, name it `<username>.github.io`.
   Any other name publishes to `https://<username>.github.io/<repo>/`.

2. Push:

```bash
git init && git add -A && git commit -m "personal site" && git branch -M main && git remote add origin https://github.com/<username>/<repo>.git && git push -u origin main
```

3. In the repo: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`** → Save.

Live in about a minute. Every push to `main` redeploys.

### Custom domain

Add a file named `CNAME` at the repo root containing just the domain (e.g. `adrianfang.dev`),
then point a `CNAME` DNS record at `<username>.github.io`. Enable **Enforce HTTPS** in Settings → Pages.

## Updating the résumé

Drop the new PDF at `assets/Adrian-Fang-Resume-2026.pdf` (keep the filename, or update the three
links in `index.html`) and edit the matching sections in `index.html`.
