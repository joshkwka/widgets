import { useState, useEffect } from "react";
import "react-grid-layout/css/styles.css";
import GridLayout, { Layout } from "react-grid-layout";
import ClockWidget from "./Widgets/ClockWidget";
import AddWidgetButton from "./Widgets/Helper/AddWidgetButton";
import { fetchUserWidgets, fetchWidgetPreferences, saveWidgetPreferences, addWidgetToLayout, deleteWidgetFromLayout } from "../api/auth";
import { v4 as uuidv4 } from "uuid";

interface Widget {
  i: string;  // UUID of the widget
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
}

interface LayoutData {
  id: number;  // Layout ID
  name: string;
  widgets: Widget[];  // Ensure widgets are typed correctly
  user: number;
}

interface WidgetLayout extends Layout {
  type: string;
}

export default function GridDashboard() {
  const [layout, setLayout] = useState<WidgetLayout[]>([]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  useEffect(() => {
    const loadWidgets = async () => {
      const layouts: LayoutData[] | null = await fetchUserWidgets();
      if (layouts) {
        const formattedLayout: WidgetLayout[] = layouts.flatMap((layout) =>
          layout.widgets.map((widget) => ({
            i: widget.i,  
            x: widget.x,
            y: widget.y,
            w: widget.w,
            h: widget.h,
            type: widget.type,
          }))
        );
  
        setLayout(formattedLayout);
  
        // Fetch preferences for each widget
        await Promise.all(formattedLayout.map((widget) => fetchWidgetPreferences(widget.i)));
      }
    };
  
    loadWidgets();
  }, []);
  
  
  

  const handleLayoutChange = async (newLayout: Layout[]) => {
    const updatedLayout: WidgetLayout[] = newLayout.map((layoutItem) => ({
        i: layoutItem.i,
        x: layoutItem.x,
        y: layoutItem.y,
        w: layoutItem.w,
        h: layoutItem.h,
        type: layout.find((widget) => widget.i === layoutItem.i)?.type || "unknown",
    }));

    setLayout(updatedLayout);

    try {
        await Promise.all(
            updatedLayout.map((widget) =>
                saveWidgetPreferences(widget.i, widget.type, {
                    x: widget.x,
                    y: widget.y,
                    w: widget.w,
                    h: widget.h,
                })
            )
        );
    } catch (error) {
        console.error("Error saving layout:", error);
    }
  };

  const handleAddWidget = async (type: string) => {
    try {
        const newWidget = await addWidgetToLayout(type); 
        if (!newWidget || !newWidget.id) {
            console.error("Failed to add widget to layout.");
            return;
        }
        setLayout((prevLayout) => [...prevLayout, newWidget]); 
        await saveWidgetPreferences(newWidget.id, newWidget.type, { timezone: "America/Los_Angeles", analogMode: false });

    } catch (error) {
        console.error("Error adding widget:", error);
    }
};


  const handleRightClick = (event: React.MouseEvent, widgetId: string) => {
    event.preventDefault();
    setSelectedWidget(widgetId);
    setShowContextMenu(true);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  };

  const deleteWidget = async () => {
    if (!selectedWidget) return;

    setLayout((prevLayout) => prevLayout.filter((widget) => widget.i !== selectedWidget));
    setShowContextMenu(false);

    await deleteWidgetFromLayout(selectedWidget);
  };

  return (
    <div className="relative w-full h-full" onClick={() => setShowContextMenu(false)}>
      <AddWidgetButton 
        onAddWidget={handleAddWidget} 
        existingWidgets={layout.map((w) => w.type)} 
      />

      {showContextMenu && (
        <div
          className="absolute bg-[var(--widget-bg)] text-[var(--foreground)] py-2 px-4 rounded-lg shadow-lg border border-[var(--border)] z-50"
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          <button 
            onClick={deleteWidget} 
            className="block w-full text-left p-2 hover:bg-[var(--hover-gray)] transition"
          >
            🗑️ Delete Widget
          </button>
        </div>
      )}

      <GridLayout
        className="layout"
        layout={layout}
        cols={6}
        rowHeight={50}
        width={1200}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
      >
        {layout.map((widget) => (
          <div 
            key={widget.i} 
            className="rounded-lg border border-[var(--border)] bg-[var(--widget-bg)] shadow-md"
            onContextMenu={(e) => handleRightClick(e, widget.i)}
          >
            {widget.type === "clock" && <ClockWidget id={widget.i} />}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
