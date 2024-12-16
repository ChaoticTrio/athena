import React from "react";
import { Editor } from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code }) => {
  return (
    <div className="h-full bg-white rounded-lg shadow-sm border border-slate-200">
      <Editor
        height="100%"
        defaultLanguage="python"
        value={code}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: true,
          fontSize: 14,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor; 