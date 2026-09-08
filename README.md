# RPATV

Tomodachi-style local news for real-world headlines and the boys' increasingly reportable activity.

This first pass is a static visual prototype: four sample stories, original placeholder islander avatars, a broadcast queue, story controls, and optional browser narration. It does not yet connect to Discord, Steam, Last.fm, weather, or live news.

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
