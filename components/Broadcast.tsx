"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

type StoryScene = "gaming" | "planet" | "market" | "weather";

type Story = {
  slug: string;
  kicker: string;
  headline: string;
  summary: string;
  anchor: string;
  anchorRole: string;
  scene: StoryScene;
  dateline: string;
  quote: string;
  quoteBy: string;
  ticker: string;
  speech: string;
};

type IslanderName = "ryan" | "market";

const STORY_DURATION = 10_000;

const STORIES: Story[] = [
  {
    slug: "sixth-hour",
    kicker: "Developing · Steam Desk",
    headline: "Local man opens Counter-Strike for sixth consecutive hour",
    summary:
      "Repeated requests for comment were answered with “one more.” Experts now believe this statement may not describe a finite quantity.",
    anchor: "Ryan P.",
    anchorRole: "Evening anchor",
    scene: "gaming",
    dateline: "The Discord",
    quote: "I am getting off after this one.",
    quoteBy: "Brennan · 4 hours ago",
    ticker: "Brennan seen entering another Premier lobby",
    speech:
      "Our top story. Local man Brennan has opened Counter-Strike for the sixth consecutive hour. He says he is getting off after this one. Island News has been unable to determine which one.",
  },
  {
    slug: "new-planet",
    kicker: "World · Science Desk",
    headline: "Astronomers flag a suspiciously habitable super-Earth",
    summary:
      "The distant planet may have liquid water. The island zoning board has already approved three mixed-use developments and a vape shop.",
    anchor: "Ryan P.",
    anchorRole: "Planet correspondent",
    scene: "planet",
    dateline: "Deep space",
    quote: "Commute looks rough, but the rent is unbelievable.",
    quoteBy: "Adam · Prospective resident",
    ticker: "Island council claims planet before other islands notice",
    speech:
      "In science news, astronomers have flagged a suspiciously habitable super-Earth. Adam called the commute rough, but described the rent as unbelievable.",
  },
  {
    slug: "rybucks-loss",
    kicker: "Markets · Closing Bell",
    headline: "Ryan loses 4,600 RyBucks betting against himself",
    summary:
      "The position collapsed minutes after Ryan listened to the exact genre he publicly insisted he was finished with.",
    anchor: "Chip M.",
    anchorRole: "Financial analyst",
    scene: "market",
    dateline: "RyMarket",
    quote: "The thesis was sound. My behavior was the issue.",
    quoteBy: "Ryan · Majority shareholder",
    ticker: "Lo-fi futures rally on reports Ryan opened Ableton",
    speech:
      "Markets closed sharply lower for Ryan, who lost four thousand six hundred RyBucks betting against his own listening history. He maintains the thesis was sound.",
  },
  {
    slug: "muted-storm",
    kicker: "Weather · Island Alert",
    headline: "Thunderstorm expected; Adam remains muted",
    summary:
      "Residents should avoid low-lying roads and asking whether Adam knows he is muted. Both situations are considered dangerous.",
    anchor: "Ryan P.",
    anchorRole: "Weather substitute",
    scene: "weather",
    dateline: "The Island",
    quote: "—",
    quoteBy: "Adam · No audible comment",
    ticker: "Outdoor plans downgraded from unlikely to impossible",
    speech:
      "A thunderstorm warning remains active across the island. Adam joined Discord muted forty seven minutes ago and has declined audible comment.",
  },
];

const ISLANDERS: Record<
  IslanderName,
  {
    label: string;
    skin: string;
    hair: string;
    jacket: string;
    shirt: string;
    glasses?: boolean;
    hairStyle: "swoop" | "part";
  }
> = {
  ryan: {
    label: "Ryan, Island News anchor",
    skin: "#f0b98f",
    hair: "#5a3526",
    jacket: "#254e78",
    shirt: "#fff9e8",
    glasses: true,
    hairStyle: "swoop",
  },
  market: {
    label: "Chip, RyMarket analyst",
    skin: "#edb184",
    hair: "#c47d36",
    jacket: "#39435d",
    shirt: "#dbe8f5",
    hairStyle: "part",
  },
};

