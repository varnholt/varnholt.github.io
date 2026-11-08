# Matthias Varnholt · Projects

A searchable, grouped portfolio at https://varnholt.github.io/.

## Edit the collection

`curation.json` controls the group, description, technology label, demo link and image for each project. `excluded` records deliberate omissions. New public original repositories automatically appear under More projects; forks are excluded by default.

Project metadata is refreshed during deployment every Monday and on pushes. To refresh locally, run `python scripts/refresh.py`. Only public repositories are fetched. To preview, run `python -m http.server 8080` and visit http://localhost:8080.

Screenshots are copied from their corresponding project repositories into `assets/`; their original project licenses and credits apply. Update the local copy when a project's screenshot changes.

The one:am card uses a locally authored vector illustration, `assets/oneam.svg`, with an original placeholder comic rather than a screenshot containing third-party comic artwork.

Deployment uses GitHub Pages through `.github/workflows/pages.yml`.

Projects with multiple screens can define an `images` list with `image`, `label` and
`alt` for each capture. Copy those files into `assets/<repository>-0.png`,
`assets/<repository>-1.png`, `-2.png`, and so on. The card shows a labeled screen
picker and a full-size link for each capture. Keep the first `image`/`alt` fields
and `assets/<repository>.png` as the fallback for clients using an older copy of the site script.
