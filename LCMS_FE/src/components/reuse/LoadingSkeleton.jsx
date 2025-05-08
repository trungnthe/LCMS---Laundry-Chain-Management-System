import React from "react";

const loadingSkeleton = () => {
  return (
    <div style={{ width: "100%" }}>
      <div className="skeleton-container">
        <div class="skeleton-loader">
          <div class="skeleton-wrapper">
            <div class="skeleton-circle"></div>
            <div class="skeleton-line-1"></div>
            <div class="skeleton-line-2"></div>
            <div class="skeleton-line-3"></div>
            <div class="skeleton-line-4"></div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .skeleton-container {
          width: 100%;
          height: 17vh;
        }

        /* From Uiverse.io by Nawsome */
        .skeleton-loader {
          position: relative;
          width: 100%;
          height: 100%;
          margin-bottom: 10px;
          border: 1px solid #d3d3d3;
          padding: 15px;
          background-color: #e3e3e3;
          padding-bottom: 1%;
          overflow: hidden;
        }

        .skeleton-loader:after {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: linear-gradient(
            110deg,
            rgba(227, 227, 227, 0) 0%,
            rgba(227, 227, 227, 0) 40%,
            rgba(227, 227, 227, 0.5) 50%,
            rgba(227, 227, 227, 0) 60%,
            rgba(227, 227, 227, 0) 100%
          );
          animation: gradient-animation_2 1.2s linear infinite;
        }

        .skeleton-loader .skeleton-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .skeleton-loader .skeleton-wrapper > div {
          background-color: #cacaca;
        }

        .skeleton-loader .skeleton-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }

        .skeleton-loader .skeleton-button {
          display: inline-block;
          height: 32px;
          width: 75px;
        }

        .skeleton-loader .skeleton-line-1 {
          position: absolute;
          top: 11px;
          left: 58px;
          height: 10px;
          width: 200px;
        }

        .skeleton-loader .skeleton-line-2 {
          position: absolute;
          top: 34px;
          left: 58px;
          height: 10px;
          width: 250px;
        }

        .skeleton-loader .skeleton-line-3 {
          position: absolute;
          top: 57px;
          left: 0px;
          height: 10px;
          width: 100%;
        }

        .skeleton-loader .skeleton-line-4 {
          position: absolute;
          top: 80px;
          left: 0px;
          height: 10px;
          width: 92%;
        }

        @keyframes gradient-animation_2 {
          0% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default loadingSkeleton;
