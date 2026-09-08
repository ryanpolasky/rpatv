export const MII_STUDIO_DATA_PATTERN = /^[0-9a-f]{94}$/i;

const MII_STUDIO_FIELDS = [
  "facialHairColor",
  "beardType",
  "build",
  "eyeVerticalStretch",
  "eyeColor",
  "eyeRotation",
  "eyeScale",
  "eyeType",
  "eyeSpacing",
  "eyeYPosition",
  "eyebrowVerticalStretch",
  "eyebrowColor",
  "eyebrowRotation",
  "eyebrowScale",
  "eyebrowType",
  "eyebrowSpacing",
  "eyebrowYPosition",
  "skinColor",
  "makeupType",
  "faceType",
  "wrinklesType",
  "favoriteColor",
  "gender",
  "glassesColor",
  "glassesScale",
  "glassesType",
  "glassesYPosition",
  "hairColor",
  "flipHair",
  "hairType",
  "height",
  "moleScale",
  "moleEnabled",
  "moleXPosition",
  "moleYPosition",
  "mouthHorizontalStretch",
  "mouthColor",
  "mouthScale",
  "mouthType",
  "mouthYPosition",
  "mustacheScale",
  "mustacheType",
  "mustacheYPosition",
  "noseScale",
  "noseType",
  "noseYPosition",
] as const;

export type MiiStudioField = (typeof MII_STUDIO_FIELDS)[number];
export type MiiStudioDesign = Record<MiiStudioField, number>;

type DecodedMiiStudioData = {
  design: MiiStudioDesign;
  seed: number;
};

function hexToBytes(data: string) {
  const bytes = new Uint8Array(data.length / 2);

  for (let index = 0; index < data.length; index += 2) {
    bytes[index / 2] = Number.parseInt(data.slice(index, index + 2), 16);
  }

  return bytes;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function normalizeMiiStudioData(input: string) {
  let candidate = input.trim();

  if (candidate.includes("://")) {
    const url = new URL(candidate);
    candidate = url.searchParams.get("data") ?? "";
  }

  candidate = candidate.replace(/\s/g, "");

  if (!MII_STUDIO_DATA_PATTERN.test(candidate)) {
    throw new Error(
      "Paste a 94-character Mii Studio code or a Mii Studio image URL.",
    );
  }

  return candidate.toLowerCase();
}

export function decodeMiiStudioData(input: string): DecodedMiiStudioData {
  const data = normalizeMiiStudioData(input);
  const bytes = hexToBytes(data);
  const design = {} as MiiStudioDesign;
  let previous = bytes[0];

  MII_STUDIO_FIELDS.forEach((field, index) => {
    const encoded = bytes[index + 1];
    design[field] = ((encoded - 7 + 256) % 256) ^ previous;
    previous = encoded;
  });

  return { design, seed: bytes[0] };
}

export function encodeMiiStudioData(
  design: MiiStudioDesign,
  seed: number,
) {
  const bytes = new Uint8Array(MII_STUDIO_FIELDS.length + 1);
  let previous = seed;
  bytes[0] = seed;

  MII_STUDIO_FIELDS.forEach((field, index) => {
    const encoded = (7 + (design[field] ^ previous)) % 256;
    bytes[index + 1] = encoded;
    previous = encoded;
  });

  return bytesToHex(bytes);
}

export function updateMiiStudioField(
  data: string,
  field: MiiStudioField,
  value: number,
) {
  const decoded = decodeMiiStudioData(data);
  decoded.design[field] = value;
  return encodeMiiStudioData(decoded.design, decoded.seed);
}

export function renderMiiStudioUrl(
  data: string,
  expression = "normal",
  width = 512,
) {
  const params = new URLSearchParams({
    bgColor: "FFFFFF00",
    data,
    expression,
    instanceCount: "1",
    type: "all_body",
    width: String(width),
  });

  return `https://studio.mii.nintendo.com/miis/image.png?${params}`;
}
