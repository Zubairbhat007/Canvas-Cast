import type { AspectRatioItem } from '../mockOptions';

type AspectRatioSectionProps = {
  options: AspectRatioItem[];
  selectedKey: string;
  onSelect: (value: AspectRatioItem['key']) => void;
  showTitle?: boolean;
};

const aspectRatioDescriptions: Record<string, string> = {
  '16:9': 'YouTube / Bilibili',
  '4:3': 'Classic',
  '3:4': 'Xiaohongshu',
  '9:16': 'TikTok',
  '1:1': 'Square',
  custom: 'Custom',
};

function getAspectDescription(item: AspectRatioItem) {
  return aspectRatioDescriptions[item.label] ?? aspectRatioDescriptions[item.key] ?? '';
}

function AspectRatioSection({ options, selectedKey, onSelect, showTitle = true }: AspectRatioSectionProps) {
  return (
    <div className="section-block section-block--compact">
      {showTitle ? <div className="section-title">Canvas Aspect Ratio</div> : null}
      <div className="option-grid option-grid--aspect-ratio">
        {options.map((item) => {
          const description = getAspectDescription(item);

          return (
            <button
              type="button"
              key={item.key}
              className={`option-button option-button--aspect-ratio ${selectedKey === item.key ? 'option-button--active' : ''}`}
              onClick={() => onSelect(item.key)}
            >
              <span className="option-button__title">{item.label}</span>
              {description ? <span className="option-button__subtitle">{description}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AspectRatioSection;
