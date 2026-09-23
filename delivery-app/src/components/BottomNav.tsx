import '../styles/BottomNav.css';

type Tab = 'dashboard' | 'orders' | 'export' | 'filter';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onCreateClick: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, onCreateClick }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
        title="Dashboard"
      >
        <span className="nav-icon">📊</span>
        <span className="nav-label">Dashboard</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
        onClick={() => setActiveTab('orders')}
        title="Orders"
      >
        <span className="nav-icon">📋</span>
        <span className="nav-label">Orders</span>
      </button>

      <button
        className="nav-item create-btn"
        onClick={onCreateClick}
        title="Create Order"
      >
        <span className="nav-icon">➕</span>
        <span className="nav-label">Create</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'filter' ? 'active' : ''}`}
        onClick={() => setActiveTab('filter')}
        title="Filter"
      >
        <span className="nav-icon">🔍</span>
        <span className="nav-label">Filter</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'export' ? 'active' : ''}`}
        onClick={() => setActiveTab('export')}
        title="Export"
      >
        <span className="nav-icon">📄</span>
        <span className="nav-label">Export</span>
      </button>
    </nav>
  );
}
