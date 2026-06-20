import type { FrameBackgroundPreset } from '../frameBackgrounds';

type BackgroundSectionProps = {
  options: FrameBackgroundPreset[];
  selectedBackgroundId: string;
  onSelectBackground: (id: string) => void;
  onRandomSelect: () => void;
};

function BackgroundSection({
  options,
  selectedBackgroundId,
  onSelectBackground,
  onRandomSelect,
}: BackgroundSectionProps) {
  const hasBackgrounds = options.length > 0;

  return (
    <div className="section-block background-section">
      <div className="section-title">{'Background'}</div>
      <button
        type="button"
        className="background-random-button"
        onClick={onRandomSelect}
        disabled={!hasBackgrounds}
        title={hasBackgrounds ? 'Random background' : 'Random background available after adding background images'}
        aria-label="Random background"
      >
        <span className="background-random-button__icon" aria-hidden="true">↻</span>
        <span>{'Random background'}</span>
      </button>

      <div className="background-grid-scroll">
        <div className="background-grid">
          {options.map((option) => (
            <button
              type="button"
              key={option.id}
              className={`background-swatch background-swatch--image ${selectedBackgroundId === option.id ? 'background-swatch--selected' : ''}`}
              style={{ backgroundImage: `url(${option.src})` }}
              onClick={() => onSelectBackground(option.id)}
              aria-label={option.name}
              title={option.name}
            >
              {selectedBackgroundId === option.id && <span className="swatch-check" />}
            </button>
          ))}
        </div>
      </div>

      {!hasBackgrounds ? (
        <p className="background-empty-note">{'Place background images in src/assets/frame-backgrounds to show them here.'}</p>
      ) : null}
    </div>
  );
}

export default BackgroundSection;
