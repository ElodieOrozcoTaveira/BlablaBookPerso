import './ToggleRead.scss';

import React from 'react';

type ToggleReadProps = {
  read: boolean;
  onToggle: () => void;
};

const ToggleRead: React.FC<ToggleReadProps> = ({ read, onToggle }) => {
  return (
     <button
    className={`toggle-read-btn${read ? " read" : ""}`}
    onClick={onToggle}
  >
    <input
      type="checkbox"
      checked={read}
      readOnly
      style={{
        width: '18px',
        height: '18px',
        pointerEvents: 'none',
        accentColor: read ? '#2ecc40' : '#ccc' // coche verte si lu
      }}
    />
    {read ? 'Lu' : 'Pas lu'}
  </button>
)
}

export default ToggleRead;
