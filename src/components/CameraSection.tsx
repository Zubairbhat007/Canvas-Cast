import type { CameraSettings, MediaDeviceChoice } from '../cameraTypes';

type CameraSectionProps = {
  settings: CameraSettings;
  onChange: (patch: Partial<CameraSettings>) => void;
  videoDevices: MediaDeviceChoice[];
  audioDevices: MediaDeviceChoice[];
  mediaError: string | null;
  onRefreshDevices: () => void;
};

function CameraSection({
  settings,
  onChange,
  videoDevices,
  audioDevices,
  mediaError,
  onRefreshDevices,
}: CameraSectionProps) {
  return (
    <div className="section-block">
      <div className="section-title">Camera and Microphone</div>

      <div className="camera-settings-grid">
        <label className="camera-setting-field">
          <span>Microphone Device</span>
          <select
            value={settings.audioDeviceId}
            onFocus={onRefreshDevices}
            onChange={(event) => onChange({ audioDeviceId: event.target.value })}
          >
            <option value="">No Microphone</option>
            <option value="default">Default Microphone</option>
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </label>

        {audioDevices.length === 0 ? <p className="camera-note">No microphone device detected.</p> : null}
      </div>

      <div className="camera-control">
        <div>
          <div className="camera-label">Camera PIP</div>
          <p className="camera-note">When enabled, it will be displayed on the whiteboard and included in the recording.</p>
        </div>
        <button
          type="button"
          className={`toggle-switch ${settings.enabled ? 'toggle-switch--on' : ''}`}
          onClick={() => onChange({ enabled: !settings.enabled })}
          aria-pressed={settings.enabled}
        >
          <span className="toggle-thumb" />
        </button>
      </div>

      {settings.enabled ? (
        <>
          <div className="camera-settings-grid">
            <label className="camera-setting-field">
              <span>Camera Device</span>
              <select
                value={settings.videoDeviceId}
                onFocus={onRefreshDevices}
                onChange={(event) => onChange({ videoDeviceId: event.target.value })}
              >
                <option value="">Default Camera</option>
                {videoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="camera-setting-field camera-setting-field--range">
              <span className="setting-field-title">Camera Size - {settings.size}px</span>
              <span>Camera Size</span>
              <input
                type="range"
                min="96"
                max="280"
                step="8"
                value={settings.size}
                onChange={(event) => onChange({ size: Number(event.target.value) })}
              />
              <strong>{settings.size}px</strong>
            </label>

            <div className="camera-setting-field">
              <span>Shape</span>
              <div className="camera-shape-options" role="group" aria-label="Camera Shape">
                <button
                  type="button"
                  className={`camera-shape-option ${settings.shape === 'circle' ? 'camera-shape-option--active' : ''}`}
                  onClick={() => onChange({ shape: 'circle' })}
                >
                  Circle
                </button>
                <button
                  type="button"
                  className={`camera-shape-option ${settings.shape === 'square' ? 'camera-shape-option--active' : ''}`}
                  onClick={() => onChange({ shape: 'square' })}
                >
                  Square
                </button>
              </div>
            </div>
          </div>

          {videoDevices.length === 0 ? <p className="camera-note">No camera device detected.</p> : null}
        </>
      ) : null}

      {mediaError ? <p className="camera-error">{mediaError}</p> : null}
    </div>
  );
}

export default CameraSection;
