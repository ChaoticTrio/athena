enum FCNLayerTypes {
  Input = "Input",
  Dense = "Dense",
  Dropout = "Dropout",
  Output = "Output",
}

type InputLayer = {
  type: FCNLayerTypes.Input;
  size: number;
};

type DenseLayer = {
  type: FCNLayerTypes.Dense;
  size: number;
  activation: ActivationFunctions;
};

type DropoutLayer = {
  type: FCNLayerTypes.Dropout;
  rate: number;
};

type OutputLayer = {
  type: FCNLayerTypes.Output;
  size: number;
  activation: ActivationFunctions;
};

type FCNLayer = InputLayer | DenseLayer | DropoutLayer | OutputLayer;
enum ActivationFunctions {
  ReLU = "ReLU",
  Sigmoid = "Sigmoid",
  Tanh = "Tanh",
  Softmax = "Softmax",
}

const fcnEmptyLayers: Record<FCNLayerTypes, () => FCNLayer> = {
  [FCNLayerTypes.Input]: () => ({ type: FCNLayerTypes.Input, size: 1 }),
  [FCNLayerTypes.Dense]: () => ({
    type: FCNLayerTypes.Dense,
    size: 1,
    activation: ActivationFunctions.ReLU,
  }),
  [FCNLayerTypes.Dropout]: () => ({ type: FCNLayerTypes.Dropout, rate: 0.01 }),
  [FCNLayerTypes.Output]: () => ({
    type: FCNLayerTypes.Output,
    size: 1,
    activation: ActivationFunctions.ReLU,
  }),
};

const FCN_LIMITS = {
  INPUT: {
    SIZE: { MIN: 1, MAX: 100000 },
  },
  DENSE: {
    SIZE: { MIN: 1, MAX: 50000 },
  },
  OUTPUT: {
    SIZE: { MIN: 1, MAX: 10000 },
  },
  DROPOUT: {
    RATE: { MIN: 0.01, MAX: 1 },
  },
};

const sampleFCN: () => FCNLayer[] = () => [
  { type: "Input", size: 8 } as InputLayer,
  {
    type: "Dense",
    size: 16,
    activation: ActivationFunctions.ReLU,
  } as DenseLayer,
  {
    type: "Dense",
    size: 16,
    activation: ActivationFunctions.Sigmoid,
  } as DenseLayer,
  {
    type: "Dense",
    size: 16,
    activation: ActivationFunctions.Softmax,
  } as DenseLayer,
  {
    type: "Dense",
    size: 16,
    activation: ActivationFunctions.Tanh,
  } as DenseLayer,
  { type: "Output", size: 8 } as OutputLayer,
];

export {
  ActivationFunctions,
  FCN_LIMITS,
  fcnEmptyLayers,
  FCNLayerTypes,
  sampleFCN,
};
export type { DenseLayer, DropoutLayer, FCNLayer, InputLayer, OutputLayer };
