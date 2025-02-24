import DarkModeToggle from "./DarkModeToggle";

interface LayoutSidebarProps {
  isOpenLayout: boolean;
}

const LayoutSidebar = ({ isOpenLayout }: LayoutSidebarProps) => {
  return (
    <div
      className={`fixed top-0 left-64 h-full w-48 p-4 backdrop-blur-md shadow-lg z-40 transition-all duration-300 ease-in-out ${
        isOpenLayout
          ? "translate-x-0 opacity-100 visible"
          : "-translate-x-full opacity-0 invisible"
      }`}
      style={{
        backgroundColor: "var(--sidebar-background)",
        color: "var(--sidebar-foreground)",
        borderLeft: "1px solid var(--border)",
      }}
    >
      <h2 className="text-lg font-bold">Layouts</h2>
      <ul>
        {["Layout 1", "Layout 2", "Layout 3"].map((layout, index) => (
          <li
            key={index}
            className="p-2 mt-2 rounded transition"
            style={{
              backgroundColor: "var(--sidebar-background)",
              color: "var(--sidebar-foreground)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-background)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--sidebar-background)")
            }
          >
            {layout}
          </li>
        ))}
      </ul>

      {/* Dark Mode Toggle */}
      <div className="mt-4">
        <DarkModeToggle />
      </div>
    </div>
  );
};

export default LayoutSidebar;
