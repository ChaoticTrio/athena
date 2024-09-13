import React, { useState, useCallback } from "react";
import FCNVisual from "./visuals/FCNVisual";
import FCN from "./components/FCN";
import { Editor } from "@monaco-editor/react";
import ThreePanelLayout from "./components/ThreePanelLayout";
import { CopyOutlined } from "@ant-design/icons";
import "./App.css";

function App() {
  const [code, setCode] = useState("# Your Python code here");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      alert("Code copied to clipboard!");
    });
  }, [code]);

  return (
    <div className="app-container">
      <ThreePanelLayout
        leftComponent={<FCNVisual />}
        upperRightComponent={<FCN />}
        lowerRightComponent={
          <div className="relative h-full w-full flex flex-col overflow-hidden">
            <div className="flex justify-end p-1">
              <button
                onClick={handleCopy}
                className="p-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                title="Copy code"
              >
                <CopyOutlined style={{ fontSize: '14px' }} />
              </button>
            </div>
            <div className="flex-grow overflow-auto scrollbar-hide">
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        }
      />
    </div>
  );
}

export default App;
