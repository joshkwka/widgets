import { useState, useEffect } from "react";
import "react-grid-layout/css/styles.css";
import GridLayout, { Layout } from "react-grid-layout";
import ClockWidget from "./Widgets/ClockWidget";
import TodoWidget from "./Widgets/TodoWidget";
import PomodoroWidget from "./Widgets/PomodoroWidget";
import NotepadWidget from "./Widgets/NoteWidget";
import AddWidgetButton from "./Widgets/Helper/AddWidgetButton";
import CalculatorWidget from "./Widgets/CalculatorWidget";
import WeatherWidget from "./Widgets/WeatherWidget";
import BookmarksWidget from "./Widgets/BookmarksWidget";
import { fetchUserWidgets, fetchWidgetPreferences, saveWidgetPreferences, addWidgetToLayout, deleteWidgetFromLayout } from "../api/auth";

interface Widget {
  i: string; 
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
}

interface LayoutData {
  id: number;  
  name: string;
  widgets: Widget[]; 
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
        const formattedLayout: WidgetLayout[] = [];
    
        for (const layout of layouts) {
          for (const widget of layout.widgets) {
            const preferences = await fetchWidgetPreferences(widget.i); 
            
            formattedLayout.push({
              i: widget.i,  
              x: preferences?.settings?.x ?? widget.x, 
              y: preferences?.settings?.y ?? widget.y,
              w: preferences?.settings?.w ?? widget.w,
              h: preferences?.settings?.h ?? widget.h,
              type: widget.type,
            });
          }
        }
    
        setLayout(formattedLayout); 
      }
    };
    
  
    loadWidgets();
  }, []);

  const handleLayoutChange = async (newLayout: Layout[]) => {
    const updatedLayout: WidgetLayout[] = newLayout.map((layoutItem) => {
      const existingWidget = layout.find((widget) => widget.i === layoutItem.i);
      return {
        i: layoutItem.i,
        x: layoutItem.x,
        y: layoutItem.y,
        w: layoutItem.w,
        h: layoutItem.h,
        type: existingWidget?.type || "unknown",
      };
    });
  
    setLayout(updatedLayout);
  
    try {
      await Promise.all(
        updatedLayout.map(async (widget) => {
          const preferences = await fetchWidgetPreferences(widget.i);
  
          const updatedPreferences = {
            ...preferences?.settings, 
            x: widget.x, 
            y: widget.y, 
            w: widget.w, 
            h: widget.h,
          };
  
          await saveWidgetPreferences(widget.i, widget.type, updatedPreferences);
        })
      );
    } catch (error) {
      console.error("Error saving layout:", error);
    }
  };

  const handleAddWidget = async (type: string) => {
    try {
      console.log("Adding widget...");
  
      // Request Backend to Add Widget
      const newLayout = await addWidgetToLayout(type);
      const newWidget = newLayout.widget
      console.log("🛠 Debugging newWidget:", newWidget);

      if (!newWidget || !newWidget.id) {
        console.error("Failed to add widget: No valid ID returned.", newWidget);
        return;
      }

      
      console.log(`Widget ${newWidget.id} added. Fetching preferences...`);
  
      // Retry Fetching Preferences
      let preferences = null;
      let attempts = 0;
      while (!preferences && attempts < 5) {
        try {
          preferences = await fetchWidgetPreferences(newWidget.id);
        } catch (error) {
          console.warn(`Attempt ${attempts + 1}: Failed to fetch preferences for widget ${newWidget.id}`);
        }
        if (!preferences) await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }
  
      if (!preferences || !preferences.settings) {
        console.error(`Failed to fetch preferences for widget ${newWidget.id} after retries.`);
        return;
      }
  
      console.log(`Preferences loaded for widget ${newWidget.id}:`, preferences);
  
      // Extract Safe Values
      const x = preferences.settings?.x ?? 0;
      const y = preferences.settings?.y ?? 0;
      const w = preferences.settings?.w ?? 6;
      const h = preferences.settings?.h ?? 3;
  
      // Ensure Layout Updates Properly
      console.log("Updating Layout...");
      setLayout((prevLayout) => {
        const updatedLayout = [
          ...prevLayout,
          {
            i: newWidget.id,
            x,
            y,
            w,
            h,
            type,
          } as WidgetLayout,
        ];
        console.log("Updated Layout:", updatedLayout);
        return updatedLayout;
      });
  
    } catch (error) {
      console.error("Error in handleAddWidget:", error);
    }
  };
  
  const handleRightClick = (event: React.MouseEvent, widgetId: string) => {
    event.preventDefault();
    setSelectedWidget(widgetId);
    setShowContextMenu(true);
    setContextMenuPosition({ 
      x: event.clientX + window.scrollX - 85, 
      y: event.clientY + window.scrollY - 110 });
  };

  const deleteWidget = async () => {
    if (!selectedWidget) return;

    setLayout((prevLayout) => prevLayout.filter((widget) => widget.i !== selectedWidget));
    setShowContextMenu(false);

    await deleteWidgetFromLayout(selectedWidget);
  };
  
  const [gridWidth, setGridWidth] = useState(window.innerWidth);
  const columnWidth = 50; 

  useEffect(() => {
    const handleResize = () => setGridWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-full h-full" onClick={() => setShowContextMenu(false)}>
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <AddWidgetButton 
          onAddWidget={handleAddWidget} 
          existingWidgets={layout.map((w) => w.type)} 
        />
      </div>


      {showContextMenu && (
        <div
          className="absolute bg-[var(--widget-bg)] text-[var(--foreground)] py-2 px-4 rounded-lg shadow-lg border border-[var(--border)] z-50"
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          <button 
            onClick={deleteWidget} 
            className="block w-full text-left p-2 hover:bg-[var(--hover-gray)] transition"
          >
           🗑️ 
          </button>
        </div>
      )}

      <GridLayout
        className="layout mb-12"
        layout={layout}
        cols={Math.floor(gridWidth / columnWidth)}
        rowHeight={50}
        width={gridWidth} 
        autoSize={true}        
        verticalCompact={false} 
        maxRows={Infinity}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        compactType={null}  
        preventCollision={true} 
      >
        {layout.map((widget) => (
          <div 
            key={widget.i} 
            className="rounded-lg border border-[var(--border)] bg-[var(--widget-bg)] shadow-md"
            onContextMenu={(e) => handleRightClick(e, widget.i)}
          >
            {widget.type === "clock" && <ClockWidget id={widget.i} />}
            {widget.type === "todo" && <TodoWidget id={widget.i} />}
            {widget.type === "pomodoro" && <PomodoroWidget id={widget.i} />}
            {widget.type === "notepad" && <NotepadWidget id={widget.i} />}
            {widget.type === "calculator" && <CalculatorWidget id={widget.i}/>}
            {widget.type === "weather" && <WeatherWidget id={widget.i}/>}
            {widget.type === "bookmarks" && <BookmarksWidget id={widget.i}/>}
          </div>
        ))}
      </GridLayout>
      <div className="py-4"></div>
    </div>
  );
}
