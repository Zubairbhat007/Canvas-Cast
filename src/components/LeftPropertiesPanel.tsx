import { useRef } from 'react';
import type { CSSProperties, ChangeEvent } from 'react';
import type { ColorStyle, LayerAction, StrokeStyle, TextStyle, ToolType } from '../whiteboard/types';
import {
  BOARD_COLOR_OPTIONS,
  DEFAULT_BOARD_COLOR,
  DEFAULT_CORNER_RADIUS,
  DEFAULT_FILL_COLOR,
  DEFAULT_STROKE_STYLE,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_TEXT_STYLE,
  MAX_CORNER_RADIUS,
  MAX_STROKE_WIDTH,
  MIN_CORNER_RADIUS,
  MIN_STROKE_WIDTH,
  TEXT_FONT_OPTIONS,
  TEXT_FONT_SIZE_MAX,
  TEXT_FONT_SIZE_MIN,
  TEXT_FONT_SIZE_STEP,
  normalizeTextFontValue,
} from '../whiteboard/types';

type StyleChangeOptions = {
  commit?: boolean;
  target?: 'selection' | 'tool';
};

type LeftPropertiesPanelProps = {
  activeTool: ToolType;
  selectedCount: number;
  hasTextSelection: boolean;
  textStyle: TextStyle | null;
  colorStyle: ColorStyle | null;
  onTextStyleChange: (patch: Partial<TextStyle>) => void;
  onColorChange: (patch: Partial<ColorStyle>, options?: StyleChangeOptions) => void;
  strokeWidth: number | null;
  strokeStyle: StrokeStyle | null;
  fillColor: string | null | undefined;
  cornerRadius: number | null;
  onStrokeWidthChange: (value: number, options?: StyleChangeOptions) => void;
  onStrokeStyleChange: (value: StrokeStyle, options?: StyleChangeOptions) => void;
  onFillColorChange: (value: string | null, options?: StyleChangeOptions) => void;
  onCornerRadiusChange: (value: number, options?: StyleChangeOptions) => void;
  canTransformSelection: boolean;
  onRotateSelection: (degrees: number) => void;
  onFlipSelection: (axis: 'horizontal' | 'vertical') => void;
  canArrangeLayers: boolean;
  onLayerAction: (action: LayerAction) => void;
  canEditSelection: boolean;
  onDuplicateSelection: () => void;
  onDeleteSelection: () => void;
  showCropImageAction: boolean;
  canCropImage: boolean;
  onCropImage: () => void;
};

type PanelIconName =
  | 'rotate-left'
  | 'rotate-right'
  | 'flip-horizontal'
  | 'flip-vertical'
  | 'bring-forward'
  | 'send-backward'
  | 'bring-to-front'
  | 'send-to-back'
  | 'duplicate'
  | 'delete'
  | 'crop';

type PanelAction = {
  key: string;
  label: string;
  title: string;
  icon: PanelIconName;
  onClick: () => void;
};

const EXTENDED_COLOR_OPTIONS = Array.from(
  new Set([
    ...BOARD_COLOR_OPTIONS,
    '#6b7280',
    '#ffffff',
    '#facc15',
    '#06b6d4',
    '#ec4899',
  ])
);

const STYLE_TOOL_TYPES = new Set<ToolType>(['draw', 'rectangle', 'ellipse', 'line', 'arrow', 'text']);
const CREATION_TOOL_TYPES = new Set<ToolType>(['draw', 'rectangle', 'ellipse', 'line', 'arrow', 'text', 'image']);
const STROKE_STYLE_OPTIONS: Array<{ value: StrokeStyle; label: string }> = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

