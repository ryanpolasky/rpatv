"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { MiiCreator } from "@/components/MiiCreator";
import { DEFAULT_MII_CAST, MiiAnchor } from "@/components/MiiAnchor";
import {
  MII_STUDIO_DATA_PATTERN,
  normalizeMiiStudioData,
} from "@/lib/miiStudio";
import { speakMiiLine } from "@/lib/miiVoice";

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
  media?: {
    alt: string;
    credit: string;
    src: string;
  };
};

const STORY_DURATION = 10_000;
const CAST_STORAGE_KEY = "rpatv-mii-cast-v1";

type CastRole = keyof typeof DEFAULT_MII_CAST;
type CastState = Record<CastRole, string>;

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
    media: {
      alt: "Counter-Strike 2 key art showing two armed operators",
      credit: "Counter-Strike 2 · Steam",
      src: "https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg",
    },
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

function StoryVisual({ story }: { story: Story }) {
  if (story.media) {
    return (
      <div className="storyVisual storyPhoto">
        <Image
          alt={story.media.alt}
          fill
          priority={story.slug === "sixth-hour"}
          sizes="(max-width: 650px) 45vw, 32vw"
          src={story.media.src}
        />
        <span className="storyPhotoShade" />
        <div className="gameClock">
          <small>Session duration</small>
          06:12:44
        </div>
        <span className="storyCredit">{story.media.credit}</span>
      </div>
    );
  }

  if (story.scene === "planet") {
    return (
      <div className="storyVisual planetScene">
        <div className="planet" />
        <div className="planetOrbit" />
        <div className="planetTag">Zoned residential</div>
      </div>
    );
  }

  if (story.scene === "market") {
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
  const [castOpen, setCastOpen] = useState(false);
  const [castRole, setCastRole] = useState<CastRole>("ryan");
  const [cast, setCast] = useState<CastState>({
    ryan: DEFAULT_MII_CAST.ryan.data,
    chip: DEFAULT_MII_CAST.chip.data,
  });
  const activeStory = STORIES[activeIndex];
  const activeCastRole: CastRole =
    activeStory.scene === "market" ? "chip" : "ryan";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved: unknown = JSON.parse(
          window.localStorage.getItem(CAST_STORAGE_KEY) ?? "{}",
        );

        if (typeof saved !== "object" || saved === null) return;

        const stored = saved as Record<string, unknown>;
        setCast((current) => ({
          ryan:
            typeof stored.ryan === "string" &&
            MII_STUDIO_DATA_PATTERN.test(stored.ryan)
              ? normalizeMiiStudioData(stored.ryan)
              : current.ryan,
          chip:
            typeof stored.chip === "string" &&
            MII_STUDIO_DATA_PATTERN.test(stored.chip)
              ? normalizeMiiStudioData(stored.chip)
              : current.chip,
        }));
      } catch {
        window.localStorage.removeItem(CAST_STORAGE_KEY);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

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

    speakMiiLine(activeStory.speech, activeCastRole);

    return () => window.speechSynthesis.cancel();
  }, [activeCastRole, activeStory, muted, playing]);

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
  const saveCast = (role: CastRole, data: string) => {
    const nextCast = { ...cast, [role]: normalizeMiiStudioData(data) };
    setCast(nextCast);
    window.localStorage.setItem(CAST_STORAGE_KEY, JSON.stringify(nextCast));
    setCastOpen(false);
  };

  const resetCast = (role: CastRole) => {
    const nextCast = { ...cast, [role]: DEFAULT_MII_CAST[role].data };
    setCast(nextCast);
    window.localStorage.setItem(CAST_STORAGE_KEY, JSON.stringify(nextCast));
    return nextCast[role];
  };

  return (
    <div className="pageShell">
      <header className="siteHeader">
        <div className="channelIdentity">
          <div aria-label="RPATV" className="wordmark">
            RPA<span>TV</span>
          </div>
          <span>Island News Channel</span>
        </div>
        <div className="channelMeta">
          <span>
            <i className="liveDot" /> On air
          </span>
          <span>Monday · 7:04 PM</span>
          <button
            aria-expanded={castOpen}
            aria-controls="casting-room"
            className="castButton"
            onClick={() => setCastOpen((current) => !current)}
            type="button"
          >
            <Users aria-hidden size={15} />
            Cast a Mii
          </button>
        </div>
      </header>

      <section
        aria-label="Mii News broadcast player"
        className="broadcastShell"
      >
        <div className="television">
          <div className="stage">
            <div className="studioHalo" />
            <div className="studioPanel studioPanelLeft" />
            <div className="studioPanel studioPanelRight" />
            <div className="studioFloor" />

            <div className="programTitle">
              <span>RPATV Channel 1</span>
              <strong>Island</strong>
              <strong>News</strong>
              <small>Today&apos;s happenings, carefully misunderstood.</small>
            </div>

            <div className="storyMonitor">
              <div className="monitorHeader">
                <span>{activeStory.dateline}</span>
                <span>Picture report</span>
              </div>
              <StoryVisual story={activeStory} />
            </div>

            <div className="anchorPod">
              <MiiAnchor
                data={cast[activeCastRole]}
                label={DEFAULT_MII_CAST[activeCastRole].label}
                speaking={playing}
              />
            </div>

            <div className="newsDesk">
              <div className="deskTop" />
              <span className="deskMark">Mii News</span>
              <i className="deskLight deskLightOne" />
              <i className="deskLight deskLightTwo" />
              <i className="deskLight deskLightThree" />
            </div>

            <div className="channelBug">
              <i />
              Island News
            </div>

            <div aria-live="polite" className="broadcastCaption">
              <div className="captionSpeaker">
                <strong>{activeStory.anchor}</strong>
                <span>{activeStory.anchorRole}</span>
              </div>
              <div className="captionCopy">
                <span className="lowerLabel">{activeStory.kicker}</span>
                <h1>{activeStory.headline}</h1>
                <p>{activeStory.summary}</p>
              </div>
            </div>
          </div>

          <div className="ticker">
            <span className="tickerLabel">Latest</span>
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
              <SkipBack aria-hidden size={18} strokeWidth={2.6} />
              <span>Back</span>
            </button>
            <button
              aria-label={playing ? "Pause broadcast" : "Play broadcast"}
              className="iconButton primary"
              onClick={() => setPlaying((current) => !current)}
              title={playing ? "Pause broadcast" : "Play broadcast"}
              type="button"
            >
              {playing ? (
                <Pause aria-hidden fill="currentColor" size={18} />
              ) : (
                <Play aria-hidden fill="currentColor" size={18} />
              )}
              <span>{playing ? "Pause" : "Play"}</span>
            </button>
            <button
              aria-label="Next story"
              className="iconButton"
              onClick={nextStory}
              title="Next story"
              type="button"
            >
              <SkipForward aria-hidden size={18} strokeWidth={2.6} />
              <span>Next</span>
            </button>
            <button
              aria-label={muted ? "Turn Mii voice on" : "Turn Mii voice off"}
              className="iconButton"
              onClick={() => setMuted((current) => !current)}
              title={muted ? "Turn Mii voice on" : "Turn Mii voice off"}
              type="button"
            >
              {muted ? (
                <VolumeX aria-hidden size={18} strokeWidth={2.4} />
              ) : (
                <Volume2 aria-hidden size={18} strokeWidth={2.4} />
              )}
              <span>{muted ? "Voice on" : "Voice off"}</span>
            </button>
          </div>

          <div className="timeline">
            <div className="timelineMeta">
              <span>
                Story {activeIndex + 1} of {STORIES.length}
              </span>
              <span>{playing ? "On air" : "Paused"}</span>
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
            <span>Updated 7:04 PM</span>
          </div>
        </div>

        <nav aria-label="Choose a news story" className="storyList">
          {STORIES.map((story, index) => (
            <button
              aria-current={index === activeIndex ? "true" : undefined}
              className={`storyButton ${index === activeIndex ? "active" : ""}`}
              key={story.slug}
              onClick={() => selectStory(index)}
              type="button"
            >
              <span
                className={`storyThumbnail storyThumbnail-${story.scene}`}
                style={
                  story.media
                    ? { backgroundImage: `url("${story.media.src}")` }
                    : undefined
                }
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
              </span>
              <span className="storyInfo">
                <span>{story.kicker.split(" · ")[0]}</span>
                <strong>{story.headline}</strong>
              </span>
            </button>
          ))}
        </nav>

        <aside aria-label="Island reaction" className="quoteBlock">
          <span>Island reaction</span>
          <blockquote>“{activeStory.quote}”</blockquote>
          <cite>{activeStory.quoteBy}</cite>
        </aside>

        {castOpen && (
          <section
            aria-labelledby="casting-room-title"
            className="castStudio"
            id="casting-room"
          >
            <div className="castStudioHeader">
              <div>
                <span>RPATV personnel department</span>
                <h2 id="casting-room-title">Casting room</h2>
                <p>Build a real Mii, then assign them to the news desk.</p>
              </div>
              <button
                aria-label="Close casting room"
                className="castClose"
                onClick={() => setCastOpen(false)}
                type="button"
              >
                <X aria-hidden size={20} />
              </button>
            </div>

            <div aria-label="Choose a cast slot" className="castRoleTabs">
              {(Object.keys(DEFAULT_MII_CAST) as CastRole[]).map((role) => (
                <button
                  aria-pressed={castRole === role}
                  key={role}
                  onClick={() => setCastRole(role)}
                  type="button"
                >
                  <span>{role === "ryan" ? "Main desk" : "Market desk"}</span>
                  <strong>{role === "ryan" ? "Ryan P." : "Chip M."}</strong>
                </button>
              ))}
            </div>

            <MiiCreator
              data={cast[castRole]}
              key={castRole}
              onReset={() => resetCast(castRole)}
              onSave={(data) => saveCast(castRole, data)}
              roleLabel={castRole === "ryan" ? "Ryan P." : "Chip M."}
            />
          </section>
        )}
      </section>

      <footer className="pageFooter">
        <span>RPATV · The island&apos;s most trusted source</span>
        <span>Sample data · Locally saved Mii cast</span>
      </footer>
    </div>
  );
}
