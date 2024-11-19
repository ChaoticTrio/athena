import {
  CopyOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Button, Radio, Tabs, Tooltip, Splitter } from "antd";
import { useState } from "react";
import CodeEditor from "./components/CodeEditor";
import FCNForm from "./components/FCNForm";
// import ThreePanelLayout from "./components/ThreePanelLayout";
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
              children: <FCNForm />,
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
              children: <div>CNN Form</div>,
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
    <div className="app-container min-h-screen bg-slate-50">
      <div className="header flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <Button
          type="primary"
          className="bg-slate-700 hover:bg-slate-800 border-none generate-button"
          onClick={() => console.log("Generate clicked")}
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

      {/* <ThreePanelLayout
        leftComponent={renderForm()}
        rightComponent={renderCode()}
        bottomComponent={renderVisual()}
      /> */}
      <Splitter
        style={{ height: "100vh", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}
      >
        <Splitter.Panel collapsible>{renderVisual()}</Splitter.Panel>
        <Splitter.Panel>
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
