import React, { useCallback, useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { message, Radio, Tooltip, Button } from "antd";
import { CopyOutlined, DownloadOutlined } from "@ant-design/icons";
import { FCNGenerator } from "../neural-networks/fcn/fcn-generator";
import { CNNGenerator } from "../neural-networks/cnn/cnn-generator";
import { FCNConfig, FCNLayer } from "../types/FCNTypes";
import { CNNConfig, CNNLayer } from "../types/CNNTypes";
interface CodeEditorProps {
  activeTab: string;
  fcnLayers: FCNLayer[];
  cnnLayers: CNNLayer[];
}

enum FRAMEWORK {
  PyTorch = "PyTorch",
  Keras = "Keras",
  XXX = "XXX",
}

enum KERAS_TYPE {
  Sequential = "Sequential",
  Functional = "Functional",
  Subclassing = "Subclassing",
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  activeTab,
  fcnLayers,
  cnnLayers,
}) => {
  const [framework, setFramework] = useState<FRAMEWORK>(FRAMEWORK.PyTorch);
  const [kerasType, setKerasType] = useState<KERAS_TYPE>(KERAS_TYPE.Sequential);
  const [code, setCode] = useState<string>("# Your Python code here");

  const generateCode = useCallback(() => {
    if (fcnLayers.length > 1 || cnnLayers.length > 1) {
      try {
        switch (activeTab) {
          case "FCN": {
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
        <div className="framework-tabs flex flex-col">
          <Radio.Group
            options={Object.values(FRAMEWORK).map((f) => ({
              label: f,
              value: f,
            }))}
            value={framework}
            onChange={(e) => setFramework(e.target.value as FRAMEWORK)}
            optionType="button"
            buttonStyle="solid"
            className="mb-1 custom-radio-group"
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
              className="mt-1 custom-radio-group"
            />
          )}
        </div>
        <div className="ml-auto flex flex-row items-center">
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
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
