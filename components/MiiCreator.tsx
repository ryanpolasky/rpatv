"use client";

import { type CSSProperties, useState } from "react";
import {
  ExternalLink,
  RotateCcw,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { MiiAnchor } from "@/components/MiiAnchor";
import {
  decodeMiiStudioData,
  MiiStudioField,
  normalizeMiiStudioData,
  updateMiiStudioField,
} from "@/lib/miiStudio";

type EditorPanel = "face" | "hair" | "features" | "body";

type MiiCreatorProps = {
  data: string;
  roleLabel: string;
  onReset: () => string;
  onSave: (data: string) => void;
};

type RangeControl = {
  field: MiiStudioField;
  label: string;
  max: number;
  min: number;
};

type ColorOption = {
  color: string;
  label: string;
  value: number;
};

const PANELS: { id: EditorPanel; label: string }[] = [
  { id: "face", label: "Face" },
  { id: "hair", label: "Hair" },
  { id: "features", label: "Features" },
  { id: "body", label: "Body" },
];

const FACE_CONTROLS: RangeControl[] = [
  { field: "faceType", label: "Face shape", min: 0, max: 11 },
  { field: "wrinklesType", label: "Face detail", min: 0, max: 11 },
  { field: "makeupType", label: "Makeup", min: 0, max: 11 },
];

const HAIR_CONTROLS: RangeControl[] = [
  { field: "hairType", label: "Hairstyle", min: 0, max: 131 },
];

const FEATURE_CONTROLS: RangeControl[] = [
  { field: "eyeType", label: "Eyes", min: 0, max: 59 },
  { field: "eyebrowType", label: "Eyebrows", min: 0, max: 24 },
  { field: "noseType", label: "Nose", min: 0, max: 17 },
  { field: "mouthType", label: "Mouth", min: 0, max: 35 },
  { field: "glassesType", label: "Glasses", min: 0, max: 8 },
  { field: "mustacheType", label: "Mustache", min: 0, max: 5 },
  { field: "beardType", label: "Beard", min: 0, max: 5 },
];

const BODY_CONTROLS: RangeControl[] = [
  { field: "height", label: "Height", min: 0, max: 127 },
  { field: "build", label: "Build", min: 0, max: 127 },
];

const SKIN_COLORS: ColorOption[] = [
  { value: 0, label: "Light 1", color: "#f6d5b5" },
  { value: 1, label: "Light 2", color: "#e7bd96" },
  { value: 2, label: "Medium 1", color: "#d7a477" },
  { value: 3, label: "Medium 2", color: "#bd8359" },
  { value: 4, label: "Tan", color: "#a96e45" },
  { value: 5, label: "Deep 1", color: "#855035" },
  { value: 6, label: "Deep 2", color: "#623724" },
];

const HAIR_COLORS: ColorOption[] = [
  { value: 8, label: "Black", color: "#292827" },
  { value: 1, label: "Dark brown", color: "#493226" },
  { value: 2, label: "Brown", color: "#72472e" },
  { value: 3, label: "Auburn", color: "#97482f" },
  { value: 4, label: "Gray", color: "#7e7770" },
  { value: 5, label: "Light brown", color: "#b47643" },
  { value: 6, label: "Blonde", color: "#d5b465" },
  { value: 7, label: "White", color: "#ded8cd" },
];

const EYE_COLORS: ColorOption[] = [
  { value: 8, label: "Black", color: "#292827" },
  { value: 9, label: "Gray", color: "#85898c" },
  { value: 10, label: "Brown", color: "#6c4530" },
  { value: 11, label: "Hazel", color: "#8f713c" },
  { value: 12, label: "Blue", color: "#3975a8" },
  { value: 13, label: "Green", color: "#4d8058" },
];

const SHIRT_COLORS: ColorOption[] = [
  { value: 0, label: "Red", color: "#d93b3b" },
  { value: 1, label: "Orange", color: "#e67d2f" },
  { value: 2, label: "Yellow", color: "#e5bc36" },
  { value: 3, label: "Lime", color: "#8abf48" },
  { value: 4, label: "Green", color: "#3d975a" },
  { value: 5, label: "Blue", color: "#3d67aa" },
  { value: 6, label: "Sky blue", color: "#59a8ca" },
  { value: 7, label: "Pink", color: "#d96d91" },
  { value: 8, label: "Purple", color: "#7359a3" },
  { value: 9, label: "Brown", color: "#75513c" },
  { value: 10, label: "White", color: "#e7e4dc" },
  { value: 11, label: "Black", color: "#33363a" },
];

function randomInteger(max: number) {
  return Math.floor(Math.random() * (max + 1));
}

function randomizeMii(data: string) {
  const randomizedFields: [MiiStudioField, number][] = [
    ["faceType", randomInteger(11)],
    ["skinColor", randomInteger(6)],
    ["hairType", randomInteger(131)],
    ["hairColor", HAIR_COLORS[randomInteger(HAIR_COLORS.length - 1)].value],
    ["eyeType", randomInteger(59)],
    ["eyeColor", EYE_COLORS[randomInteger(EYE_COLORS.length - 1)].value],
    ["eyebrowType", randomInteger(24)],
    ["noseType", randomInteger(17)],
    ["mouthType", randomInteger(35)],
    ["glassesType", Math.random() > 0.6 ? randomInteger(8) : 0],
    ["mustacheType", Math.random() > 0.75 ? randomInteger(5) : 0],
    ["beardType", Math.random() > 0.75 ? randomInteger(5) : 0],
    ["favoriteColor", randomInteger(11)],
    ["height", 28 + randomInteger(72)],
    ["build", 28 + randomInteger(72)],
  ];

  return randomizedFields.reduce(
    (current, [field, value]) =>
      updateMiiStudioField(current, field, value),
    data,
  );
}

function RangeEditor({
  control,
  data,
  onChange,
}: {
  control: RangeControl;
  data: string;
  onChange: (data: string) => void;
}) {
  const value = decodeMiiStudioData(data).design[control.field];

  return (
    <label className="creatorRange">
      <span>
        {control.label}
        <output>{value + 1}</output>
      </span>
      <input
        max={control.max}
        min={control.min}
        onChange={(event) =>
          onChange(
            updateMiiStudioField(
              data,
              control.field,
              Number(event.target.value),
            ),
          )
        }
        type="range"
        value={value}
      />
    </label>
  );
}

function ColorEditor({
  colors,
  data,
  field,
  label,
  onChange,
}: {
  colors: ColorOption[];
  data: string;
  field: MiiStudioField;
  label: string;
  onChange: (data: string) => void;
}) {
  const value = decodeMiiStudioData(data).design[field];

  return (
    <fieldset className="creatorColors">
      <legend>{label}</legend>
      <div>
        {colors.map((option) => (
          <button
            aria-label={`${label}: ${option.label}`}
            aria-pressed={value === option.value}
            className="colorChoice"
            key={option.value}
            onClick={() =>
              onChange(updateMiiStudioField(data, field, option.value))
            }
            style={{ "--swatch": option.color } as CSSProperties}
            title={option.label}
            type="button"
          />
        ))}
      </div>
    </fieldset>
  );
}

export function MiiCreator({
  data,
  roleLabel,
  onReset,
  onSave,
}: MiiCreatorProps) {
  const [draft, setDraft] = useState(data);
  const [panel, setPanel] = useState<EditorPanel>("face");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const design = decodeMiiStudioData(draft).design;
  const importId = `mii-import-${roleLabel.toLowerCase().replace(/\W+/g, "-")}`;

  const applyImport = () => {
    try {
      const normalized = normalizeMiiStudioData(importText);
      decodeMiiStudioData(normalized);
      setDraft(normalized);
      setImportText("");
      setImportError("");
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "That Mii code is invalid.",
      );
    }
  };

  return (
    <div className="creatorWorkspace">
      <div className="creatorPreview">
        <div className="creatorPreviewStage">
          <span className="creatorSpotlight" />
          <MiiAnchor
            animated={false}
            data={draft}
            label={`${roleLabel} casting preview`}
            speaking={false}
          />
        </div>
        <div className="creatorPreviewMeta">
          <span>Now casting</span>
          <strong>{roleLabel}</strong>
          <small>Authentic Mii Studio render</small>
        </div>
        <button
          className="creatorRandomize"
          onClick={() => setDraft(randomizeMii(draft))}
          type="button"
        >
          <Shuffle aria-hidden size={16} />
          Randomize responsibly
        </button>
      </div>

      <div className="creatorEditor">
        <div aria-label="Mii feature groups" className="creatorTabs">
          {PANELS.map((item) => (
            <button
              aria-pressed={panel === item.id}
              className={panel === item.id ? "active" : ""}
              key={item.id}
              onClick={() => setPanel(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="creatorControls">
          {panel === "face" && (
            <>
              <ColorEditor
                colors={SKIN_COLORS}
                data={draft}
                field="skinColor"
                label="Skin tone"
                onChange={setDraft}
              />
              {FACE_CONTROLS.map((control) => (
                <RangeEditor
                  control={control}
                  data={draft}
                  key={control.field}
                  onChange={setDraft}
                />
              ))}
            </>
          )}

          {panel === "hair" && (
            <>
              <ColorEditor
                colors={HAIR_COLORS}
                data={draft}
                field="hairColor"
                label="Hair color"
                onChange={setDraft}
              />
              {HAIR_CONTROLS.map((control) => (
                <RangeEditor
                  control={control}
                  data={draft}
                  key={control.field}
                  onChange={setDraft}
                />
              ))}
              <button
                aria-pressed={design.flipHair === 1}
                className="creatorToggle"
                onClick={() =>
                  setDraft(
                    updateMiiStudioField(
                      draft,
                      "flipHair",
                      design.flipHair === 1 ? 0 : 1,
                    ),
                  )
                }
                type="button"
              >
                Flip hairstyle
              </button>
            </>
          )}

          {panel === "features" && (
            <>
              <ColorEditor
                colors={EYE_COLORS}
                data={draft}
                field="eyeColor"
                label="Eye color"
                onChange={setDraft}
              />
              {FEATURE_CONTROLS.map((control) => (
                <RangeEditor
                  control={control}
                  data={draft}
                  key={control.field}
                  onChange={setDraft}
                />
              ))}
            </>
          )}

          {panel === "body" && (
            <>
              <div className="creatorGender" role="group" aria-label="Gender">
                <button
                  aria-pressed={design.gender === 0}
                  onClick={() =>
                    setDraft(updateMiiStudioField(draft, "gender", 0))
                  }
                  type="button"
                >
                  Boy
                </button>
                <button
                  aria-pressed={design.gender === 1}
                  onClick={() =>
                    setDraft(updateMiiStudioField(draft, "gender", 1))
                  }
                  type="button"
                >
                  Girl
                </button>
              </div>
              <ColorEditor
                colors={SHIRT_COLORS}
                data={draft}
                field="favoriteColor"
                label="Favorite color"
                onChange={setDraft}
              />
              {BODY_CONTROLS.map((control) => (
                <RangeEditor
                  control={control}
                  data={draft}
                  key={control.field}
                  onChange={setDraft}
                />
              ))}
            </>
          )}
        </div>

        <div className="creatorImport">
          <label htmlFor={importId}>
            Import Studio code or image URL
          </label>
          <div>
            <input
              id={importId}
              onChange={(event) => setImportText(event.target.value)}
              placeholder="94-character code or studio.mii.nintendo.com URL"
              spellCheck={false}
              type="text"
              value={importText}
            />
            <button onClick={applyImport} type="button">
              Import
            </button>
          </div>
          {importError && <p role="alert">{importError}</p>}
          <a href="https://mii.nxw.pw" rel="noreferrer" target="_blank">
            Open the full Mii Creator
            <ExternalLink aria-hidden size={14} />
          </a>
          <small>The external creator currently requires its own account.</small>
        </div>

        <div className="creatorActions">
          <button
            className="creatorReset"
            onClick={() => setDraft(onReset())}
            type="button"
          >
            <RotateCcw aria-hidden size={16} />
            Reset slot
          </button>
          <button
            className="creatorSave"
            onClick={() => onSave(draft)}
            type="button"
          >
            <Sparkles aria-hidden size={16} />
            Put {roleLabel} on air
          </button>
        </div>
      </div>
    </div>
  );
}
