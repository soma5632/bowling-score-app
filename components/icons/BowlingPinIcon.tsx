
import React from 'react';

export const BowlingPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    {...props}
  >
    <path d="M12 11.5c1.5 0 2.5-1.33 2.5-3.5a2.5 2.5 0 0 0-5 0c0 2.17 1 3.5 2.5 3.5z" />
    <path d="M12 2a5 5 0 0 0-5 5c0 1.5.5 3 2.5 4.5 2.5 2 5 2.5 5 4.5v3h-5" />
    <path d="M12 22h.01" />
  </svg>
);
