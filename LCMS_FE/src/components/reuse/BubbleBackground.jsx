import React, { useEffect, useRef } from "react";

const BubbleBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set container style
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "0";
    container.style.overflow = "hidden";

    // Function to create a bubble
    const createBubble = () => {
      const bubble = document.createElement("div");

      // Random size between 30px and 120px
      const size = Math.random() * 90 + 30;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;

      // Bubble styling
      bubble.style.borderRadius = "50%";
      bubble.style.position = "absolute";
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.bottom = "-120px";
      bubble.style.opacity = Math.random() * 0.6 + 0.4;
      bubble.style.boxShadow = "0px 0px 20px rgba(255, 255, 255, 0.5)";

      // Simulating a more realistic bubble texture
      bubble.style.background = `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 10%, rgba(173, 216, 230, 0.6) 30%, rgba(100, 149, 237, 0.3) 70%, rgba(0, 0, 255, 0.1))`;
      bubble.style.border = "2px solid rgba(255, 255, 255, 0.6)";

      // Random animation properties
      const duration = Math.random() * 6 + 4;
      const rotation = Math.random() * 360;
      bubble.style.transition = `transform ${duration}s ease-out, opacity ${duration}s linear`;

      // Add to container
      container.appendChild(bubble);

      // Start animation
      setTimeout(() => {
        bubble.style.transform = `translateY(-${
          window.innerHeight + 120
        }px) rotate(${rotation}deg) scale(1.2)`;
        bubble.style.opacity = "0";
      }, 10);

      // Remove bubble after animation completes
      setTimeout(() => {
        if (container.contains(bubble)) {
          container.removeChild(bubble);
        }
      }, duration * 1000);
    };

    // Create fewer bubbles at a lower frequency
    const bubbleInterval = setInterval(() => {
      // Create 3-6 bubbles at once
      const bubbleCount = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < bubbleCount; i++) {
        createBubble();
      }
    }, 700);

    // Cleanup on unmount
    return () => {
      clearInterval(bubbleInterval);
    };
  }, []);

  return <div ref={containerRef} className="bubble-background"></div>;
};

export default BubbleBackground;
