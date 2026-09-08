# RPATV

Tomodachi-style local news for real-world headlines and the boys' increasingly reportable activity.

This first pass is a static visual prototype: four sample stories, Mii Studio-rendered placeholder anchors, a broadcast queue, story controls, and optional browser narration. It does not yet connect to Discord, Steam, Last.fm, weather, or live news.

The placeholder cast uses Nintendo's public Mii Studio image endpoint. Future cast members can be swapped in by replacing their Mii Studio data strings.

## Run it

```bash
npm install
npm run dev
```

## Verify it

```bash
npm run lint
npm run typecheck
npm run build
```

The Next.js app is configured for static export, so production output is written to `out/`.
