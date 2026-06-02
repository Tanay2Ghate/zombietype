import React from 'react';

export default function Footer() {
  return (
    <footer>
      <div>
        <span>press </span>
        <kbd className="shortcut-key">esc</kbd>
        <span> at any point to exit or reset to the main menu</span>
      </div>
      <div className="footer-links">
        <span style={{ fontWeight: '500', color: 'var(--text-bright)' }}>
          &copy; Tanay Ghate
        </span>
      </div>
    </footer>
  );
}
