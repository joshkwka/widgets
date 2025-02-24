// /src/layouts/DashboardLayout.tsx
// import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      {/* <Sidebar /> */}
      <main className="flex-1">
        {/* <Navbar /> */}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
