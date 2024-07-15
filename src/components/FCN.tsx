import React, { FC, useState } from "react";
import { Form, Select, InputNumber, Button, Modal } from "antd";

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
    <div className="flex flex-col items-center mt-4 space-y-4 h-fit">
      <Form className="flex flex-col items-center">
        {formElements.map((element, index) => (
          <div key={index} className="flex flex-row gap-5">
            <Form.Item label="Select 1">
              <Select
                defaultValue={element.select1}
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
            <Form.Item label="Select 2">
              <Select
                defaultValue={element.select2}
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
            <Form.Item label="Number">
              <InputNumber
                min={0}
                defaultValue={element.number}
                onChange={(value) =>
                  handleFormElementChange(index, "number", value)
                }
              />
            </Form.Item>
            <Button
              onClick={() => deleteFormElement(index)}
              type="primary"
              className="font-bold py-2 px-4 rounded ml-2"
              danger
            >
              -
            </Button>
          </div>
        ))}
      </Form>
      <div className="flex flex-row gap-4">
        <Button onClick={addFormElement} className="text-sm font-bold py-2 px-4 rounded align-middle" type="primary" size="large">
          +
        </Button>
        <Button
          type="primary"
          onClick={handleGenerateCode}
          className="bg-green-600 hover:bg-green-400 text-white font-bold py-2 px-4 rounded"
          size="large"
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
