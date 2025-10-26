# nylecm.github.io

Personal site for Michal Nylec. It runs on a straightforward `index.html`, a small CSS block, and a documented theme controller so the stack stays easy to inspect and extend.

## Deployment

This repository deploys automatically via [Cloudflare Pages](https://pages.cloudflare.com/). Every push to the `main` branch triggers a new build and publish, so the canonical `https://nylecm.github.io/` stays in sync with the repo history.

## Branch Protection

The repo is public so anyone can open a pull request, but direct merges are locked behind GitHub branch protection rules:
- Pull requests targeting `main` need at least one approving review.
- Branches must be up to date with `main` before the merge button becomes available.
- Only maintainers with write access can push or merge once the above checks pass.

## Theme system in a nutshell

- `js/theme-bootstrap.js` executes inline in the `<head>` to read the `themePreference` cookie (or `prefers-color-scheme`) and set `data-theme` before the first paint, preventing any light-mode flash.
- `js/theme-manager.js` exposes `window.ThemeManager`, which encapsulates cookie reads/writes, resolves the effective theme, and attaches/detaches the `matchMedia` listener when the user follows the system default.
- `js/theme-menu.js` wires up the dropdown UI: it updates button labels, highlights the active choice, writes the cookie when you pin Light/Dark, and defers to the manager when “System Default” is selected so OS changes flow through automatically.
