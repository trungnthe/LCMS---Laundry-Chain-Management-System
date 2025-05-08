import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state to display a fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can log error info to an external service
    console.error("Error caught by Error Boundary:", error);
    console.error("Error info:", info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any fallback UI
      return <h2>Something went wrong. Please try again later.</h2>;
    }

    return this.props.children; // Render the child components normally if no error
  }
}

export default ErrorBoundary;
