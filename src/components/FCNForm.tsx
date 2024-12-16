import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  MinusOutlined,
  PlusOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Button, Form, InputNumber, Popconfirm, Select } from "antd";
import {
  ActivationFunctions,
  DenseLayer,
  DropoutLayer,
  FCN_LIMITS,
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
      <Form.Item label="Size" className="my-auto mx-2">
        <InputNumber
          min={FCN_LIMITS.INPUT.SIZE.MIN}
          max={FCN_LIMITS.INPUT.SIZE.MAX}
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
      <Form.Item label="Size" className="my-auto mx-2">
        <InputNumber
          min={FCN_LIMITS.DENSE.SIZE.MIN}
          max={FCN_LIMITS.DENSE.SIZE.MAX}
          value={element.size}
          onChange={(value) => {
            element.size = value as number;
            handleFormElementChange(index, element);
          }}
          controls={false}
          className="w-16 h-8 mx-0.5"
        />
      </Form.Item>
      <Form.Item label="Activation" className="my-auto mx-2">
        <Select
          value={element.activation}
          className="w-24 hover:border-slate-500"
          onChange={(value) => {
            element.activation = value as ActivationFunctions;
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
      <Form.Item label="Rate" className="my-auto mx-2">
        <InputNumber
          min={FCN_LIMITS.DROPOUT.RATE.MIN}
          max={FCN_LIMITS.DROPOUT.RATE.MAX}
          step={0.01}
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
      <Form.Item label="Size" className="my-auto mx-2">
        <InputNumber
          min={FCN_LIMITS.OUTPUT.SIZE.MIN}
          max={FCN_LIMITS.OUTPUT.SIZE.MAX}
          value={element.size}
          onChange={(value) => {
            element.size = value as number;
            handleFormElementChange(index, element);
          }}
          controls={false}
          className="w-16 h-8 mx-0.5"
        />
      </Form.Item>
      <Form.Item label="Activation" className="my-auto mx-2">
        <Select
          value={element.activation}
          className="w-24 hover:border-slate-500"
          onChange={(value) => {
            element.activation = value as ActivationFunctions;
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
const actFuncs = Object.keys(ActivationFunctions);

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

    const moveUpFormElement = (index: number) => {
      if (index < 2) return;
      const newFormElements = [...fcnLayers];
      [newFormElements[index], newFormElements[index - 1]] = [
        newFormElements[index - 1],
        newFormElements[index],
      ];
      setFcnLayers(newFormElements);
    };

    const moveDownFormElement = (index: number) => {
      if (index === 0 || index === fcnLayers.length - 1) return;
      const newFormElements = [...fcnLayers];
      [newFormElements[index], newFormElements[index + 1]] = [
        newFormElements[index + 1],
        newFormElements[index],
      ];
      setFcnLayers(newFormElements);
  };
  
  const resetForm = () => {
    setFcnLayers([fcnEmptyLayers.Input()]);
  };

  return (
    <div className="flex flex-col items-center h-full overflow-auto scrollbar-hide bg-white">
      <Form className="flex flex-col items-center w-full py-2 px-4 space-y-2">
        {fcnLayers.map((element, index) => (
          <div
            key={index}
            className="flex flex-row w-full bg-slate-50 py-2 px-4 rounded-lg shadow-sm border border-slate-200 justify-start items-center"
          >
            <Form.Item label="Type" className="my-auto mr-2">
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
              onClick={() => moveUpFormElement(index)}
              type="primary"
              className="ml-auto mr-1 my-auto border-none bg-green-500 hover:bg-green-700"
              danger
              icon={<UpOutlined />}
              disabled={index < 2}
            />
            <Button
              onClick={() => moveDownFormElement(index)}
              type="primary"
              className="mx-1 my-auto border-none bg-yellow-500 hover:bg-yellow-700"
              danger
              icon={<DownOutlined />}
              disabled={index === 0 || index === fcnLayers.length - 1}
            />
            <Button
              onClick={() => deleteFormElement(index)}
              type="primary"
              className="mx-1 my-auto border-none"
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
        <Popconfirm
          title="Clear all layers"
          description="Are you sure you want to clear all layers?"
          onConfirm={resetForm}
          onCancel={() => {}}
          okText="Yes"
          cancelText="No"
          okType="danger"
          icon={<DeleteOutlined style={{ color: "red" }} />}
        >
          <Button
            className="flex items-center justify-center text-white border-none"
            type="primary"
            icon={<CloseOutlined />}
            danger
          >
            Clear all
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
}

export default FCNForm;
