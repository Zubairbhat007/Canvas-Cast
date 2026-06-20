import { useMemo, useRef } from 'react';
import AspectRatioSection from './AspectRatioSection';
import BackgroundSection from './BackgroundSection';
import CameraSection from './CameraSection';
import type { CameraSettings, CanvasBackgroundPattern, MediaDeviceChoice, RecordingVisualSettings } from '../cameraTypes';
import PreviewPanel from './PreviewPanel';
import { getCanvasPatternColor, normalizeCanvasBackgroundColor } from '../canvasBackground';
import { aspectRatioOptions } from '../mockOptions';
import { frameBackgroundPresets } from '../frameBackgrounds';

const CANVAS_PADDING_MAX = 80;
const CANVAS_BACKGROUND_SPACING_MIN = 40;
const CANVAS_BACKGROUND_SPACING_MAX = 140;

const canvasBackgroundColors = [
  { label: 'Off White', value: '#fbfaf6' },
  { label: 'Beige', value: '#f5e6bd' },
  { label: 'Mint', value: '#e4f0ec' },
  { label: 'Light Pink', value: '#f0e5e1' },
  { label: 'Dark', value: '#242424' },
];

const canvasBackgroundPatterns: Array<{ label: string; value: CanvasBackgroundPattern }> = [
  { label: 'None', value: 'none' },
  { label: 'Ruled', value: 'ruled' },
  { label: 'Grid', value: 'grid' },
  { label: 'Dots', value: 'dots' },
];

type RecordingSettingsModalProps = {
  activeAspect: string;
  onAspectChange: (aspect: string) => void;
  activeBackgroundId: string;
  onBackgroundChange: (backgroundId: string) => void;
  recordingVisualSettings: RecordingVisualSettings;
  onRecordingVisualSettingsChange: (patch: Partial<RecordingVisualSettings>) => void;
  cameraSettings: CameraSettings;
  onCameraSettingsChange: (patch: Partial<CameraSettings>) => void;
  videoDevices: MediaDeviceChoice[];
  audioDevices: MediaDeviceChoice[];
  cameraStream: MediaStream | null;
  mediaError: string | null;
  onRefreshDevices: () => void;
  onClose?: () => void;
};

