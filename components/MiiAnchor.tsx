"use client";

import { renderMiiStudioUrl } from "@/lib/miiStudio";

type MiiAnchorProps = {
  animated?: boolean;
  data: string;
  label: string;
  speaking: boolean;
};

export const DEFAULT_MII_CAST = {
  ryan: {
    data: "000f145b5f5e646e49546169687477858e878a87878e969d9c9fa6b3b9c0e5acafb6bbb6bcb6b9b8bebfc3cfd1d9da",
    label: "A Mii news anchor named Ryan",
  },
  shua: {
    data: "000d142a303f434b717a7b84939ba6b2bbbec5cbc9d0e2ea010d15252b3250535960736f726870757f8289a0a7aeb1",
    label: "A Mii news analyst named Shua",
  },
};

export function MiiAnchor({
  animated = true,
  data,
  label,
  speaking,
}: MiiAnchorProps) {
  return (
    <div
      aria-label={label}
      className={`miiAnchor ${speaking ? "miiAnchorSpeaking" : ""}`}
      role="img"
    >
      <span
        className="miiPose miiPoseNormal"
        style={{
          backgroundImage: `url("${renderMiiStudioUrl(data, "normal")}")`,
        }}
      />
      {animated && (
        <>
          <span
            className="miiPose miiPoseTalking"
            style={{
              backgroundImage: `url("${renderMiiStudioUrl(data, "normal_open_mouth")}")`,
            }}
          />
          <span
            className="miiPose miiPoseBlink"
            style={{
              backgroundImage: `url("${renderMiiStudioUrl(data, "blink")}")`,
            }}
          />
        </>
      )}
    </div>
  );
}
