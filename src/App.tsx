import React, { useState } from "react";
import { Tabs, Button, Tooltip } from "antd";
import { QuestionCircleOutlined, DownloadOutlined } from "@ant-design/icons";
import FCNVisual from "./visuals/FCNVisual";
import ThreePanelLayout from "./components/ThreePanelLayout";
import CodeEditor from "./components/CodeEditor";
import FCNForm from "./components/FCNForm";
import "./App.css";

const { TabPane } = Tabs;

function App() {
  const [activeTab, setActiveTab] = useState("FCN");
  const [framework, setFramework] = useState("PyTorch");
  const [frameworkType, setFrameworkType] = useState("Sequential");

  const renderForm = () => {
    switch (activeTab) {
      case "FCN":
        return <FCNForm />;
      case "CNN":
        return <div>CNN Form</div>;
      default:
        return <div>Coming Soon</div>;
    }
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

  return (
    <div className="app-container">
      <div className="header">
        <div className="left-tabs">
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="FCN" key="FCN" />
            <TabPane tab="CNN" key="CNN" />
            <TabPane tab="XXX" key="XXX" />
          </Tabs>
        </div>

        <Button 
          type="primary"
          className="generate-button"
          onClick={() => console.log("Generate clicked")}
        >
          Generate
        </Button>

        <div className="right-controls">
          <div className="framework-tabs">
            <Tabs activeKey={framework} onChange={setFramework}>
              <TabPane tab="PyTorch" key="PyTorch" />
              <TabPane tab="Keras" key="Keras" />
              <TabPane tab="XXX" key="XXX" />
            </Tabs>
          </div>
          <div className="framework-type-tabs">
            <Tabs activeKey={frameworkType} onChange={setFrameworkType}>
              <TabPane tab="Sequential" key="Sequential" />
              <TabPane tab="Functional" key="Functional" />
              <TabPane tab="Subclassing" key="Subclassing" />
            </Tabs>
          </div>
          <div className="header-buttons">
            <Tooltip title="Help">
              <Button icon={<QuestionCircleOutlined />} />
            </Tooltip>
            <Tooltip title="Download">
              <Button icon={<DownloadOutlined />} />
            </Tooltip>
          </div>
        </div>
      </div>

      <ThreePanelLayout
        leftComponent={renderForm()}
        rightComponent={<CodeEditor />}
        bottomComponent={renderVisual()}
      />
    </div>
  );
}

export default App;
