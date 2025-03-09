import { useState, useEffect } from "react";
import "react-grid-layout/css/styles.css";
import GridLayout, { Layout } from "react-grid-layout";
import ClockWidget from "./Widgets/ClockWidget";
import axios from "axios"; // Import Axios for API calls

const API_URL = "/api/widgets/";

// Define the structure of a widget with the required 'i' property
interface Widget {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Ensure that `Widget` conforms to `Layout` by adding `i`
interface WidgetLayout extends Layout {
  type: string;
}

export default function GridDashboard() {
  const [layout, setLayout] = useState<WidgetLayout[]>([]);

  // Fetch saved layout on mount
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await axios.get<Widget[]>(API_URL);

        // Convert fetched widgets to match `Layout` format required by GridLayout
        const formattedLayout: WidgetLayout[] = response.data.map((widget) => ({
          i: widget.id, // GridLayout requires 'i'
          x: widget.x,
          y: widget.y,
          w: widget.w,
          h: widget.h,
          type: widget.type, // Keep widget type
        }));

        setLayout(formattedLayout);
      } catch (error) {
        console.error("Error fetching layout:", error);
      }
    };
    fetchLayout();
  }, []);

  // Save layout changes
  const handleLayoutChange = async (newLayout: Layout[]) => {
    // Convert `Layout[]` back to `WidgetLayout[]` ensuring `i` exists
    const updatedLayout: WidgetLayout[] = newLayout.map((layoutItem) => ({
      i: layoutItem.i, // Ensure 'i' is retained
      id: layoutItem.i, // Include 'id' for backend compatibility
      x: layoutItem.x,
      y: layoutItem.y,
      w: layoutItem.w,
      h: layoutItem.h,
      type: layout.find((widget) => widget.i === layoutItem.i)?.type || "unknown",
    }));

    setLayout(updatedLayout);

    try {
      await axios.put(API_URL, { layout: updatedLayout });
    } catch (error) {
      console.error("Error saving layout:", error);
    }
  };

  return (
    <div className="w-full h-full">
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
          <div key={widget.i}>
            {widget.type === "clock" && <ClockWidget id={widget.i} />}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
