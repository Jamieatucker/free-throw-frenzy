import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Show Restart (destructive wipe) — typically in-game only. */
  showRestart?: boolean;
  onRestart?: () => void;
  onMenu?: () => void;
  /** Extra class on the glass screen (e.g. game layout). */
  screenClassName?: string;
}

const CrtShell: React.FC<Props> = ({
  children,
  showRestart = false,
  onRestart,
  onMenu,
  screenClassName = '',
}) => {
  return (
    <div className="crt-page">
      <div className="crt-tv" role="presentation">
        <div className="crt-bezel-inner">
          <div className="crt-screen-wrap">
            <div className={`crt-screen ${screenClassName}`.trim()}>
              <div className="crt-screen-content">{children}</div>
            </div>
            <div className="crt-scanlines" aria-hidden />
            <div className="crt-glass-glare" aria-hidden />
          </div>
        </div>

        <div className="crt-panel">
          <div className="crt-speaker" aria-hidden />
          <div className="crt-panel-blank" aria-hidden />
          <div className="crt-controls">
            <div className="crt-ir" aria-hidden title="IR sensor" />
            <div className="crt-standby" aria-hidden>
              <span className="crt-standby-led" />
              Stand By
            </div>
            {showRestart && (
              <button
                type="button"
                className="crt-btn"
                onClick={onRestart}
                title="Restart — clears coins and unlocks"
              >
                Restart
              </button>
            )}
            {onMenu && (
              <button type="button" className="crt-btn crt-btn--power" onClick={onMenu}>
                Menu
              </button>
            )}
          </div>
        </div>

        <div className="crt-feet" aria-hidden>
          <div className="crt-foot" />
          <div className="crt-foot" />
        </div>
      </div>
    </div>
  );
};

export default CrtShell;
