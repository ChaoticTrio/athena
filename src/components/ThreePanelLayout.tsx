import React, { useCallback, useState } from "react";
import { layoutStyles } from "../styles/layout";

interface ThreePanelLayoutProps {
  leftComponent: React.ReactNode;
  rightComponent: React.ReactNode;
  bottomComponent: React.ReactNode;
}

const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({
  leftComponent,
  rightComponent,
  bottomComponent,
}) => {
  const [horizontalSplit, setHorizontalSplit] = useState(50);
  const [verticalSplit, setVerticalSplit] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  const handleHorizontalResize = useCallback((e: MouseEvent) => {
    const container = document.getElementById("three-panel-container");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const percentage =
      ((e.clientY - containerRect.top) / containerRect.height) * 100;
    setHorizontalSplit(Math.min(Math.max(percentage, 20), 80));
  }, []);

  const handleVerticalResize = useCallback((e: MouseEvent) => {
    const container = document.getElementById("three-panel-container");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const percentage =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setVerticalSplit(Math.min(Math.max(percentage, 20), 80));
  }, []);

  const startResize =
    (resizeFunc: (e: MouseEvent) => void) => (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      document.body.classList.add("select-none");

      const moveHandler = (e: MouseEvent) => {
        e.preventDefault();
        requestAnimationFrame(() => resizeFunc(e));
      };

      const upHandler = () => {
        setIsResizing(false);
        document.body.classList.remove("select-none");
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("mouseup", upHandler);
      };

      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("mouseup", upHandler);
    };

  return (
    <div id="three-panel-container" className={layoutStyles.container}>
      <div className={layoutStyles.threePanelLayout}>
        <div
          className={layoutStyles.topPanels}
          style={{ height: `${horizontalSplit}%` }}
        >
          <div
            className={`${layoutStyles.panel} scrollbar-thin `}
            style={{ width: `${verticalSplit}%` }}
          >
            {leftComponent}
          </div>
          <div
            className={`${layoutStyles.resizer} ${
              layoutStyles.verticalResizer
            } ${isResizing ?  "bg-slate-400" : "bg-slate-200"}`}
            onMouseDown={startResize(handleVerticalResize)}
          />
          <div
            className={`${layoutStyles.panel} scrollbar-thin `}
            style={{ width: `${100 - verticalSplit}%` }}
          >
            {rightComponent}
          </div>
        </div>
        <div
          className={`${layoutStyles.resizer} ${
            layoutStyles.horizontalResizer
          } ${isResizing ? "bg-slate-400" : "bg-slate-200"}`}
          onMouseDown={startResize(handleHorizontalResize)}
        />
        <div
          className={`${layoutStyles.panel} scrollbar-thin `}
          style={{ height: `${100 - horizontalSplit}%` }}
        >
          {bottomComponent}
        </div>
      </div>
    </div>
  );
};

export default ThreePanelLayout;
