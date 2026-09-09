# RPATV

Tomodachi-style local news for real-world headlines and the boys' increasingly reportable activity.

This first pass is a static visual prototype: four sample stories, Mii Studio-rendered anchors, an in-browser casting room, a broadcast queue, story controls, and optional character-specific browser narration. The cast and gaming details are based on the public RyLive squad feed rather than invented people. Its Wii-era channel UI supports remote story artwork with visible attribution alongside native infographic scenes; the Counter-Strike report currently pulls official Steam artwork. It does not yet connect directly to Discord, Steam activity, Last.fm, weather, or live news.

The casting room edits the compact Mii Studio data format directly and previews each change through Nintendo's public Mii Studio image endpoint. Cast assignments are stored only in the browser's `localStorage`; no Mii data is uploaded to RPATV and no Nintendo model resources are bundled with the site. Existing 94-character Mii Studio codes and Mii Studio image URLs can also be imported.

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
