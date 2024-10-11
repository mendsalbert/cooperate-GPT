import React from "react";

export const Spinner: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
    {...props}
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M4 12a8 8 0 0 1 8-8" />
  </svg>
);