function Islander({
  name,
  speaking = false,
}: {
  name: IslanderName;
  speaking?: boolean;
}) {
  const person = ISLANDERS[name];

  return (
    <svg
      aria-label={person.label}
      className={`islander ${speaking ? "islanderSpeaking" : ""}`}
      role="img"
      viewBox="0 0 260 330"
    >
      <ellipse cx="130" cy="323" fill="rgba(9,24,41,.18)" rx="78" ry="10" />
      <path
        d="M62 330c3-66 23-101 68-101s65 35 68 101H62Z"
        fill={person.jacket}
      />
      <path d="m106 239 24 37 24-37-24-15-24 15Z" fill={person.shirt} />
      <path d="M115 213h30v34h-30z" fill={person.skin} />
      <ellipse cx="69" cy="146" fill={person.skin} rx="17" ry="23" />
      <ellipse cx="191" cy="146" fill={person.skin} rx="17" ry="23" />
      <path
        d="M75 78c19-39 92-48 116 1 14 29 7 93-13 122-12 18-29 29-48 29-20 0-37-11-49-30-19-29-23-92-6-122Z"
        fill={person.skin}
      />
      {person.hairStyle === "swoop" ? (
        <path
          d="M72 113c-5-40 18-75 58-78 39-4 66 24 64 64-17-22-45-34-84-27-4 19-18 32-38 41Z"
          fill={person.hair}
        />
      ) : (
        <path
          d="M69 107c-1-38 19-72 62-73 36 0 62 24 64 62-19-16-34-24-51-28-19 11-39 19-75 39Z"
          fill={person.hair}
        />
      )}
      <path
        d="M92 129c8-7 19-8 29-2M141 127c10-5 21-4 29 3"
        fill="none"
        stroke="#3a2824"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <ellipse cx="108" cy="145" fill="#172131" rx="5.5" ry="8" />
      <ellipse cx="153" cy="145" fill="#172131" rx="5.5" ry="8" />
      <path
        d="M131 148c-2 10-4 17-8 22 5 4 11 4 16 0"
        fill="none"
        stroke="#bc775f"
        strokeLinecap="round"
        strokeWidth="3.5"
      />
      <path
        d={
          speaking
            ? "M111 188c12-10 27-10 39 0-8 15-30 15-39 0Z"
            : "M113 188c12 7 24 7 35 0"
        }
        fill={speaking ? "#7e3940" : "none"}
        stroke="#873e43"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      {person.glasses && (
        <>
          <rect
            fill="none"
            height="29"
            rx="10"
            stroke="#172131"
            strokeWidth="5"
            width="39"
            x="86"
            y="132"
          />
          <rect
            fill="none"
            height="29"
            rx="10"
            stroke="#172131"
            strokeWidth="5"
            width="39"
            x="137"
            y="132"
          />
          <path d="M125 144h12" stroke="#172131" strokeWidth="5" />
        </>
      )}
    </svg>
  );
}

function StoryVisual({ scene }: { scene: StoryScene }) {
  if (scene === "gaming") {
    return (
      <div className="storyVisual gamingScene">
        <div className="gameClock">
          <small>Session duration</small>
          06:12:44
        </div>
        <div className="gameMonitor" />
        <div className="tinyDesk" />
      </div>
    );
  }

  if (scene === "planet") {
    return (
      <div className="storyVisual planetScene">
        <div className="planet" />
        <div className="planetOrbit" />
        <div className="planetTag">Zoned residential</div>
      </div>
    );
  }

  if (scene === "market") {
    return (
      <div className="storyVisual marketScene">
        <div className="marketScore">
          <span>Ryan portfolio · Today</span>
          <strong>−4,600</strong>
        </div>
        <svg
          aria-label="RyMarket chart falling sharply"
          className="marketChart"
          role="img"
          viewBox="0 0 500 180"
        >
          <line x1="0" x2="500" y1="30" y2="30" />
          <line x1="0" x2="500" y1="90" y2="90" />
          <line x1="0" x2="500" y1="150" y2="150" />
          <polyline points="0,28 70,43 125,35 186,70 245,62 298,94 348,84 397,122 449,117 500,165" />
        </svg>
      </div>
    );
  }

  return (
    <div className="storyVisual weatherScene">
      <div className="weatherMap" />
      <div className="stormCell" />
      <div className="rainLines">│││{"\n"}│││</div>
      <div className="weatherTemp">61°</div>
    </div>
  );
}

