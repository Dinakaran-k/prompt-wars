import React from 'react';

/**
 * Screen reader announcer for making dynamic content updates accessible.
 */
export default function AccessibilityAnnouncer({ message, type = 'polite' }) {
  return (
    <div
      className="sr-only absolute w-px h-px p-0 -m-px overflow-hidden clip-rect-0 border-0"
      aria-live={type}
      aria-atomic="true"
    >
      {message}
    </div>
  );
}
