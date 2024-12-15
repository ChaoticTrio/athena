import {
  CopyOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Button, message, Radio, Splitter, Tabs, Tooltip } from "antd";
import { useState } from "react";
import CNNForm from "./components/CNNForm";
import CodeEditor from "./components/CodeEditor";
import FCNForm from "./components/FCNForm";
import { cnnEmptyLayers, CNNLayer } from "./types/CNNTypes";
import { fcnEmptyLayers, FCNLayer } from "./types/FCNTypes";
import CNNVisual from "./visuals/CNNVisual";
import FCNVisual from "./visuals/FCNVisual";

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

function validateFCNLayers(layers: FCNLayer[]) {
  if (layers[0].type !== "Input") {
    return { success: false, content: "First layer must be an input layer" };
  }
  for (let i = 1; i < layers.length; i++) {
    if (layers[i].type === "Input") {
      return { success: false, content: "Input layer must be the first layer" };
    }
  }
  if (layers[layers.length - 1].type !== "Output") {
    return { success: false, content: "Last layer must be an output layer" };
  }
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === "Dropout") {
      if (layers[i - 1].type !== "Dense") {
        return {
          success: false,
          content: "Dropout layers must be preceded by a dense layer",
        };
      }
    }
  }
  return { success: true, content: "" };
}

function validateCNNLayers(layers: CNNLayer[]) {
  let flattenIndex = -1;
  if (layers[0].type !== "Input") {
    return { success: false, content: "First layer must be an input layer" };
  }
  if (layers[layers.length - 1].type !== "Output") {
    return { success: false, content: "Last layer must be an output layer" };
  }
  for (let i = 1; i < layers.length - 1; i++) {
    switch (layers[i].type) {
      case "Input":
        return {
          success: false,
          content: "Input layer must be the first layer",
        };
      case "Flatten":
        if (flattenIndex !== -1) {
          return {
            success: false,
            content: "Only one flatten layer is allowed",
          };
        }
        flattenIndex = i;
        break;
      case "Dropout":
        if (layers[i - 1].type !== "Dense") {
          return {
            success: false,
            content: "Dropout layers must be preceded by a dense layer",
          };
        }
        break;
      case "Dense":
        if (flattenIndex === -1) {
          return {
            success: false,
            content: "Dense layers must come after a flatten layer",
          };
        }
        break;
      case "Output":
        return {
          success: false,
          content: "Output layer must be the last layer",
        };
      // TODO
      // case "Conv":
      // case "Pooling":
      // case "Padding":
      default:
        break;
    }
  }

  return { success: true, content: "" };
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
    fcnEmptyLayers.Input(),
  ]);
  const [fcnLayers, setFcnLayers] = useState<FCNLayer[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const renderForm = () => {
    console.log("rendering form");
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
    console.log("rendering visual");
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

  const renderCode = () => {
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
              <Button icon={<CopyOutlined />} />
            </Tooltip>
            <Tooltip title="Download" className="ml-1">
              <Button icon={<DownloadOutlined />} />
            </Tooltip>
          </div>
        </div>
        <CodeEditor />
      </div>
    );
  };

  const generate = () => {
    if (activeTab === MODEL_TYPE.CNN) {
      const { success, content } = validateCNNLayers(cnnLayersForm);
      if (success) {
        setCnnLayers(structuredClone(cnnLayersForm));
      } else {
        messageApi.open({
          type: "error",
          content: content,
          duration: 2,
        });
      }
    } else if (activeTab === MODEL_TYPE.FCN) {
      const { success, content } = validateFCNLayers(fcnLayersForm);
      if (success) {
        setFcnLayers(structuredClone(fcnLayersForm));
      } else {
        messageApi.open({
          type: "error",
          content: content,
          duration: 2,
        });
      }
    } else {
      console.log("Coming Soon");
    }
  };
  return (
    <div className="app-container min-h-screen bg-slate-50">
      {contextHolder}
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
