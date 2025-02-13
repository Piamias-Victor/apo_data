import React from "react";

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return <p className="text-red-500 text-center">{error}</p>;
};

export default ErrorDisplay;