function RecordingSettingsModal({
  activeAspect,
  onAspectChange,
  activeBackgroundId,
  onBackgroundChange,
  recordingVisualSettings,
  onRecordingVisualSettingsChange,
  cameraSettings,
  onCameraSettingsChange,
  videoDevices,
  audioDevices,
  cameraStream,
  mediaError,
  onRefreshDevices,
  onClose,
}: RecordingSettingsModalProps) {
  const selectedBackground = useMemo(
    () => frameBackgroundPresets.find((option) => option.id === activeBackgroundId) ?? null,
    [activeBackgroundId]
  );

  const activeAspectItem = aspectRatioOptions.find((option) => option.key === activeAspect) ?? aspectRatioOptions[4];

  const handleRandomBackground = () => {
    const current = frameBackgroundPresets[Math.floor(Math.random() * frameBackgroundPresets.length)];
    if (current) {
      onBackgroundChange(current.id);
    }
  };

  return (
    <div className="modal-shell">
      <div className="modal-layout">
        <section className="preview-column">
          <div className="preview-content-group">
            <PreviewPanel
              aspectRatio={activeAspectItem.ratio}
              background={selectedBackground}
              visualSettings={recordingVisualSettings}
              cameraSettings={cameraSettings}
              cameraStream={cameraStream}
            />
          </div>
        </section>

        <section className="settings-column">
          <div className="settings-header">
            <div className="settings-header-row">
              <div className="settings-title">Recording Settings</div>
              <button type="button" className="close-button" aria-label="Close" onClick={onClose}>
                ×
              </button>
            </div>
          </div>

          <div className="settings-content">
            <div className="settings-scroll">
              <div className="settings-group settings-group--section">
                <CanvasSection
                  activeAspect={activeAspect}
                  onAspectChange={onAspectChange}
                  settings={recordingVisualSettings}
                  onChange={onRecordingVisualSettingsChange}
                />
              </div>

              <div className="settings-group settings-group--section">
                <BackgroundSection
                  options={frameBackgroundPresets}
                  selectedBackgroundId={activeBackgroundId}
                  onSelectBackground={onBackgroundChange}
                  onRandomSelect={handleRandomBackground}
                />
              </div>

              <div className="settings-group settings-group--section">
                <CameraSection
                  settings={cameraSettings}
                  onChange={onCameraSettingsChange}
                  videoDevices={videoDevices}
                  audioDevices={audioDevices}
                  mediaError={mediaError}
                  onRefreshDevices={onRefreshDevices}
                />
              </div>

              <div className="settings-group settings-group--section">
                <CursorEffectSection settings={recordingVisualSettings} onChange={onRecordingVisualSettingsChange} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function CanvasSection({
  activeAspect,
  onAspectChange,
  settings,
  onChange,
}: {
  activeAspect: string;
  onAspectChange: (aspect: string) => void;
  settings: RecordingVisualSettings;
  onChange: (patch: Partial<RecordingVisualSettings>) => void;
}) {
  const canvasPaddingValue = Math.min(settings.canvasPadding, CANVAS_PADDING_MAX);
  const canvasBackgroundSpacing = clampBackgroundSpacing(settings.canvasBackgroundSpacing);
  const selectedBackgroundColor = (settings.canvasBackgroundColor || '#fbfaf6').toLowerCase();
  const selectedPattern = settings.canvasBackgroundPattern ?? 'none';
  const previewBackgroundSpacing = Math.max(8, Math.min(12, canvasBackgroundSpacing * 0.15));
  const spacingVisible = selectedPattern !== 'none';
  const customColorInputRef = useRef<HTMLInputElement | null>(null);
  const isPresetColorSelected = canvasBackgroundColors.some((color) => color.value === selectedBackgroundColor);

  return (
    <div className="section-block">
      <div className="section-title">Canvas</div>
      <div className="settings-subsection">
        <div className="settings-subsection-title">Canvas Aspect Ratio</div>
        <AspectRatioSection
          options={aspectRatioOptions}
          selectedKey={activeAspect}
          onSelect={onAspectChange}
          showTitle={false}
        />
      </div>
      <div className="settings-subsection">
        <div className="settings-field-label">Canvas Color</div>
        <div className="canvas-background-color-grid" role="group" aria-label="Canvas Color">
          {canvasBackgroundColors.map((color) => (
            <button
              key={color.value}
              type="button"
              className={`canvas-background-color ${selectedBackgroundColor === color.value ? 'canvas-background-color--active' : ''}`}
              style={{ background: color.value }}
              onClick={() => onChange({ canvasBackgroundColor: color.value })}
              aria-label={color.label}
              title={color.label}
            />
          ))}
          <button
            type="button"
            className={`canvas-background-color canvas-background-color--custom ${!isPresetColorSelected ? 'canvas-background-color--active' : ''}`}
            onClick={() => customColorInputRef.current?.click()}
            aria-label="Custom Canvas Color"
            title="Custom Canvas Color"
          >
            <span>+</span>
            <input
              ref={customColorInputRef}
              type="color"
              value={selectedBackgroundColor}
              onChange={(event) => onChange({ canvasBackgroundColor: event.target.value })}
              aria-label="Custom Canvas Color"
            />
          </button>
        </div>

        <div className="settings-field-label">Canvas Pattern</div>
        <div className="canvas-pattern-grid" role="group" aria-label="Canvas Pattern">
          {canvasBackgroundPatterns.map((pattern) => (
            <button
              key={pattern.value}
              type="button"
              className={`canvas-pattern-option canvas-pattern-option--${pattern.value} ${selectedPattern === pattern.value ? 'canvas-pattern-option--active' : ''}`}
              onClick={() => onChange({ canvasBackgroundPattern: pattern.value })}
            >
              <span
                className="canvas-pattern-preview-card"
                style={getCanvasBackgroundPreviewCss(selectedBackgroundColor, pattern.value, previewBackgroundSpacing)}
                aria-hidden="true"
              />
              <span className="canvas-pattern-label">{pattern.label}</span>
            </button>
          ))}
        </div>

        {spacingVisible ? (
          <label className="camera-setting-field camera-setting-field--range canvas-background-spacing">
            <span className="setting-field-title">Spacing - {canvasBackgroundSpacing}px</span>
            <span>Spacing</span>
            <input
              type="range"
              min={CANVAS_BACKGROUND_SPACING_MIN}
              max={CANVAS_BACKGROUND_SPACING_MAX}
              step="2"
              value={canvasBackgroundSpacing}
              onChange={(event) => onChange({ canvasBackgroundSpacing: Number(event.target.value) })}
            />
            <strong>{canvasBackgroundSpacing}px</strong>
          </label>
        ) : null}
      </div>
      <div className="settings-subsection">
        <div className="settings-subsection-title">Layout</div>
        <label className="camera-setting-field camera-setting-field--range">
          <span className="setting-field-title">Canvas Border Radius - {settings.canvasRadius}px</span>
          <span>Canvas Border Radius</span>
          <input
            type="range"
            min="0"
            max="80"
            step="4"
            value={settings.canvasRadius}
            onChange={(event) => onChange({ canvasRadius: Number(event.target.value) })}
          />
          <strong>{settings.canvasRadius}px</strong>
        </label>
        <label className="camera-setting-field camera-setting-field--range">
          <span className="setting-field-title">Canvas Padding - {canvasPaddingValue}px</span>
          <span>Canvas Padding</span>
          <input
            type="range"
            min="0"
            max={CANVAS_PADDING_MAX}
            step="8"
            value={canvasPaddingValue}
            onChange={(event) => onChange({ canvasPadding: Number(event.target.value) })}
          />
          <strong>{canvasPaddingValue}px</strong>
        </label>
      </div>
    </div>
  );
}

function CursorEffectSection({
  settings,
  onChange,
}: {
  settings: RecordingVisualSettings;
  onChange: (patch: Partial<RecordingVisualSettings>) => void;
}) {
  return (
    <div className="section-block">
      <div className="section-title">Cursor</div>
      <div className="camera-shape-options" role="group" aria-label="Cursor">
        <button
          type="button"
          className={`camera-shape-option ${settings.cursorEffect === 'none' ? 'camera-shape-option--active' : ''}`}
          onClick={() => onChange({ cursorEffect: 'none' })}
        >
          Hide Cursor
        </button>
        <button
          type="button"
          className={`camera-shape-option ${settings.cursorEffect === 'cursor' ? 'camera-shape-option--active' : ''}`}
          onClick={() => onChange({ cursorEffect: 'cursor' })}
        >
          Default Cursor
        </button>
        <button
          type="button"
          className={`camera-shape-option ${settings.cursorEffect === 'highlight' ? 'camera-shape-option--active' : ''}`}
          onClick={() => onChange({ cursorEffect: 'highlight' })}
        >
          Highlight Cursor
        </button>
      </div>
    </div>
  );
}

function getCanvasBackgroundPreviewCss(
  backgroundColor: string,
  pattern: CanvasBackgroundPattern,
  spacing: number
) {
  const color = normalizeCanvasBackgroundColor(backgroundColor);
  const previewSpacing = Math.max(2, spacing);
  const patternColor = getCanvasPatternColor(color);

  if (pattern === 'ruled') {
    return {
      backgroundColor: color,
      backgroundImage: `linear-gradient(${patternColor} 1px, transparent 1px)`,
      backgroundSize: `${previewSpacing}px ${previewSpacing}px`,
    };
  }

  if (pattern === 'grid') {
    return {
      backgroundColor: color,
      backgroundImage: `linear-gradient(${patternColor} 1px, transparent 1px), linear-gradient(90deg, ${patternColor} 1px, transparent 1px)`,
      backgroundSize: `${previewSpacing}px ${previewSpacing}px`,
    };
  }

  if (pattern === 'dots') {
    return {
      backgroundColor: color,
      backgroundImage: `radial-gradient(circle, ${patternColor} 1.2px, transparent 1.45px)`,
      backgroundSize: `${previewSpacing}px ${previewSpacing}px`,
    };
  }

  return { backgroundColor: color, backgroundImage: 'none', backgroundSize: 'auto' };
}
function clampBackgroundSpacing(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 64;
  }

  return Math.min(CANVAS_BACKGROUND_SPACING_MAX, Math.max(CANVAS_BACKGROUND_SPACING_MIN, Number(value)));
}

export default RecordingSettingsModal;










