
import React from 'react';

export const CarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 16.5V18a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.5" />
    <path d="M20 10h-5.5" />
    <path d="M4 10h2.5" />
    <path d="M14 4h-4" />
    <path d="m19 17-1.3-4.5" />
    <path d="M5 17l1.3-4.5" />
    <path d="M2 10l3.5-7.5A2 2 0 0 1 7.2 2h9.6a2 2 0 0 1 1.8 1.5L22 10" />
    <path d="M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
  </svg>
);
