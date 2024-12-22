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
  CNN_LIMITS,
  CNNDenseLayer,
  CNNDropoutLayer,
  cnnEmptyLayers,
  CNNLayer,
  CNNOutputLayer,
  ConvLayer,
  InputLayer,
  PaddingLayer,
  PoolLayer,
} from "../types/CNNTypes";
import { ActivationFunctions } from "../types/FCNTypes";

const { Option } = Select;

function inputElementForm(
  element: InputLayer,
  index: number,
  handleFormElementChange: (index: number, element: CNNLayer) => void
): JSX.Element {
  return (
    <Form.Item key="2" label="Size" className="my-auto mx-2">
      {[0, 1, 2].map((i) => (
        <InputNumber
          key={i}
          min={
            i === 0 ? CNN_LIMITS.INPUT.CHANNELS.MIN : CNN_LIMITS.INPUT.SIZE.MIN
          }
          max={
            i === 0 ? CNN_LIMITS.INPUT.CHANNELS.MAX : CNN_LIMITS.INPUT.SIZE.MAX
          }
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
      <Form.Item key="2" label="Size" className="my-auto mx-2">
        <InputNumber
          min={CNN_LIMITS.CONV.SIZE.MIN}
          max={CNN_LIMITS.CONV.SIZE.MAX}
          value={element.size}
          onChange={(value) => {
            element.size = value as number;
            handleFormElementChange(index, element);
          }}
          controls={false}
          className="w-16 h-8 mx-0.5"
        />
      </Form.Item>
      <Form.Item key="3" label="Kernel" className="my-auto mx-2">
        {[0, 1].map((i) => (
          <InputNumber
            key={i}
            min={CNN_LIMITS.CONV.KERNEL.MIN}
            max={CNN_LIMITS.CONV.KERNEL.MAX}
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
      <Form.Item key="2" label="Stride" className="my-auto mx-2">
        {[0, 1].map((i) => (
          <InputNumber
            key={i}
            min={CNN_LIMITS.POOL.STRIDE.MIN}
            max={CNN_LIMITS.POOL.STRIDE.MAX}
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
      <Form.Item key="3" label="Kernel" className="my-auto mx-2">
        {[0, 1].map((i) => (
          <InputNumber
            key={i}
            min={CNN_LIMITS.POOL.KERNEL.MIN}
            max={CNN_LIMITS.POOL.KERNEL.MAX}
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
      <Form.Item key="2" label="Padding" className="my-auto mx-2">
        {[0, 1].map((i) => (
          <InputNumber
            key={i}
            min={CNN_LIMITS.PADDING.PAD.MIN}
            max={CNN_LIMITS.PADDING.PAD.MAX}
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

function denseElementForm(
  element: CNNDenseLayer,
  index: number,
  handleFormElementChange: (index: number, element: CNNLayer) => void
): JSX.Element {
  return (
    <>
      <Form.Item label="Size" className="my-auto mx-2">
        <InputNumber
          min={CNN_LIMITS.DENSE.SIZE.MIN}
          max={CNN_LIMITS.DENSE.SIZE.MAX}
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
  element: CNNDropoutLayer,
  index: number,
  handleFormElementChange: (index: number, element: CNNLayer) => void
): JSX.Element {
  return (
    <>
      <Form.Item label="Rate" className="my-auto mx-2">
        <InputNumber
          min={CNN_LIMITS.DROPOUT.RATE.MIN}
          max={CNN_LIMITS.DROPOUT.RATE.MAX}
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
  element: CNNOutputLayer,
  index: number,
  handleFormElementChange: (index: number, element: CNNLayer) => void
): JSX.Element {
  return (
    <>
      <Form.Item label="Size" className="my-auto mx-2">
        <InputNumber
          min={CNN_LIMITS.OUTPUT.SIZE.MIN}
          max={CNN_LIMITS.OUTPUT.SIZE.MAX}
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

const options1 = [
  "Conv",
  "Pool",
  "Padding",
  "Flatten",
  "Dense",
  "Dropout",
  "Output",
];
const actFuncs = Object.keys(ActivationFunctions);

const layerFormatters: Record<
  string,
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element: any,
    index: number,
    handleFormElementChange: (index: number, element: CNNLayer) => void
  ) => JSX.Element
> = {
  Input: inputElementForm,
  Conv: cnnElementForm,
  Pool: poolingElementForm,
  Padding: paddingElementForm,
  Flatten: () => <></>,
  Dense: denseElementForm,
  Dropout: dropoutElementForm,
  Output: outputElementForm,
} as const;

function CNNForm({
  itemRef,
  cnnLayers,
  setCnnLayers,
}: {
  itemRef: React.MutableRefObject<null>;
  cnnLayers: CNNLayer[];
  setCnnLayers: (layers: CNNLayer[]) => void;
}): JSX.Element {
  const handleFormElementChange = (index: number, element: CNNLayer) => {
    setCnnLayers(cnnLayers.map((el, i) => (i === index ? element : el)));
  };

  const addFormElement = () => {
    setCnnLayers([...cnnLayers, cnnEmptyLayers.Conv()]);
  };

  const deleteFormElement = (index: number) => {
    const newFormElements = cnnLayers.filter((_, i) => i !== index);
    setCnnLayers(newFormElements);
  };

  const moveUpFormElement = (index: number) => {
    if (index < 2) return;
    const newFormElements = [...cnnLayers];
    [newFormElements[index], newFormElements[index - 1]] = [
      newFormElements[index - 1],
      newFormElements[index],
    ];
    setCnnLayers(newFormElements);
  };

  const moveDownFormElement = (index: number) => {
    if (index === 0 || index === cnnLayers.length - 1) return;
    const newFormElements = [...cnnLayers];
    [newFormElements[index], newFormElements[index + 1]] = [
      newFormElements[index + 1],
      newFormElements[index],
    ];
    setCnnLayers(newFormElements);
  };

  const resetForm = () => {
    setCnnLayers([cnnEmptyLayers.Input()]);
  };

  return (
    <div className="flex flex-col items-center h-full overflow-auto scrollbar-hide bg-white">
      <Form className="flex flex-col items-center w-full py-2 px-4 space-y-2">
        {cnnLayers.map((element, index) => (
          <div
            ref={index === 0 ? itemRef : null}
            key={index}
            className="flex flex-row w-full bg-slate-50 py-2 px-4 rounded-lg shadow-sm border border-slate-200 justify-start items-center"
          >
            <Form.Item key="1" label="Type" className="my-auto mr-2">
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
              disabled={index === 0 || index === cnnLayers.length - 1}
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

export default CNNForm;
