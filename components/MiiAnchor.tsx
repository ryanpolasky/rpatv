"use client";

type MiiVariant = "ryan" | "chip";

type MiiAnchorProps = {
  speaking: boolean;
  variant: MiiVariant;
};

const MII_STUDIO_DATA: Record<
  MiiVariant,
  {
    data: string;
    label: string;
  }
> = {
  ryan: {
    data: "000f145b5f5e646e49546169687477858e878a87878e969d9c9fa6b3b9c0e5acafb6bbb6bcb6b9b8bebfc3cfd1d9da",
    label: "A Mii news anchor named Ryan",
  },
  chip: {
    data: "000d142a303f434b717a7b84939ba6b2bbbec5cbc9d0e2ea010d15252b3250535960736f726870757f8289a0a7aeb1",
    label: "A Mii market analyst named Chip",
  },
};

function renderUrl(data: string, expression: string) {
  const params = new URLSearchParams({
    bgColor: "FFFFFF00",
    data,
    expression,
    instanceCount: "1",
    type: "all_body",
    width: "512",
  });

  return `https://studio.mii.nintendo.com/miis/image.png?${params}`;
}

export function MiiAnchor({ speaking, variant }: MiiAnchorProps) {
  const mii = MII_STUDIO_DATA[variant];

  return (
    <div
      aria-label={mii.label}
      className={`miiAnchor ${speaking ? "miiAnchorSpeaking" : ""}`}
      role="img"
    >
      <span
        className="miiPose miiPoseNormal"
        style={{ backgroundImage: `url("${renderUrl(mii.data, "normal")}")` }}
      />
      <span
        className="miiPose miiPoseTalking"
        style={{
          backgroundImage: `url("${renderUrl(mii.data, "normal_open_mouth")}")`,
        }}
      />
      <span
        className="miiPose miiPoseBlink"
        style={{ backgroundImage: `url("${renderUrl(mii.data, "blink")}")` }}
      />
    </div>
  );
}
