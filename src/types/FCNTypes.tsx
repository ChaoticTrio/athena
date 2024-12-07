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
  activation: FCNActivationFunctions;
};

type DropoutLayer = {
  type: FCNLayerTypes.Dropout;
  rate: number;
};

type OutputLayer = {
  type: FCNLayerTypes.Output;
  size: number;
  activation: FCNActivationFunctions;
};

type FCNLayer = InputLayer | DenseLayer | DropoutLayer | OutputLayer;
enum FCNActivationFunctions {
  ReLU = "ReLU",
  Sigmoid = "Sigmoid",
  Tanh = "Tanh",
  Softmax = "Softmax",
}

const fcnEmptyLayers: Record<FCNLayerTypes, () => FCNLayer> = {
  [FCNLayerTypes.Input]: () => ({ type: FCNLayerTypes.Input, size: 0 }),
  [FCNLayerTypes.Dense]: () => ({
    type: FCNLayerTypes.Dense,
    size: 0,
    activation: FCNActivationFunctions.ReLU,
  }),
  [FCNLayerTypes.Dropout]: () => ({ type: FCNLayerTypes.Dropout, rate: 0 }),
  [FCNLayerTypes.Output]: () => ({
    type: FCNLayerTypes.Output,
    size: 0,
    activation: FCNActivationFunctions.ReLU,
  }),
};

export { FCNLayerTypes, fcnEmptyLayers };
export type { DenseLayer, DropoutLayer, FCNLayer, InputLayer, OutputLayer };
export { FCNActivationFunctions };
