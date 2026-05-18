import React from 'react';

const TimetablePopup = ({ station, stopTimes, loading, error, onClose }) => {
  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={boxStyle}>
        <div style={headerStyle}>
          <strong>{station ? station.name : 'Timetable'}</strong>
          <button onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>
        <div style={{ padding: '8px', maxHeight: '60vh', overflow: 'auto' }}>
          {loading && <div>Loading...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {!loading && !error && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Trip</th>
                  <th style={thStyle}>Dep</th>
                </tr>
              </thead>
              <tbody>
                {stopTimes && stopTimes.length === 0 && (
                  <tr><td colSpan="3">No departures found</td></tr>
                )}
                {stopTimes && stopTimes.map((st, idx) => (
                  <tr key={idx} style={trStyle}>
                    <td style={tdStyle}>{st.arrivalTime || '-'}</td>
                    <td style={tdStyle}>{st.tripId}</td>
                    <td style={tdStyle}>{st.departureTime || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
};

const boxStyle = {
  width: '420px',
  background: '#fff',
  borderRadius: '8px',
  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
  overflow: 'hidden',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 12px',
  borderBottom: '1px solid #eee',
};

const closeButtonStyle = {
  border: 'none',
  background: 'transparent',
  fontSize: '16px',
  cursor: 'pointer',
};

const thStyle = { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #eee' };
const tdStyle = { padding: '6px 8px', borderBottom: '1px solid #f6f6f6' };
const trStyle = {};

export default TimetablePopup;
