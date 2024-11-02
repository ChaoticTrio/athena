import {
  CopyOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Button, Radio, Tabs, Tooltip } from "antd";
import { useState } from "react";
import "./App.css";
import CodeEditor from "./components/CodeEditor";
import FCNForm from "./components/FCNForm";
import ThreePanelLayout from "./components/ThreePanelLayout";
import FCNVisual from "./visuals/FCNVisual";

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

  const renderForm = () => {
    return (
      <div className="h-full">
        <Tabs
          activeKey={activeTab}
          tabBarStyle={{
            paddingLeft: "1rem",
          }}
          onChange={(e) => setActiveTab(e as MODEL_TYPE)}
          items={[
            {
              key: MODEL_TYPE.FCN,
              label: MODEL_TYPE.FCN,
              children: <FCNForm />,
            },
            {
              key: MODEL_TYPE.CNN,
              label: MODEL_TYPE.CNN,
              children: <div>CNN Form</div>,
            },
            {
              key: MODEL_TYPE.XXX,
              label: MODEL_TYPE.XXX,
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
        return <FCNVisual />;
      case "CNN":
        return <div>CNN Visual</div>;
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
              className="mb-1"
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
                className="mt-1"
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

  return (
    <div className="app-container">
      <div className="header">
        <Button
          type="primary"
          className="generate-button"
          onClick={() => console.log("Generate clicked")}
        >
          Generate
        </Button>

        <div className="right-controls ml-auto mr-2">
          <Tooltip title="Help">
            <Button icon={<QuestionCircleOutlined />} />
          </Tooltip>
        </div>
      </div>

      <ThreePanelLayout
        leftComponent={renderForm()}
        rightComponent={renderCode()}
        bottomComponent={renderVisual()}
      />
    </div>
  );
}

export default App;
