import SidebarButton from "./components/SidebarButton";
import { DarkModeProvider } from "context/DarkModeContext";

function App() {
  return (
    <DarkModeProvider>
      <div className="flex">
        <SidebarButton />
        <div className="flex-1 p-10">
          <h1 className="text-3xl font-bold">Widgets</h1>
          <p className="text-gray-600">More content to be added.</p>
        </div>
      </div>
    </DarkModeProvider>
  );
}

export default App;
