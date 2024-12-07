import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, InputNumber, Select } from "antd";
import {
  DenseLayer,
  DropoutLayer,
  FCNActivationFunctions,
  fcnEmptyLayers,
  FCNLayer,
  InputLayer,
  OutputLayer,
} from "../types/FCNTypes";

const { Option } = Select;

function inputElementForm(
  element: InputLayer,
  index: number,
  handleFormElementChange: (index: number, element: FCNLayer) => void
): JSX.Element {
  return (
    <>
      <Form.Item label="Size" className="my-auto">
        <InputNumber
          min={0}
          value={element.size}
          onChange={(value) => {
            element.size = value as number;
            handleFormElementChange(index, element);
          }}
          controls={false}
          className="w-16 h-8 mx-0.5"
        />
      </Form.Item>
    </>
  );
}

function denseElementForm(
  element: DenseLayer,
  index: number,
  handleFormElementChange: (index: number, element: FCNLayer) => void
): JSX.Element {
  return (
    <>
      <Form.Item label="Size" className="my-auto">
        <InputNumber
          min={0}
          value={element.size}
          onChange={(value) => {
            element.size = value as number;
            handleFormElementChange(index, element);
          }}
          controls={false}
          className="w-16 h-8 mx-0.5"
        />
      </Form.Item>
      <Form.Item label="Activation" className="my-auto">
        <Select
          value={element.activation}
          className="w-24 hover:border-slate-500"
          onChange={(value) => {
            element.activation = value as FCNActivationFunctions;
            handleFormElementChange(index, element);
          }}
        >
          {actFuncs.map((option) => (
            <Option key={option} value={option} className="text-slate-700">
              {option}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
}

function dropoutElementForm(
  element: DropoutLayer,
  index: number,
  handleFormElementChange: (index: number, element: FCNLayer) => void
): JSX.Element {
  return (
    <>
      <Form.Item label="Rate" className="my-auto">
        <InputNumber
          min={0}
          max={1}
          step={0.1}
          value={element.rate}
          onChange={(value) => {
            element.rate = value as number;
            handleFormElementChange(index, element);
          }}
          controls={false}
          className="w-16 h-8 mx-0.5"
        />
      </Form.Item>
    </>
  );
}

function outputElementForm(
  element: OutputLayer,
  index: number,
  handleFormElementChange: (index: number, element: FCNLayer) => void
): JSX.Element {
  return (
    <>
      <Form.Item label="Size" className="my-auto">
        <InputNumber
          min={0}
          value={element.size}
          onChange={(value) => {
            element.size = value as number;
            handleFormElementChange(index, element);
          }}
          controls={false}
          className="w-16 h-8 mx-0.5"
        />
      </Form.Item>
      <Form.Item label="Activation" className="my-auto">
        <Select
          value={element.activation}
          className="w-24 hover:border-slate-500"
          onChange={(value) => {
            element.activation = value as FCNActivationFunctions;
            handleFormElementChange(index, element);
          }}
        >
          {actFuncs.map((option) => (
            <Option key={option} value={option} className="text-slate-700">
              {option}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
}

const layerFormatters: Record<
  string,
  (
    element: any,
    index: number,
    handleFormElementChange: (index: number, element: FCNLayer) => void
  ) => JSX.Element
> = {
  Input: inputElementForm,
  Dense: denseElementForm,
  Dropout: dropoutElementForm,
  Output: outputElementForm,
} as const;

const layerOptions = ["Dense", "Dropout", "Output"];
const actFuncs = Object.keys(FCNActivationFunctions);

function FCNForm({
  fcnLayers,
  setFcnLayers,
}: {
  fcnLayers: FCNLayer[];
  setFcnLayers: (fcnLayers: FCNLayer[]) => void;
}): JSX.Element {
  const handleFormElementChange = (index: number, element: FCNLayer) => {
    const newFormElements = [...fcnLayers];
    newFormElements[index] = element;
    setFcnLayers(newFormElements);
  };

  const addFormElement = () => {
    setFcnLayers([...fcnLayers, fcnEmptyLayers.Dense()]);
  };

  const deleteFormElement = (index: number) => {
    const newFormElements = fcnLayers.filter((_, i) => i !== index);
    setFcnLayers(newFormElements);
  };

  return (
    <div className="flex flex-col items-center h-full overflow-auto scrollbar-hide bg-white">
      <Form className="flex flex-col items-center w-full p-4 space-y-4">
        {fcnLayers.map((element, index) => (
          <div
            key={index}
            className="flex flex-row w-full bg-slate-50 p-4 rounded-lg shadow-sm border border-slate-200 justify-start gap-4 items-center"
          >
            <Form.Item label="Type" className="my-auto">
              <Select
                value={element.type}
                className="w-24 hover:border-slate-500"
                onChange={(value) =>
                  handleFormElementChange(index, fcnEmptyLayers[value]())
                }
                disabled={index === 0}
              >
                {layerOptions.map((option) => (
                  <Option
                    key={option}
                    value={option}
                    className="text-slate-700"
                  >
                    {option}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {layerFormatters[element.type]?.(
              element,
              index,
              handleFormElementChange
            )}
            <Button
              onClick={() => deleteFormElement(index)}
              type="primary"
              className="ml-auto my-auto border-none"
              danger
              icon={<MinusOutlined />}
              disabled={index === 0}
            />
          </div>
        ))}
      </Form>
      <div className="flex flex-row gap-4 mb-4">
        <Button
          onClick={addFormElement}
          className="flex items-center justify-center bg-slate-700 hover:bg-slate-800 text-white border-none"
          type="primary"
          icon={<PlusOutlined />}
        >
          Add Layer
        </Button>
      </div>
    </div>
  );
}

export default FCNForm;
