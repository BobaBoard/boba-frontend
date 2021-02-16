import classnames from "classnames";

const LoadingSpinner: React.FC<{
  loading: boolean;
  loadingMessage: string;
  idleMessage?: string;
}> = (props) => {
  return (
    <>
      <div className="container">
        <div
          className={classnames("idle-indicator", {
            idle: !props.loading,
          })}
        >
          {props.idleMessage}
        </div>
        <div
          className={classnames("loading-indicator", {
            loading: props.loading,
          })}
        >
          {props.loadingMessage}
        </div>
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
          />
        </div>
      </div>
      <div className="spacer" />
      <style jsx>{`
        .container {
          position: absolute;
          bottom: 0;
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
