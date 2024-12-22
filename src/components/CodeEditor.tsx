import { CopyOutlined, DownloadOutlined } from "@ant-design/icons";
import { Editor } from "@monaco-editor/react";
import { Button, message, Radio, Tooltip } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { CNNGenerator } from "../code-generators/cnn/cnn-generator";
import { FCNGenerator } from "../code-generators/fcn/fcn-generator";
import { CNNConfig, CNNLayer } from "../types/CNNTypes";
import { FCNConfig, FCNLayer } from "../types/FCNTypes";
interface CodeEditorProps {
  codeRef: React.MutableRefObject<null>;
  activeTab: string;
  fcnLayers: FCNLayer[];
  cnnLayers: CNNLayer[];
}

enum FRAMEWORK {
  PyTorch = "PyTorch",
  Keras = "Keras",
}

enum KERAS_TYPE {
  Sequential = "Sequential",
  Functional = "Functional",
  Subclassing = "Subclassing",
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  codeRef,
  activeTab,
  fcnLayers,
  cnnLayers,
}) => {
  const [framework, setFramework] = useState<FRAMEWORK>(FRAMEWORK.PyTorch);
  const [kerasType, setKerasType] = useState<KERAS_TYPE>(KERAS_TYPE.Sequential);
  const [code, setCode] = useState<string>("# Your Python code here");

  const generateCode = useCallback(() => {
    try {
      switch (activeTab) {
        case "FCN": {
          if (fcnLayers.length === 0) {
            setCode("# Your Python code here");
            break;
          }
          const fcnGenerator = new FCNGenerator();
          const fcnConfig: FCNConfig = {
            layers: fcnLayers,
            kerasType: kerasType,
          };
          const fcnCode = fcnGenerator.generateCode(framework, fcnConfig);
          setCode(fcnCode);
          break;
        }
        case "CNN": {
          if (cnnLayers.length === 0) {
            setCode("# Your Python code here");
            break;
          }
          const cnnGenerator = new CNNGenerator();
          const cnnConfig: CNNConfig = {
            layers: cnnLayers,
            kerasType: kerasType,
          };
          const cnnCode = cnnGenerator.generateCode(framework, cnnConfig);
          setCode(cnnCode);
          break;
        }
        default:
          throw new Error("Invalid tab selected!");
      }
    } catch (error) {
      message.error("Failed to generate code!");
      console.error(error);
    }
  }, [activeTab, framework, kerasType, fcnLayers, cnnLayers]);

  useEffect(() => {
    generateCode();
  }, [generateCode]);

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(code);
      message.success("Code copied to clipboard!");
    } catch (error) {
      message.error("Failed to copy code to clipboard!");
      console.error(error);
    }
  };

  const downloadCode = () => {
    try {
      const blob = new Blob([code], { type: "text/plain" });
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${activeTab}.py`;
        link.click();
        URL.revokeObjectURL(url);
      }
      message.success("Code downloaded successfully!");
    } catch (error) {
      message.error("Failed to download code!");
      console.error(error);
    }
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="code-header flex flex-row m-2 items-start">
        <div className="framework-tabs flex flex-row">
          <Radio.Group
            options={Object.values(FRAMEWORK).map((f) => ({
              label: f,
              value: f,
            }))}
            value={framework}
            onChange={(e) => setFramework(e.target.value as FRAMEWORK)}
            optionType="button"
            buttonStyle="solid"
            className=""
          />
          {framework === FRAMEWORK.Keras && (
            <Radio.Group
              options={Object.values(KERAS_TYPE).map((f) => ({
                label: f,
                value: f,
              }))}
              value={kerasType}
              onChange={(e) => setKerasType(e.target.value as KERAS_TYPE)}
              optionType="button"
              buttonStyle="solid"
              className="ml-2"
            />
          )}
        </div>
        <div className="ml-auto flex flex-row items-center" ref={codeRef}>
          <Tooltip title="Copy" className="mr-1">
            <Button icon={<CopyOutlined />} onClick={copyToClipboard} />
          </Tooltip>
          <Tooltip title="Download" className="ml-1">
            <Button icon={<DownloadOutlined />} onClick={downloadCode} />
          </Tooltip>
        </div>
      </div>
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
            fontFamily: "JetBrainsMono",
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
