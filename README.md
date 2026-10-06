# pi-mod

Mods for [pi](https://github.com/earendil-works/pi-coding-agent), inspired by
["You can now mod Claude Code"](https://x.com/ClaudeDevs/status/2105721434807083061).
A mod is a small TypeScript module that hooks pi's events and changes how it
behaves — same idea, pi extension API instead of Claude Code plugins.

## Mods

| Mod | Command | What it does |
|-----|---------|--------------|
| [pr](extensions/pr.ts) | `/pr [title]` | Pushes the current branch and opens a GitHub PR via `gh` |

## Install

```bash
pi install git:github.com/tkoyama010/pi-mod
```

Requires the [GitHub CLI](https://cli.github.com/) (`gh`) to be installed and authenticated.

## Write your own

Mods are pi extensions. Drop a `.ts` file into `~/.pi/agent/extensions/`
(global) or `.pi/extensions/` (project-local), or clone this repo and run:

```bash
pi -e ./extensions/pr.ts
```

See the [pi extensions docs](https://github.com/earendil-works/pi-coding-agent/blob/main/docs/extensions.md).

## License

MIT
