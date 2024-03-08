import React, { FC, useState } from 'react';
import { Button, NativeSelect, NumberInput, Dialog, Transition } from '@mantine/core';

interface FormElement {
  select1: string;
  select2: string;
  number: number;
}

const options1 = ['Input', 'Flatten', 'Linear', 'Dropout'];
const options2 = ['RELU', 'Sigmoid', 'Tanh', 'Softmax'];

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
    setFormElements([...formElements, {select1: options1[0], select2: options2[0], number: 0 }]);
  };

  const deleteFormElement = (index: number) => {
    const newFormElements = formElements.filter((_, i) => i !== index);
    setFormElements(newFormElements);
  };

  // Function that validates the form
  // For now, it just checks if all the form elements are filled
  const validateForm = () => {
    return formElements.every((formElement) => formElement.number > 0);
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {formElements.map((formElement, index) => (
        <div key={index} className='flex flex-row space-x-4'>
          <NativeSelect
          data={options1}
          value={formElement.select1}
          onChange={(event) => handleFormElementChange(index, 'select1', event.target.value)}
          label="Select Layer"
          size="md" radius="md"
          withAsterisk
        />
        <NativeSelect
          data={options2}
          value={formElement.select2}
          onChange={(event) => handleFormElementChange(index, 'select2', event.target.value)}
          label="Select Activation"
          size="md" radius="md"
          withAsterisk
        />
          <NumberInput
            value={formElement.number}
            onChange={(val) => handleFormElementChange(index, 'number', val)}
            label="Number of Neurons"
            min={1}
            placeholder="Number of Neurons"
            size="md" radius="md"
            withAsterisk
          />
          <Button onClick={() => deleteFormElement(index)} color="red" size="lg" mt="md">-</Button>
        </div>
      ))}
      <Button onClick={addFormElement} color="teal" size="lg">Add Element</Button>
      <Button onClick={handleGenerateCode} color="teal" size="lg">Generate Code</Button>
      <Transition
      mounted={isDialogOpen}
      transition="pop-top-left"
      duration={200}
      onExited={() => setDialogOpen(false)}
    >
      {(transitionStyles) => (
        <Dialog
          style={transitionStyles}
          title="Error"
          opened={isDialogOpen}
          withCloseButton
          onClose={() => setDialogOpen(false)}
        >
          Please fill all form elements before generating code.
        </Dialog>
      )}
    </Transition>
    </div>
  );
};

export default FCN;