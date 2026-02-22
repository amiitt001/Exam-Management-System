import { Icon } from "../ui/index";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const theme = {
    surface: "#111827",
    border: "#1e2d45",
    accent: "#3b82f6",
    accentSoft: "rgba(59,130,246,0.12)",
    text: "#f1f5f9",
    textSub: "#94a3b8",
    success: "#10b981",
  };

  return (
    <header style={{
      height: 64,
      background: theme.surface,
      borderBottom: `1px solid ${theme.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", flexShrink: 0,
      position: 'relative', zIndex: 30
    }}>
      <div style={{ fontSize: 14, color: theme.textSub, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background: 'none', border: 'none', color: theme.textSub, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className="lg:hidden"
        >
          <Icon name="menu" size={20} />
        </button>
        System Portal
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.success }} className="pulse" />
        <span style={{ fontSize: 13, color: theme.textSub }} className="hidden sm:inline">System Online</span>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: theme.accentSoft, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>A</div>
      </div>
    </header>
  );
};

export default Navbar;
