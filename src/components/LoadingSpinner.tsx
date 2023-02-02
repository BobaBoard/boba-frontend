import React from "react";
import classnames from "classnames";

const LoadingSpinner: React.FC<{
  loading: boolean;
  loadingMessage?: string;
  idleMessage?: string;
}> = (props) => {
  return (
    <>
      <div
        className="loading-spinner"
        role="progressbar"
        aria-valuetext={
          props.loading ? props.loadingMessage : props.idleMessage
        }
        aria-busy={props.loading}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={props.loading ? 0 : 100}
        aria-label="bottom page loading bar"
      >
        <div
          className={classnames("idle-indicator", {
            idle: !props.loading,
          })}
          aria-hidden="true"
        >
          {props.idleMessage}
        </div>
        {props.loadingMessage && (
          <div
            className={classnames("loading-indicator", {
              loading: props.loading,
            })}
            aria-hidden="true"
          >
            {props.loadingMessage}
          </div>
        )}
        <div className="bobadab-container">
          <div
            className={classnames("bobadab", {
              refetching: props.loading,
            })}
            onClick={() => {
              window.scroll({
                top: 0,
                behavior: "smooth",
              });
            }}
            aria-label="Scroll to top"
          />
        </div>
      </div>
      <div className="spacer" />
      <style jsx>{`
        .loading-spinner {
          position: absolute;
          bottom: 0;
          width: 100%;
        }
        .spacer {
          height: 90px;
        }
        .idle-indicator,
        .loading-indicator {
          color: white;
          text-align: center;
          padding: 0px;
          padding-bottom: 75px;
          display: none;
        }
        .loading-indicator.loading {
          display: block;
        }
        .idle-indicator.idle {
          display: block;
        }
        .bobadab-container {
          position: absolute;
          width: 70px;
          height: 70px;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          overflow: hidden;
        }
        .bobadab {
          background-image: url("/bobadab.png");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          width: 50px;
          height: 50px;
          position: absolute;
          bottom: 0;
          left: 10px;
        }
        .bobadab.refetching {
          animation: rotation 2s infinite linear;
          transform-origin: center;
        }
        @keyframes rotation {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(359deg);
          }
        }
        .bobadab:hover {
          cursor: pointer;
        }
        .bobadab.refetching {
          display: block;
        }
      `}</style>
    </>
  );
};

export default LoadingSpinner;
