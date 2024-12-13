import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, InputNumber, Select } from "antd";
import {
  cnnEmptyLayers,
  CNNLayer,
  ConvLayer,
  InputLayer,
  PaddingLayer,
  PoolLayer,
} from "../types/CNNTypes";

const { Option } = Select;

function inputElementForm(
  element: InputLayer,
  index: number,
  handleFormElementChange: (index: number, element: CNNLayer) => void
): JSX.Element {
  return (
    <Form.Item key="2" label="Size" className="my-auto">
      {[0, 1, 2].map((i) => (
        <InputNumber
          key={i}
          min={0}
          value={element.size[i]}
          onChange={(value) => {
            element.size[i] = value as number;
            handleFormElementChange(index, element);
          }}
          controls={false}
          className="w-16 h-8 mx-0.5"
        />
      ))}
    </Form.Item>
  );
}

function cnnElementForm(
  element: ConvLayer,
  index: number,
  handleFormElementChange: (index: number, element: CNNLayer) => void
): JSX.Element {
  return (
    <>
      <Form.Item key="2" label="Size" className="my-auto">
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
      <Form.Item key="3" label="Kernel" className="my-auto">
        {[0, 1].map((i) => (
          <InputNumber
            key={i}
            min={0}
            value={element.kernel[i]}
            onChange={(value) => {
              element.kernel[i] = value as number;
              handleFormElementChange(index, element);
            }}
            controls={false}
            className="w-16 h-8 mx-0.5"
          />
        ))}
      </Form.Item>
    </>
  );
}

function poolingElementForm(
  element: PoolLayer,
  index: number,
  handleFormElementChange: (index: number, element: CNNLayer) => void
): JSX.Element {
  return (
    <>
      <Form.Item key="2" label="Stride" className="my-auto">
        {[0, 1].map((i) => (
          <InputNumber
            key={i}
            min={0}
            value={element.stride[i]}
            onChange={(value) => {
              element.stride[i] = value as number;
              handleFormElementChange(index, element);
            }}
            controls={false}
            className="w-16 h-8 mx-0.5"
          />
        ))}
      </Form.Item>
      <Form.Item key="3" label="Kernel" className="my-auto">
        {[0, 1].map((i) => (
          <InputNumber
            key={i}
            min={0}
            value={element.kernel[i]}
            onChange={(value) => {
              element.kernel[i] = value as number;
              handleFormElementChange(index, element);
            }}
            controls={false}
            className="w-16 h-8 mx-0.5"
          />
        ))}
      </Form.Item>
    </>
  );
}

function paddingElementForm(
  element: PaddingLayer,
  index: number,
  handleFormElementChange: (index: number, element: CNNLayer) => void
): JSX.Element {
  return (
    <>
      <Form.Item key="2" label="Padding" className="my-auto">
        {[0, 1].map((i) => (
          <InputNumber
            key={i}
            min={1}
            value={element.padding[i]}
            onChange={(value) => {
              element.padding[i] = value as number;
              handleFormElementChange(index, element);
            }}
            controls={false}
            className="w-16 h-8 mx-0.5"
          />
        ))}
      </Form.Item>
    </>
  );
}

const options1 = [
  "Input",
  "Conv",
  "Pool",
  "Padding",
  // "Flatten",
  // "Linear",
  // "Dropout",
];

const layerFormatters: Record<
  string,
  (
    element: any,
    index: number,
    handleFormElementChange: (index: number, element: CNNLayer) => void
  ) => JSX.Element
> = {
  Input: inputElementForm,
  Conv: cnnElementForm,
  Pool: poolingElementForm,
  Padding: paddingElementForm,
} as const;

function CNNForm({
  cnnLayers,
  setCnnLayers,
}: {
  cnnLayers: CNNLayer[];
  setCnnLayers: (layers: CNNLayer[]) => void;
}): JSX.Element {
  const handleFormElementChange = (index: number, element: CNNLayer) => {
    const newFormElements = [...cnnLayers];
    newFormElements[index] = element;
    setCnnLayers(newFormElements);
  };

  const addFormElement = () => {
    setCnnLayers([...cnnLayers, cnnEmptyLayers.Conv()]);
  };

  const deleteFormElement = (index: number) => {
    const newFormElements = cnnLayers.filter((_, i) => i !== index);
    setCnnLayers(newFormElements);
  };

  return (
    <div className="flex flex-col items-center h-full overflow-auto scrollbar-hide bg-white">
      <Form className="flex flex-col items-center w-full p-4 space-y-4">
        {cnnLayers.map((element, index) => (
          <div
            key={index}
            className="flex flex-row w-full bg-slate-50 p-4 rounded-lg shadow-sm border border-slate-200 justify-start gap-4 items-center"
          >
            <Form.Item key="1" label="Type" className="my-auto">
              <Select
                value={element.type}
                className="w-24 hover:border-slate-500"
                onChange={(value) =>
                  handleFormElementChange(index, cnnEmptyLayers[value]())
                }
                disabled={index === 0}
              >
                {options1.map((option, i) => (
                  <Option key={i} value={option} className="text-slate-700">
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

export default CNNForm;
