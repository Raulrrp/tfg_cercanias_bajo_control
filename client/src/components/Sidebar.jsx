const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2>Cercanias Bajo Control</h2>
      
      <section className="search-group">
        <label>Buscar Tren</label>
        <input type="text" placeholder="Buscar tren por ID(ej.: 15345)" />
      </section>

      <section className="search-group">
        <label>Search Station</label>
        <input type="text" placeholder="Buscar estación por nombre" />
      </section>

      <button className="btn-search">Ver disponibles</button>

      <div className="stats-container">
        <div className="stat-card">
          <span>142</span>
          <p>Active</p>
        </div>
        <div className="stat-card">
          <span>79</span>
          <p>Moving</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;