const Topbar = ({ filterMode, filterValue, onFilterModeChange, onFilterValueChange, onSearch, searchError, selectedTrainText, filterOptions = [] }) => {

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

  const handleSearchClick = () => {
    if (filterValue.trim() !== '') {
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0
          }}
        >
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
              borderRadius: '8px 0 0 8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#1f2937',
              fontSize: '0.92rem'
            }}
          />
          <button
            onClick={handleSearchClick}
            style={{
              padding: '0.5rem 0.65rem',
              borderRadius: '0 8px 8px 0',
              border: '1px solid #cbd5e1',
              borderLeft: 'none',
              backgroundColor: '#ffffff',
              color: '#1f2937',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
          >
            🔍
          </button>
        </div>
        <datalist id="filter-value-options">
          {filterOptions.map((option) => (
            <option key={option.id} value={option.name} />
          ))}
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