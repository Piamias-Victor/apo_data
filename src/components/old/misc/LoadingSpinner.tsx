import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 items-center justify-start min-h-screen mt-12">
      <div className="border-t-4 border-teal-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
      <span className="text-teal-700">Chargement en cours...</span>
    </div>
  );
};

export default LoadingSpinner;