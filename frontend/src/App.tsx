import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold">Widgets</h1>
        <p className="text-gray-600">More content to be added.</p>
      </div>
    </div>
  );
}

export default App;
