import { ReactNode, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BaseWidgetProps {
  id: string;
  defaultSettings: object;
  children?: ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
}

export default function BaseWidget({ id, defaultSettings, children, defaultWidth, defaultHeight }: BaseWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ 
    width: defaultWidth ?? 200, 
    height: defaultHeight ?? 50 });

  useEffect(() => {
    const updateSize = () => {
      if (widgetRef.current) {
        setSize({
          width: widgetRef.current.clientWidth,
          height: widgetRef.current.clientHeight,
        });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (widgetRef.current) resizeObserver.observe(widgetRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <motion.div
      ref={widgetRef}
      className="w-full h-full p-4 rounded-lg transition-all relative border flex flex-col justify-center items-center"
      style={{
        background: "var(--widget-bg)",
        boxShadow: "var(--box-shadow)",
        borderColor: "var(--border)",
      }}
    >
      {children}
    </motion.div>
  );
}
