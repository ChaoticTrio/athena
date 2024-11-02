import React from "react";
import FCNVisual from "./visuals/FCNVisual";
import FCN from "./components/FCN";
import CNNVisual from "./visuals/CNNVisual";
import DiagCodeGrid from "./components/DiagCodeGrid";

function App() {
  const layout = [
    { i: "FCNVisual", x: 0, y: 0, w: 6, h: 12},
    { i: "FCN", x: 6, y: 0, w: 6, h: 6},
    { i: "Code", x: 6, y: 12, w: 6, h: 6},
  ];
  console.log(window.innerHeight, window.innerWidth);
  return (
    <div className="h-screen overflow-hidden">
      {/* <DiagCodeGrid layout={layout}>
        <div key="FCNVisual" className="overflow-auto">
          <FCNVisual />
        </div>
        <div key="FCN" className="overflow-auto">
          <FCN />
        </div>
        <div key="Code" className="overflow-auto">
          Code
        </div>
      </DiagCodeGrid> */}
      <div style={{ height: window.innerHeight / 2, width: window.innerWidth }}/>
      < CNNVisual width={window.innerWidth} height={window.innerHeight / 2} />
    </div>
  );
}

export default App;
