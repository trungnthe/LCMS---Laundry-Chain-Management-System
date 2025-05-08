import React from "react";
import "../../assets/css/reuse/loadingState.css";
import { div } from "framer-motion/client";

const LoadingState = () => {
  return (
    <div class="loader-container">
      <div class="loader"></div>
      <div class="wrapper">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="shadow"></div>
        <div class="shadow"></div>
        <div class="shadow"></div>
      </div>
    </div>
  );
};

export default LoadingState;
