import React from 'react';

type ToggleReadProps = {
  read: boolean;
  onToggle: (e: React.MouseEvent) => void; // Change pour accepter l'événement
};

const ToggleRead: React.FC<ToggleReadProps> = ({ read, onToggle }) => {
  return (
    <button
      className={`toggle-read-btn${read ? " read" : ""}`}
      onClick={onToggle} // Utilise directement onToggle, qui inclut e.stopPropagation()
    >
      <input
        type="checkbox"
        checked={read}
        readOnly
        style={{
          width: '18px',
          height: '18px',
          pointerEvents: 'none',
          accentColor: read ? '#2ecc40' : '#ccc'
        }}
      />
      {read ? 'Lu' : 'Pas lu'}
    </button>
  );
};

export default ToggleRead;