export function Broadcast() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const activeStory = STORIES[activeIndex];

  const selectStory = useCallback((index: number) => {
    setActiveIndex((index + STORIES.length) % STORIES.length);
    setProgress(0);
  }, []);

  const previousStory = useCallback(() => {
    selectStory(activeIndex - 1);
  }, [activeIndex, selectStory]);

  const nextStory = useCallback(() => {
    selectStory(activeIndex + 1);
  }, [activeIndex, selectStory]);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = current + (100 / STORY_DURATION) * 100;
        if (next >= 100) {
          setActiveIndex((index) => (index + 1) % STORIES.length);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (!playing || muted || !("speechSynthesis" in window)) {
      window.speechSynthesis?.cancel();
      return;
    }

    const line = new SpeechSynthesisUtterance(activeStory.speech);
    line.rate = 0.92;
    line.pitch = 1.13;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(line);

    return () => window.speechSynthesis.cancel();
  }, [activeStory, muted, playing]);

  useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLButtonElement
      ) {
        return;
      }

      if (event.key === "ArrowLeft") previousStory();
      if (event.key === "ArrowRight") nextStory();
      if (event.key === " ") {
        event.preventDefault();
        setPlaying((current) => !current);
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [nextStory, previousStory]);

  const tickerItems = [...STORIES, ...STORIES];

  return (
    <div className="pageShell">
      <header className="siteHeader">
        <div aria-label="RPATV" className="wordmark">
          RPA<span>TV</span>
        </div>
        <div className="channelMeta">
          <span>
            <i className="liveDot" /> On air
          </span>
          <span>Ch. 01 · Monday evening</span>
        </div>
      </header>

      <section
        aria-label="Island News broadcast player"
        className="broadcastShell"
      >
        <div>
          <div className="television">
            <div className="stage">
              <div className="studioArc" />
              <div className="studioStripe" />
              <div className="studioSun" />
              <div className="programTitle">
                <span>RPATV presents</span>
                <strong>Island</strong>
                <strong>News</strong>
              </div>

              <div className="storyMonitor">
                <div className="monitorHeader">
                  <span>{activeStory.dateline}</span>
                  <span>Live-ish</span>
                </div>
                <StoryVisual scene={activeStory.scene} />
              </div>

              <div className="anchorPod">
                <Islander
                  name={activeStory.scene === "market" ? "market" : "ryan"}
                  speaking={playing}
                />
              </div>
              <div className="newsDesk">
                <span className="deskMark">Island News</span>
              </div>

              <div className="channelBug">
                <i />
                RPATV live
              </div>

              <div aria-live="polite" className="lowerThird">
                <div className="lowerLabel">{activeStory.kicker}</div>
                <div className="lowerBody">
                  <div className="headlineBlock">
                    <h1>{activeStory.headline}</h1>
                    <p>{activeStory.summary}</p>
                  </div>
                  <div className="anchorLabel">
                    <strong>{activeStory.anchor}</strong>
                    <span>{activeStory.anchorRole}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ticker">
              <span className="tickerLabel">News wire</span>
              <div className="tickerTrack">
                {tickerItems.map((story, index) => (
                  <span key={`${story.slug}-${index}`}>{story.ticker}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="controlDeck">
            <div aria-label="Broadcast controls" className="transport">
              <button
                aria-label="Previous story"
                className="iconButton"
                onClick={previousStory}
                title="Previous story"
                type="button"
              >
                <SkipBack aria-hidden size={17} strokeWidth={2.4} />
              </button>
              <button
                aria-label={playing ? "Pause broadcast" : "Play broadcast"}
                className="iconButton primary"
                onClick={() => setPlaying((current) => !current)}
                title={playing ? "Pause broadcast" : "Play broadcast"}
                type="button"
              >
                {playing ? (
                  <Pause aria-hidden fill="currentColor" size={17} />
                ) : (
                  <Play aria-hidden fill="currentColor" size={17} />
                )}
              </button>
              <button
                aria-label="Next story"
                className="iconButton"
                onClick={nextStory}
                title="Next story"
                type="button"
              >
                <SkipForward aria-hidden size={17} strokeWidth={2.4} />
              </button>
              <button
                aria-label={muted ? "Turn narration on" : "Mute narration"}
                className="iconButton"
                onClick={() => setMuted((current) => !current)}
                title={muted ? "Turn narration on" : "Mute narration"}
                type="button"
              >
                {muted ? (
                  <VolumeX aria-hidden size={17} strokeWidth={2.4} />
                ) : (
                  <Volume2 aria-hidden size={17} strokeWidth={2.4} />
                )}
              </button>
            </div>

            <div className="timeline">
              <div className="timelineMeta">
                <span>
                  Story {activeIndex + 1} of {STORIES.length}
                </span>
                <span>{playing ? "Rolling" : "Held"}</span>
              </div>
              <div
                aria-label={`${Math.round(progress)} percent through current story`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={Math.round(progress)}
                className="progressRail"
                role="progressbar"
              >
                <div
                  className="progressFill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="editionMeta">
              Edition 0001
              <span>Demo feed · 7:04 PM</span>
            </div>
          </div>
        </div>

        <aside aria-label="Run of show" className="runOfShow">
          <div className="runHeader">
            <span className="runEyebrow">Tonight on channel one</span>
            <h2>Run of show</h2>
          </div>

          <div className="storyList">
            {STORIES.map((story, index) => (
              <button
                aria-current={index === activeIndex ? "true" : undefined}
                className={`storyButton ${index === activeIndex ? "active" : ""}`}
                key={story.slug}
                onClick={() => selectStory(index)}
                type="button"
              >
                <span className="storyNumber">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="storyInfo">
                  <span>{story.kicker.split(" · ")[0]}</span>
                  <strong>{story.headline}</strong>
                </span>
              </button>
            ))}
          </div>

          <div className="quoteBlock">
            <blockquote>“{activeStory.quote}”</blockquote>
            <cite>{activeStory.quoteBy}</cite>
          </div>
        </aside>
      </section>

      <footer className="pageFooter">
        <span>RPATV · The island&apos;s most trusted source</span>
        <span>Prototype feed · Sample data · Original placeholder avatars</span>
      </footer>
    </div>
  );
}
