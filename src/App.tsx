import {
  CopyOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Button, Radio, Splitter, Tabs, Tooltip } from "antd";
import { useState } from "react";
import CNNForm from "./components/CNNForm";
import CodeEditor from "./components/CodeEditor";
import FCNForm from "./components/FCNForm";
import { cnnEmptyLayers, CNNLayer, CNNConfig } from "./types/CNNTypes";
import { DenseLayer, FCNLayer, InputLayer, FCNConfig } from "./types/FCNTypes";
import CNNVisual from "./visuals/CNNVisual";
import FCNVisual from "./visuals/FCNVisual";
import { FCNGenerator } from "./neural-networks/fcn/fcn-generator";
import { CNNGenerator } from "./neural-networks/cnn/cnn-generator";
import { message } from "antd";

const fontFace = new FontFace(
  "JetBrainsMono",
  'url("/JetBrainsMono-Regular.ttf")'
);
fontFace.load().then((font) => {
  document.fonts.add(font);
});

enum MODEL_TYPE {
  FCN = "FCN",
  CNN = "CNN",
  XXX = "XXX",
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

function App() {
  const [activeTab, setActiveTab] = useState<MODEL_TYPE>(MODEL_TYPE.FCN);
  const [framework, setFramework] = useState<FRAMEWORK>(FRAMEWORK.PyTorch);
  const [kerasType, setKerasType] = useState<KERAS_TYPE>(KERAS_TYPE.Sequential);
  const [maximizeViz, setMaximizeViz] = useState(false);
  const [cnnLayersForm, setCnnLayersForm] = useState<CNNLayer[]>([
    cnnEmptyLayers.Input(),
  ]);
  const [cnnLayers, setCnnLayers] = useState<CNNLayer[]>([]);
  const [fcnLayersForm, setFcnLayersForm] = useState<FCNLayer[]>([
    { type: "Input", size: 8 } as InputLayer,
    { type: "Dense", size: 12, activation: "ReLU" } as DenseLayer,
    { type: "Dense", size: 12, activation: "ReLU" } as DenseLayer,
    { type: "Dense", size: 8, activation: "ReLU" } as DenseLayer,
  ]);
  const [fcnLayers, setFcnLayers] = useState<FCNLayer[]>([]);
  const [generatedFCNCode, setGeneratedFCNCode] = useState<string>(
    "# Your Python code here"
  );
  const [generatedCNNCode, setGeneratedCNNCode] = useState<string>(
    "# Your Python code here"
  );

  const renderForm = () => {
    return (
      <div className="h-full">
        <Tabs
          activeKey={activeTab}
          tabBarStyle={{
            paddingLeft: "1rem",
            backgroundColor: "white", // Set background color for the tab bar
            borderBottom: "1px solid #e5e7eb", // Light gray border
          }}
          onChange={(e) => setActiveTab(e as MODEL_TYPE)}
          items={[
            {
              key: MODEL_TYPE.FCN,
              label: (
                <span
                  className={`py-2 px-4 rounded-lg ${
                    activeTab === MODEL_TYPE.FCN
                      ? "bg-slate-700 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {MODEL_TYPE.FCN}
                </span>
              ),
              children: (
                <FCNForm
                  fcnLayers={fcnLayersForm}
                  setFcnLayers={setFcnLayersForm}
                />
              ),
            },
            {
              key: MODEL_TYPE.CNN,
              label: (
                <span
                  className={`py-2 px-4 rounded-lg ${
                    activeTab === MODEL_TYPE.CNN
                      ? "bg-slate-700 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {MODEL_TYPE.CNN}
                </span>
              ),
              children: (
                <CNNForm
                  cnnLayers={cnnLayersForm}
                  setCnnLayers={setCnnLayersForm}
                />
              ),
              // children: <div>Coming Soon</div>,
            },
            {
              key: MODEL_TYPE.XXX,
              label: (
                <span
                  className={`py-2 px-4 rounded-lg ${
                    activeTab === MODEL_TYPE.XXX
                      ? "bg-slate-700 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {MODEL_TYPE.XXX}
                </span>
              ),
              children: <div>Coming Soon</div>,
            },
          ]}
        />
      </div>
    );
  };

  const renderVisual = () => {
    switch (activeTab) {
      case "FCN":
        return (
          <FCNVisual
            fcnLayers={fcnLayers}
            toggleMaximize={() => setMaximizeViz(!maximizeViz)}
            maximizeState={maximizeViz}
          />
        );
      case "CNN":
        return (
          <CNNVisual
            layers={cnnLayers}
            toggleMaximize={() => setMaximizeViz(!maximizeViz)}
            maximizeState={maximizeViz}
            width={window.innerWidth / 2}
            height={window.innerHeight / 1}
          />
        );
      default:
        return <div>Coming Soon</div>;
    }
  };

  const copyToClipboard = () => {
    try {
      switch (activeTab) {
        case "FCN":
          navigator.clipboard.writeText(generatedFCNCode);
          break;
        case "CNN":
          navigator.clipboard.writeText(generatedCNNCode);
          break;
      }
      message.success("Code copied to clipboard!");
    } catch (error) {
      message.error("Failed to copy code to clipboard!");
      console.error(error);
    }
  };

  const downloadCode = () => {
    try {
      let blob = null;
      switch (activeTab) {
        case "FCN":
          blob = new Blob([generatedFCNCode], { type: "text/plain" });
          break;
        case "CNN":
          blob = new Blob([generatedCNNCode], { type: "text/plain" });
          break;
        default:
          break;
      }

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

  const renderCode = () => {
    const generatedCode =
      activeTab === "FCN" ? generatedFCNCode : generatedCNNCode;
    return (
      <div className="h-full">
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
        <CodeEditor code={generatedCode} />
      </div>
    );
  };

  const generateFCNCode = () => {
    const fcnGenerator = new FCNGenerator();
    const fcnConfig: FCNConfig = {
      layers: fcnLayersForm,
      kerasType: kerasType
    }
    setGeneratedFCNCode(fcnGenerator.generateCode(framework, fcnConfig));
  };

  const generateCNNCode = () => {
    const cnnGenerator = new CNNGenerator();
    const cnnConfig: CNNConfig = {
      layers: cnnLayersForm,
      kerasType: kerasType
    }
    setGeneratedCNNCode(cnnGenerator.generateCode(framework, cnnConfig));
  };

  const generate = () => {
    if (activeTab === MODEL_TYPE.CNN) {
      setCnnLayers(structuredClone(cnnLayersForm));
      generateCNNCode();
    } else if (activeTab === MODEL_TYPE.FCN) {
      setFcnLayers(structuredClone(fcnLayersForm));
      generateFCNCode();
    } else {
      console.log("Coming Soon");
    }
  };

  // useEffect(() => {
  //   generateFCNCode();
  //   generateCNNCode();
  // }, [kerasType]);


  return (
    <div className="app-container min-h-screen bg-slate-50">
      <div className="header flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <Button
          type="primary"
          className="bg-slate-700 hover:bg-slate-800 border-none generate-button"
          onClick={generate}
        >
          Generate
        </Button>

        <div className="right-controls">
          <Tooltip title="Help">
            <Button
              icon={<QuestionCircleOutlined />}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-50"
            />
          </Tooltip>
        </div>
      </div>
      <Splitter
        style={{ height: "100vh", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}
      >
        <Splitter.Panel className={maximizeViz ? "basis-full" : ""}>
          {renderVisual()}
        </Splitter.Panel>
        <Splitter.Panel
          collapsible
          className={maximizeViz ? "ant-splitter-panel-hidden basis-0" : ""}
          // style={{ flexBasis: maximizeViz ? "0" :  }}
        >
          <Splitter layout="vertical">
            <Splitter.Panel>{renderForm()}</Splitter.Panel>
            <Splitter.Panel>{renderCode()}</Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
      </Splitter>
    </div>
  );
}

export default App;
