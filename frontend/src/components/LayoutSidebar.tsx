const LayoutSidebar = () => {
    return (
      <div className="h-screen w-48 bg-gray-900 text-white fixed left-64 top-0 p-4">
        <h2 className="text-lg font-bold">Layouts</h2>
        <ul>
          <li className="p-2 mt-2 bg-gray-700 rounded">Layout 1</li>
          <li className="p-2 mt-2 bg-gray-700 rounded">Layout 2</li>
          <li className="p-2 mt-2 bg-gray-700 rounded">Layout 3</li>
        </ul>
      </div>
    );
  };
  
  export default LayoutSidebar;
  