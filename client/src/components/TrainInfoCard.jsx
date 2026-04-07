const formatDelay = (delay) => {
  if (delay == null) return 'Sin retraso';

  const delaySeconds = Number(delay);
  if (Number.isNaN(delaySeconds)) return String(delay);
  if (delaySeconds === 0) return 'Sin retraso';

  const delayMinutes = Math.round(Math.abs(delaySeconds) / 60);
  if (delaySeconds > 0) {
    return `+${delayMinutes} min`;
  }

  return `-${delayMinutes} min`;
};

const cardStyle = {
  position: 'absolute',
  right: '1rem',
  top: '1rem',
  zIndex: 1000,
  minWidth: '260px',
  maxWidth: '320px',
  background: 'rgba(255, 255, 255, 0.96)',
  border: '1px solid #d6dee8',
  borderRadius: '12px',
  padding: '0.9rem 1rem',
  boxShadow: '0 12px 30px rgba(0, 31, 63, 0.15)',
  color: '#102a43'
};

const closeButtonStyle = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '1.1rem',
  color: '#486581',
  lineHeight: 1
};

const rowStyle = {
  marginTop: '0.45rem'
};

const TrainInfoCard = ({ train, nextStopName, delay, onClose, inPopup = false }) => {
  if (!train) return null;

  const content = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Informacion del tren</strong>
        {!inPopup && (
          <button type="button" aria-label="Cerrar tarjeta" onClick={onClose} style={closeButtonStyle}>
            x
          </button>
        )}
      </div>

      <div style={rowStyle}>
        <strong>ID:</strong> {train.train?.id ?? train.id ?? 'No disponible'}
      </div>
         <div style={rowStyle}>
           <strong>Siguiente parada:</strong> {nextStopName ?? train.nextStationId ?? 'No disponible'}
      </div>
      <div style={rowStyle}>
        <strong>Retraso:</strong> {formatDelay(delay)}
      </div>
    </>
  );

  if (inPopup) {
    return content;
  }

  return (
    <div style={cardStyle}>
      {content}
    </div>
  );
};

export default TrainInfoCard;