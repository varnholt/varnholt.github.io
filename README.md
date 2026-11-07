# Matthias Varnholt · Projects

A searchable, grouped portfolio at https://varnholt.github.io/.

## Edit the collection

`curation.json` controls the group, description, technology label, demo link and image for each project. `excluded` records deliberate omissions. New public original repositories automatically appear under More projects; forks are excluded by default.

Project metadata is refreshed during deployment every Monday and on pushes. To refresh locally, run `python scripts/refresh.py`. Only public repositories are fetched. To preview, run `python -m http.server 8080` and visit http://localhost:8080.

Screenshots are copied from their corresponding project repositories into `assets/`; their original project licenses and credits apply. Update the local copy when a project's screenshot changes.

Deployment uses GitHub Pages through `.github/workflows/pages.yml`.
