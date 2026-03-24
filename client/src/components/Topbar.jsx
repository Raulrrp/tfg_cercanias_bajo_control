const Topbar = ({ filterMode, filterValue, onFilterModeChange, onFilterValueChange, onSearch, searchError, selectedTrainText }) => {

  const handleModeChange = (e) => {
    onFilterModeChange(e.target.value);
  };

  const handleValueChange = (e) => {
    onFilterValueChange(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filterValue.trim() !== '') {
      onSearch(filterMode, filterValue);
    }
  };

  return (
    <header
      className="topbar"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '1rem',
        padding: '0.9rem 1.2rem',
        boxSizing: 'border-box',
        backgroundColor: '#e5e7eb',
        borderBottom: '1px solid #cbd5e1',
        color: '#1f2937'
      }}
    >
      <h2 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.02em' }}>
        Cercanias Bajo Control
      </h2>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginLeft: 40
        }}
      >
        <label htmlFor="filter-mode" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          Filtrar por
        </label>
        <select
          id="filter-mode"
          name="filter-mode"
          value={filterMode}
          onChange={handleModeChange}
          style={{
            minWidth: '220px',
            padding: '0.5rem 0.65rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#1f2937',
            fontSize: '0.92rem'
          }}
        >
          <option value="zona-urbana">Zona urbana</option>
          <option value="linea">Linea</option>
          <option value="id-tren">ID de tren</option>
          <option value="nombre-estacion">Nombre de estacion</option>
        </select>

        <input
          id="filter-value"
          name="filter-value"
          list="filter-value-options"
          type="text"
          placeholder="Escribe o selecciona un valor"
          value={filterValue}
          onChange={handleValueChange}
          onKeyDown={handleKeyDown}
          style={{
            minWidth: '260px',
            padding: '0.5rem 0.65rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#1f2937',
            fontSize: '0.92rem'
          }}
        />
        <datalist id="filter-value-options">
          <option value="Zona 1" />
          <option value="C1" />
          <option value="15345" />
          <option value="Atocha" />
        </datalist>
        {searchError && (
          <div style={{
            color: '#dc2626',
            fontSize: '0.85rem',
            marginLeft: '0.5rem',
            fontWeight: 500
          }}>
            {searchError}
          </div>
        )}
        {selectedTrainText && (
          <div style={{
            color: '#2563eb',
            fontSize: '0.85rem',
            marginLeft: '0.5rem',
            fontWeight: 500
          }}>
            {selectedTrainText}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;