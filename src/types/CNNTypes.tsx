enum CNNLayerTypes {
  Input = "Input",
  Conv = "Conv",
  Pool = "Pool",
  Padding = "Padding",
  // Flatten = "Flatten",
  // Linear = "Linear",
  // Dropout = "Dropout",
}

type InputLayer = {
  size: [number, number, number];
  type: CNNLayerTypes.Input;
};

type ConvLayer = {
  size: number;
  kernel: [number, number];
  type: CNNLayerTypes.Conv;
};

type PoolLayer = {
  stride: [number, number];
  kernel: [number, number];
  type: CNNLayerTypes.Pool;
};

type PaddingLayer = {
  padding: [number, number];
  type: CNNLayerTypes.Padding;
};

type CNNLayer = InputLayer | ConvLayer | PoolLayer | PaddingLayer;

const cnnEmptyLayers: Record<CNNLayerTypes, () => CNNLayer> = {
  Input: () => ({ size: [0, 0, 0], type: CNNLayerTypes.Input } as InputLayer),
  Conv: () => ({ size: 0, kernel: [0, 0], type: CNNLayerTypes.Conv } as CNNLayer),
  Pool: () =>
    ({ stride: [0, 0], kernel: [0, 0], type: CNNLayerTypes.Pool } as PoolLayer),
  Padding: () =>
    ({ padding: [0, 0], type: CNNLayerTypes.Padding } as PaddingLayer),
} as const;

export { CNNLayerTypes, cnnEmptyLayers };
export type {
  CNNLayer,
  ConvLayer,
  InputLayer,
  PaddingLayer,
  PoolLayer,
};

export interface CNNConfig {
  layers: CNNLayer[];
  kerasType: string
}

export interface CodeGenerator {
  generateModel(config: CNNConfig, modelType?: string): string;
  generateImports(): string;
  generateTrainingCode(config: CNNConfig): string;
} 