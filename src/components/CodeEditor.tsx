import React from "react";
import { Editor } from "@monaco-editor/react";

const CodeEditor: React.FC = () => {
  return (
    <div className="h-full bg-white rounded-lg shadow-sm border border-slate-200">
      <Editor
        height="100%"
        defaultLanguage="python"
        defaultValue="# Your Python code here"
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor; 