function LeftPropertiesPanel({
  activeTool,
  selectedCount,
  hasTextSelection,
  textStyle,
  colorStyle,
  onTextStyleChange,
  onColorChange,
  strokeWidth,
  strokeStyle,
  fillColor,
  cornerRadius,
  onStrokeWidthChange,
  onStrokeStyleChange,
  onFillColorChange,
  onCornerRadiusChange,
  canTransformSelection,
  onRotateSelection,
  onFlipSelection,
  canArrangeLayers,
  onLayerAction,
  canEditSelection,
  onDuplicateSelection,
  onDeleteSelection,
  showCropImageAction,
  canCropImage,
  onCropImage,
}: LeftPropertiesPanelProps) {
  const customColorInputRef = useRef<HTMLInputElement | null>(null);
  const customFillColorInputRef = useRef<HTMLInputElement | null>(null);
  const opacityDragRef = useRef(false);
  const latestOpacityRef = useRef(1);
  const strokeWidthDragRef = useRef(false);
  const latestStrokeWidthRef = useRef(DEFAULT_STROKE_WIDTH);
  const cornerRadiusDragRef = useRef(false);
  const latestCornerRadiusRef = useRef(DEFAULT_CORNER_RADIUS);
  const hasSelection = selectedCount > 0;
  const isToolMode = !hasSelection && CREATION_TOOL_TYPES.has(activeTool);
  const showTextControls = hasSelection
    ? selectedCount === 1 && hasTextSelection && Boolean(textStyle)
    : activeTool === 'text' && Boolean(textStyle);
  const showStyleControls = hasSelection ? Boolean(colorStyle) : STYLE_TOOL_TYPES.has(activeTool) && Boolean(colorStyle);
  const showSelectionActions = hasSelection;
  const effectiveTextStyle = textStyle ?? DEFAULT_TEXT_STYLE;
  const activeTextFont = normalizeTextFontValue(effectiveTextStyle.fontFamily);
  const activeTextFontSize = clampTextFontSize(effectiveTextStyle.fontSize);
  const activeColor = colorStyle?.color ?? DEFAULT_BOARD_COLOR;
  const opacityPercent = Math.round(clampOpacity(colorStyle?.opacity) * 100);
  const strokeWidthValue = strokeWidth === null ? DEFAULT_STROKE_WIDTH : clampStrokeWidth(strokeWidth);
  const cornerRadiusValue = cornerRadius === null ? DEFAULT_CORNER_RADIUS : clampCornerRadius(cornerRadius);
  const strokeStyleValue = strokeStyle ?? DEFAULT_STROKE_STYLE;
  const fillColorValue = normalizeFillColor(fillColor);
  const showFillColorControl = fillColor !== undefined;
  const showStrokeStyleControl = strokeStyle !== null;
  const showStrokeWidthControl = strokeWidth !== null;
  const showCornerRadiusControl = cornerRadius !== null;
  const styleTarget = hasSelection ? 'selection' : 'tool';
  const transformActions: PanelAction[] = [
    { key: 'rotate-left', label: 'Rotate Left', title: 'Rotate Left 90°', icon: 'rotate-left', onClick: () => onRotateSelection(-90) },
    { key: 'rotate-right', label: 'Rotate Right', title: 'Rotate Right 90°', icon: 'rotate-right', onClick: () => onRotateSelection(90) },
    { key: 'flip-horizontal', label: 'Flip Horizontal', title: 'Flip Horizontal', icon: 'flip-horizontal', onClick: () => onFlipSelection('horizontal') },
    { key: 'flip-vertical', label: 'Flip Vertical', title: 'Flip Vertical', icon: 'flip-vertical', onClick: () => onFlipSelection('vertical') },
  ];
  const layerActions: Array<{ key: LayerAction; label: string; title: string; icon: PanelIconName }> = [
    { key: 'bring-forward', label: 'Bring Forward', title: 'Bring Forward', icon: 'bring-forward' },
    { key: 'send-backward', label: 'Send Backward', title: 'Send Backward', icon: 'send-backward' },
    { key: 'bring-to-front', label: 'Bring to Front', title: 'Bring to Front', icon: 'bring-to-front' },
    { key: 'send-to-back', label: 'Send to Back', title: 'Send to Back', icon: 'send-to-back' },
  ];
  const operationActions: PanelAction[] = [
    { key: 'duplicate', label: 'Duplicate', title: 'Duplicate Selection', icon: 'duplicate', onClick: onDuplicateSelection },
    { key: 'delete', label: 'Delete', title: 'Delete Selection', icon: 'delete', onClick: onDeleteSelection },
  ];
  const cropImageAction: PanelAction = { key: 'crop', label: 'Crop Image', title: 'Crop Image', icon: 'crop', onClick: onCropImage };
  const handleCustomColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    onColorChange({ color: event.target.value }, { target: styleTarget, commit: true });
  };

  const handleCustomFillColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFillColorChange(event.target.value, { target: styleTarget, commit: true });
  };

  const handleOpacityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextOpacity = Number(event.target.value) / 100;
    latestOpacityRef.current = nextOpacity;
    onColorChange({ opacity: nextOpacity }, { target: styleTarget, commit: false });
  };

  const finishOpacityChange = () => {
    if (!opacityDragRef.current) {
      return;
    }

    opacityDragRef.current = false;
    onColorChange({ opacity: latestOpacityRef.current }, { target: styleTarget, commit: true });
  };

  const handleStrokeWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextStrokeWidth = clampStrokeWidth(Number(event.target.value));
    latestStrokeWidthRef.current = nextStrokeWidth;
    onStrokeWidthChange(nextStrokeWidth, { target: styleTarget, commit: false });
  };

  const finishStrokeWidthChange = () => {
    if (!strokeWidthDragRef.current) {
      return;
    }

    strokeWidthDragRef.current = false;
    onStrokeWidthChange(latestStrokeWidthRef.current, { target: styleTarget, commit: true });
  };

  const handleCornerRadiusChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextCornerRadius = clampCornerRadius(Number(event.target.value));
    latestCornerRadiusRef.current = nextCornerRadius;
    onCornerRadiusChange(nextCornerRadius, { target: styleTarget, commit: false });
  };

  const finishCornerRadiusChange = () => {
    if (!cornerRadiusDragRef.current) {
      return;
    }

    cornerRadiusDragRef.current = false;
    onCornerRadiusChange(latestCornerRadiusRef.current, { target: styleTarget, commit: true });
  };

  const renderColorPalette = () => (
    <div className="board-properties-panel__palette" aria-label="Color Selection">
      {EXTENDED_COLOR_OPTIONS.map((color) => {
        const isActive = activeColor === color;
        return (
          <button
            key={color}
            type="button"
            className={`board-properties-panel__color-swatch ${isActive ? 'board-properties-panel__color-swatch--active' : ''}`}
            style={{ '--swatch-color': color } as CSSProperties}
            onClick={() => onColorChange({ color }, { target: styleTarget, commit: true })}
            aria-label={`Switch color ${color}`}
          />
        );
      })}
      <button
        type="button"
        className="board-properties-panel__color-swatch board-properties-panel__color-swatch--custom"
        onClick={() => customColorInputRef.current?.click()}
        aria-label="Custom Color"
        title="Custom Color"
      >
      </button>
      <input
        ref={customColorInputRef}
        type="color"
        className="board-properties-panel__color-input"
        value={activeColor}
        onChange={handleCustomColorChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
  const renderFillPalette = () => (
    <div className="board-properties-panel__palette" aria-label="Fill Color Selection">
      <button
        type="button"
        className={`board-properties-panel__color-swatch board-properties-panel__color-swatch--none ${fillColorValue === null ? 'board-properties-panel__color-swatch--active' : ''}`}
        onClick={() => onFillColorChange(null, { target: styleTarget, commit: true })}
        aria-label="No Fill"
        title="No Fill"
      >
      </button>
      {EXTENDED_COLOR_OPTIONS.map((color) => {
        const isActive = fillColorValue === color;
        return (
          <button
            key={`fill-${color}`}
            type="button"
            className={`board-properties-panel__color-swatch ${isActive ? 'board-properties-panel__color-swatch--active' : ''}`}
            style={{ '--swatch-color': color } as CSSProperties}
            onClick={() => onFillColorChange(color, { target: styleTarget, commit: true })}
            aria-label={`Switch fill color ${color}`}
          />
        );
      })}
      <button
        type="button"
        className="board-properties-panel__color-swatch board-properties-panel__color-swatch--custom"
        onClick={() => customFillColorInputRef.current?.click()}
        aria-label="Custom Fill Color"
        title="Custom Fill Color"
      >
      </button>
      <input
        ref={customFillColorInputRef}
        type="color"
        className="board-properties-panel__color-input"
        value={fillColorValue ?? DEFAULT_BOARD_COLOR}
        onChange={handleCustomFillColorChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );


  return (
    <aside className="board-properties-panel" aria-label="Properties Panel">
      <div className="board-properties-panel__header">
        <h2 className="board-properties-panel__heading">{hasSelection ? `Properties` : isToolMode ? `Tool` : `Properties`}</h2>
        {isToolMode ? <p className="board-properties-panel__tool-name">{getToolDisplayName(activeTool)}</p> : null}
      </div>

      {!hasSelection && !isToolMode ? (
        <div className="board-properties-panel__empty">
          <p className="board-properties-panel__empty-title">{`Select an object to edit properties`}</p>
          <p className="board-properties-panel__empty-description">
            {`You can also switch to the pen, shape, or text tool to set the default style.`}
          </p>
        </div>
      ) : (
        <>
          {showTextControls ? (
            <section className="board-properties-panel__section">
              <h3 className="board-properties-panel__title">{`Text`}</h3>
              <div className="board-properties-panel__field">
                <span className="board-properties-panel__field-label">{`Font`}</span>
                <div className="board-properties-panel__font-grid" role="group" aria-label={`Font`}>
                  {TEXT_FONT_OPTIONS.map((option) => {
                    const isActive = activeTextFont === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`board-properties-panel__font-button${isActive ? ' board-properties-panel__font-button--active' : ''}`}
                        onClick={() => onTextStyleChange({ fontFamily: option.fontFamily })}
                        aria-pressed={isActive}
                        title={option.label}
                      >
                        <span className="board-properties-panel__font-preview" style={{ fontFamily: option.fontFamily }}>
                          {`Aa Text`}
                        </span>
                        <span className="board-properties-panel__font-label">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="board-properties-panel__field">
                <span className="board-properties-panel__field-label">{`Font Size - ${activeTextFontSize}px`}</span>
                <input
                  className="board-properties-panel__range"
                  type="range"
                  min={TEXT_FONT_SIZE_MIN}
                  max={TEXT_FONT_SIZE_MAX}
                  step={TEXT_FONT_SIZE_STEP}
                  value={activeTextFontSize}
                  onChange={(event) => onTextStyleChange({ fontSize: Number(event.target.value) })}
                />
              </label>
            </section>
          ) : null}

          {showStyleControls ? (
            <section className="board-properties-panel__section">
              <h3 className="board-properties-panel__title">{`Style`}</h3>
              {colorStyle?.color !== undefined ? (
                <div className="board-properties-panel__field board-properties-panel__subfield">
                  <span className="board-properties-panel__field-label">{`Stroke`}</span>
                  {renderColorPalette()}
                </div>
              ) : null}
              {showFillColorControl ? (
                <div className="board-properties-panel__field board-properties-panel__subfield">
                  <span className="board-properties-panel__field-label">{`Fill`}</span>
                  {renderFillPalette()}
                </div>
              ) : null}
              <label className="board-properties-panel__field">
                <span className="board-properties-panel__field-label">{`Opacity`}</span>
                <input
                  className="board-properties-panel__range"
                  type="range"
                  min={10}
                  max={100}
                  value={opacityPercent}
                  onChange={handleOpacityChange}
                  onPointerDown={() => {
                    opacityDragRef.current = true;
                    latestOpacityRef.current = opacityPercent / 100;
                  }}
                  onPointerUp={finishOpacityChange}
                  onPointerCancel={finishOpacityChange}
                  onBlur={finishOpacityChange}
                  onKeyUp={() => onColorChange({ opacity: latestOpacityRef.current }, { target: styleTarget, commit: true })}
                  aria-label="Opacity"
                />
              </label>
              {showStrokeWidthControl ? (
                <label className="board-properties-panel__field">
                  <span className="board-properties-panel__field-label">{`Stroke Width`}</span>
                  <input
                    className="board-properties-panel__range"
                    type="range"
                    min={MIN_STROKE_WIDTH}
                    max={MAX_STROKE_WIDTH}
                    value={strokeWidthValue}
                    onChange={handleStrokeWidthChange}
                    onPointerDown={() => {
                      strokeWidthDragRef.current = true;
                      latestStrokeWidthRef.current = strokeWidthValue;
                    }}
                    onPointerUp={finishStrokeWidthChange}
                    onPointerCancel={finishStrokeWidthChange}
                    onBlur={finishStrokeWidthChange}
                    onKeyUp={() => onStrokeWidthChange(latestStrokeWidthRef.current, { target: styleTarget, commit: true })}
                    aria-label="Stroke Width"
                  />
                </label>
              ) : null}
              {showCornerRadiusControl ? (
                <label className="board-properties-panel__field">
                  <span className="board-properties-panel__field-label">{`Corner Radius`}</span>
                  <input
                    className="board-properties-panel__range"
                    type="range"
                    min={MIN_CORNER_RADIUS}
                    max={MAX_CORNER_RADIUS}
                    value={cornerRadiusValue}
                    onChange={handleCornerRadiusChange}
                    onPointerDown={() => {
                      cornerRadiusDragRef.current = true;
                      latestCornerRadiusRef.current = cornerRadiusValue;
                    }}
                    onPointerUp={finishCornerRadiusChange}
                    onPointerCancel={finishCornerRadiusChange}
                    onBlur={finishCornerRadiusChange}
                    onKeyUp={() => onCornerRadiusChange(latestCornerRadiusRef.current, { target: styleTarget, commit: true })}
                    aria-label="Corner Radius"
                  />
                </label>
              ) : null}
              {showStrokeStyleControl ? (
                <div className="board-properties-panel__field">
                  <span className="board-properties-panel__field-label">{`Stroke Style`}</span>
                  <div className="board-properties-panel__segmented" role="group" aria-label="Stroke Style">
                    {STROKE_STYLE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`board-properties-panel__segment board-properties-panel__stroke-style-button ${strokeStyleValue === option.value ? 'board-properties-panel__segment--active' : ''}`}
                        onClick={() => onStrokeStyleChange(option.value, { target: styleTarget, commit: true })}
                        title={option.label}
                      >
                        <span className={`board-properties-panel__stroke-preview board-properties-panel__stroke-preview--${option.value}`} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {isToolMode && !showTextControls && !showStyleControls ? (
            <div className="board-properties-panel__empty board-properties-panel__empty--compact">
              <p className="board-properties-panel__empty-description">{`The current tool has no adjustable default properties.`}</p>
            </div>
          ) : null}

          {showSelectionActions ? (
            <>
              <section className="board-properties-panel__section">
                <h3 className="board-properties-panel__title">{`Transform`}</h3>
                <div className="board-properties-panel__action-grid">
                  {transformActions.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      className="board-properties-panel__action"
                      onClick={action.onClick}
                      disabled={!canTransformSelection}
                      title={action.title}
                    >
                      {renderPanelIcon(action.icon)}
                      {renderActionLabel(action.label)}
                    </button>
                  ))}
                </div>
              </section>

              <section className="board-properties-panel__section">
                <h3 className="board-properties-panel__title">{`Layer`}</h3>
                <div className="board-properties-panel__action-grid">
                  {layerActions.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      className="board-properties-panel__action"
                      onClick={() => onLayerAction(action.key)}
                      disabled={!canArrangeLayers}
                      title={action.title}
                    >
                      {renderPanelIcon(action.icon)}
                      {renderActionLabel(action.label)}
                    </button>
                  ))}
                </div>
              </section>
              <section className="board-properties-panel__section">
                <h3 className="board-properties-panel__title">{`Action`}</h3>
                <div className="board-properties-panel__action-grid">
                  {showCropImageAction ? (
                    <button
                      key={cropImageAction.key}
                      type="button"
                      className="board-properties-panel__action"
                      onClick={cropImageAction.onClick}
                      disabled={!canCropImage}
                      title={cropImageAction.title}
                    >
                      {renderPanelIcon(cropImageAction.icon)}
                      {renderActionLabel(cropImageAction.label)}
                    </button>
                  ) : null}
                  {operationActions.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      className="board-properties-panel__action"
                      onClick={action.onClick}
                      disabled={!canEditSelection}
                      title={action.title}
                    >
                      {renderPanelIcon(action.icon)}
                      {renderActionLabel(action.label)}
                    </button>
                  ))}
                </div>
              </section>
            </>
          ) : null}
        </>
      )}
    </aside>
  );
}

function renderActionLabel(label: string) {
  const splitLabels: Record<string, [string, string]> = {
    ['Flip Horizontal']: ['Flip', 'Horizontal'],
    ['Flip Vertical']: ['Flip', 'Vertical'],
    ['Bring Forward']: ['Bring', 'Forward'],
    ['Send Backward']: ['Send', 'Backward'],
    ['Bring to Front']: ['Bring', 'to Front'],
    ['Send to Back']: ['Send', 'to Back'],
    ['Crop Image']: ['Crop', 'Image'],
  };
  const lines = splitLabels[label];

  if (!lines) {
    return <span>{label}</span>;
  }

  return (
    <span className="board-properties-panel__action-label">
      <span>{lines[0]}</span>
      <span>{lines[1]}</span>
    </span>
  );
}
function renderPanelIcon(name: PanelIconName) {
  switch (name) {
    case 'rotate-left':
      return (
        <svg className="board-properties-panel__action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 7H4V3" />
          <path d="M5.2 7.2A7 7 0 1 1 4 11" />
          <path d="M12 9v4l3 2" />
        </svg>
      );
    case 'rotate-right':
      return (
        <svg className="board-properties-panel__action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16 7h4V3" />
          <path d="M18.8 7.2A7 7 0 1 0 20 11" />
          <path d="M12 9v4l-3 2" />
        </svg>
      );
    case 'flip-horizontal':
      return (
        <svg className="board-properties-panel__action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v16" />
          <path d="M4 7l5 5-5 5V7Z" />
          <path d="M20 7l-5 5 5 5V7Z" />
        </svg>
      );
    case 'flip-vertical':
      return (
        <svg className="board-properties-panel__action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 12h16" />
          <path d="M7 4l5 5 5-5H7Z" />
          <path d="M7 20l5-5 5 5H7Z" />
        </svg>
      );
    case 'bring-forward':
      return (
        <svg className="board-properties-panel__action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 16V7" />
          <path d="M8.5 10.5 12 7l3.5 3.5" />
          <rect x="6" y="16" width="12" height="4" rx="1.2" />
        </svg>
      );
    case 'send-backward':
      return (
        <svg className="board-properties-panel__action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8v9" />
          <path d="M8.5 13.5 12 17l3.5-3.5" />
          <rect x="6" y="4" width="12" height="4" rx="1.2" />
        </svg>
      );
    case 'bring-to-front':
      return (
        <svg className="board-properties-panel__action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 4h12" />
          <path d="M12 16V7" />
          <path d="M8.5 10.5 12 7l3.5 3.5" />
          <rect x="6" y="16" width="12" height="4" rx="1.2" />
        </svg>
      );
    case 'send-to-back':
      return (
        <svg className="board-properties-panel__action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 20h12" />
          <path d="M12 8v9" />
          <path d="M8.5 13.5 12 17l3.5-3.5" />
          <rect x="6" y="4" width="12" height="4" rx="1.2" />
        </svg>
      );
    case 'crop':
      return (
        <svg className="board-properties-panel__action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 3v12c0 1.7 1.3 3 3 3h12" />
          <path d="M3 6h12c1.7 0 3 1.3 3 3v12" />
          <path d="M9 6v9h9" />
        </svg>
      );
    case 'duplicate':
      return (
        <svg className="board-properties-panel__action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="8" y="8" width="10" height="10" rx="1.7" />
          <rect x="5" y="5" width="10" height="10" rx="1.7" />
        </svg>
      );
    case 'delete':
      return (
        <svg className="board-properties-panel__action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 7h14" />
          <path d="M10 7V5h4v2" />
          <path d="M8 10v8" />
          <path d="M12 10v8" />
          <path d="M16 10v8" />
          <path d="M7 7l1 14h8l1-14" />
        </svg>
      );
    default:
      return null;
  }
}
function clampTextFontSize(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_TEXT_STYLE.fontSize;
  }

  return Math.min(TEXT_FONT_SIZE_MAX, Math.max(TEXT_FONT_SIZE_MIN, Math.round(value / TEXT_FONT_SIZE_STEP) * TEXT_FONT_SIZE_STEP));
}

function clampOpacity(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0.1, value)) : 1;
}

function clampStrokeWidth(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(MAX_STROKE_WIDTH, Math.max(MIN_STROKE_WIDTH, Math.round(value)))
    : DEFAULT_STROKE_WIDTH;
}

function clampCornerRadius(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(MAX_CORNER_RADIUS, Math.max(MIN_CORNER_RADIUS, Math.round(value)))
    : DEFAULT_CORNER_RADIUS;
}


function normalizeFillColor(value: string | null | undefined) {
  if (value === undefined || value === null) {
    return DEFAULT_FILL_COLOR;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === '' || normalized === 'none' || normalized === 'transparent' ? DEFAULT_FILL_COLOR : value;
}
function getToolDisplayName(tool: ToolType) {
  switch (tool) {
    case 'draw':
      return 'Pen';
    case 'rectangle':
      return 'Rectangle';
    case 'ellipse':
      return 'Ellipse';
    case 'line':
      return 'Line';
    case 'arrow':
      return 'Arrow';
    case 'text':
      return 'Text';
    case 'image':
      return 'Image';
    default:
      return '';
  }
}

export default LeftPropertiesPanel;
