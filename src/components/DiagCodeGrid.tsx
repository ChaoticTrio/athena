import React, { useState, useEffect } from "react";
import RGL, { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ReactGridLayout = WidthProvider(Responsive);

interface CustomGridProps {
  layout: Layout[];
  children: React.ReactNode;
}

const DiagCodeGrid: React.FC<CustomGridProps> = ({ layout, children }) => {
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log(dimensions);
  }, [dimensions]);
  return (
      <ReactGridLayout
        className="w-full h-screen layout"
        layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={dimensions.height / 12}
        width={dimensions.width}
        isDraggable={false}
        margin={[0, 0]}
        padding={[0,0]}
        isResizable={true}
      >
      {children}
    </ReactGridLayout>
  );
};

export default DiagCodeGrid;
