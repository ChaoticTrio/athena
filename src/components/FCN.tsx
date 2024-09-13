import React, { FC, useState } from "react";
import { Form, Select, InputNumber, Button, Modal } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";

const { Option } = Select;

interface FormElement {
  select1: string;
  select2: string;
  number: number;
}

const options1 = ["Input", "Flatten", "Linear", "Dropout"];
const options2 = ["RELU", "Sigmoid", "Tanh", "Softmax"];

const FCN: FC = () => {
  const [formElements, setFormElements] = useState<FormElement[]>([
    { select1: options1[0], select2: options2[0], number: 0 },
  ]);

  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleGenerateCode = () => {
    if (!validateForm()) {
      setDialogOpen(true);
      return;
    }
    console.log(formElements);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormElementChange = <K extends keyof FormElement>(
    index: number,
    key: K,
    value: FormElement[K]
  ) => {
    const newFormElements = [...formElements];
    newFormElements[index][key] = value;
    setFormElements(newFormElements);
  };

  const addFormElement = () => {
    setFormElements([
      ...formElements,
      { select1: options1[0], select2: options2[0], number: 0 },
    ]);
  };

  const deleteFormElement = (index: number) => {
    const newFormElements = formElements.filter((_, i) => i !== index);
    setFormElements(newFormElements);
  };

  // Function that validates the form
  // For now, it just checks if all the form elements are filled
  const validateForm = () => {
    return formElements.every((formElement) => formElement.number > 0);
  };

  return (
    <div className="flex flex-col items-center h-full overflow-auto scrollbar-hide">
      <Form className="flex flex-col items-center w-full p-4">
        {formElements.map((element, index) => (
          <div key={index} className="flex flex-row gap-5 w-full mb-4">
            <Form.Item label="Select 1" className="flex-grow">
              <Select
                value={element.select1}
                className="w-full text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                onChange={(value) =>
                  handleFormElementChange(index, "select1", value)
                }
              >
                {options1.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Select 2" className="flex-grow">
              <Select
                value={element.select2}
                className="w-full text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                onChange={(value) =>
                  handleFormElementChange(index, "select2", value)
                }
              >
                {options2.map((option) => (
                  <Option key={option} value={option} className="text-sm">
                    {option}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Number" className="flex-grow">
              <InputNumber
                min={0}
                value={element.number}
                onChange={(value) =>
                  handleFormElementChange(index, "number", value as number)
                }
                className="w-full"
              />
            </Form.Item>
            <Button
              onClick={() => deleteFormElement(index)}
              type="primary"
              className="self-end mb-6"
              danger
              icon={<MinusOutlined />}
            />
          </div>
        ))}
      </Form>
      <div className="flex flex-row gap-4 mb-4">
        <Button
          onClick={addFormElement}
          className="flex items-center justify-center"
          type="primary"
          icon={<PlusOutlined />}
        >
          Add Layer
        </Button>
        <Button
          type="primary"
          onClick={handleGenerateCode}
          className="bg-green-600 hover:bg-green-400 text-white font-bold"
        >
          Generate Code
        </Button>
      </div>
      <Modal
        title="Validation Error"
        open={isDialogOpen}
        onOk={handleCloseDialog}
        onCancel={handleCloseDialog}
      >
        <p>Form validation failed. Please check your input and try again.</p>
      </Modal>
    </div>
  );
};

export default FCN;
