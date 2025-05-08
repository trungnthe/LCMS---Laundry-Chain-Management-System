import React from "react";
import "../../assets/css/reuse/loadingSpinner.css";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden my-spinner">
      {/* Simple Loading Spinner with CSS */}
      <div className="my-loading-spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
