import {
  CNNConfig,
  CNNLayerTypes,
  CodeGenerator,
} from "../../../types/CNNTypes";

export class KerasGenerator implements CodeGenerator {
  /**
   * Generates the necessary import statements for a Keras model.
   * @returns A string containing the import statements
   */
  generateImports(): string {
    return `import keras
from keras import layers`;
  }

  /**
   * Generates a Keras model based on the given CNN configuration and model type.
   * @param config The CNN configuration
   *  @param modelType The type of Keras model to generate, defaults to 'Sequential'
   * @returns The generated code as a string
   */
  generateModel(config: CNNConfig): string {
    const modelType = config.kerasType || "Sequential";
    switch (modelType) {
      case "Sequential":
        return this.generateSequentialModel(config);
      case "Functional":
        return this.generateFunctionalModel(config);
      case "Subclassing":
        return this.generateSubclassingModel(config);
      default:
        throw new Error(`Unsupported Keras model type: ${modelType}`);
    }
  }

  /**
   * Generates a Keras Sequential model based on the given CNN configuration.
   * @param config The CNN configuration
   * @returns The generated code as a string
   */
  private generateSequentialModel(config: CNNConfig): string {
    let code = "model = keras.Sequential()\n";

    config.layers.forEach((layer) => {
      switch (layer.type) {
        case CNNLayerTypes.Input:
          code += `model.add(layers.Input(shape=(${layer.size[0]}, ${layer.size[1]}, ${layer.size[2]})))\n`;
          break;
        case CNNLayerTypes.Conv:
          code += `model.add(layers.Conv2D(${layer.size}, (${layer.kernel[0]}, ${layer.kernel[1]})))\n`;
          break;
        case CNNLayerTypes.Pool:
          code += `model.add(layers.MaxPooling2D(pool_size=(${layer.kernel[0]}, ${layer.kernel[1]}), strides=(${layer.stride[0]}, ${layer.stride[1]})))\n`;
          break;
        case CNNLayerTypes.Padding:
          code += `model.add(layers.ZeroPadding2D(padding=(${layer.padding[0]}, ${layer.padding[1]})))\n`;
          break;
        case CNNLayerTypes.Flatten:
          code += `model.add(layers.Flatten())\n`;
          break;
        case CNNLayerTypes.Dense:
          code += `model.add(layers.Dense(${
            layer.size
          }, activation='${layer.activation.toLowerCase()}'))\n`;
          break;
        case CNNLayerTypes.Dropout:
          code += `model.add(layers.Dropout(${layer.rate}))\n`;
          break;
        case CNNLayerTypes.Output:
          code += `model.add(layers.Dense(${
            layer.size
          }, activation='${layer.activation.toLowerCase()}'))\n`;
      }
    });

    return code;
  }

  /**
   * Generates a Keras Functional model based on the given CNN configuration.
   * @param config The CNN configuration
   * @returns The generated code as a string
   */
  private generateFunctionalModel(config: CNNConfig): string {
    let code = "";
    let prevLayer = "inputs";

    config.layers.forEach((layer) => {
      switch (layer.type) {
        case CNNLayerTypes.Input:
          code += `inputs = layers.Input(shape=(${layer?.size[0]}, ${layer?.size[1]}, ${layer?.size[2]}))\n`;
          break;
        case CNNLayerTypes.Conv:
          code += `x = layers.Conv2D(${layer?.size}, (${layer.kernel[0]}, ${layer.kernel[1]}))(${prevLayer})\n`;
          prevLayer = `x`;
          break;
        case CNNLayerTypes.Pool:
          code += `x = layers.MaxPooling2D(pool_size=(${layer.kernel[0]}, ${layer.kernel[1]}), strides=(${layer.stride[0]}, ${layer.stride[1]}))(${prevLayer})\n`;
          prevLayer = `x`;
          break;
        case CNNLayerTypes.Padding:
          code += `x = layers.ZeroPadding2D(padding=(${layer.padding[0]}, ${layer.padding[1]}))(${prevLayer})\n`;
          prevLayer = `x`;
          break;
        case CNNLayerTypes.Flatten:
          code += `x = layers.Flatten()(${prevLayer})\n`;
          prevLayer = `x`;
          break;
        case CNNLayerTypes.Dense:
          code += `x = layers.Dense(${
            layer.size
          }, activation='${layer.activation.toLowerCase()}')(${prevLayer})\n`;
          prevLayer = `x`;
          break;
        case CNNLayerTypes.Dropout:
          code += `x = layers.Dropout(${layer.rate})(${prevLayer})\n`;
          prevLayer = `x`;
          break;
        case CNNLayerTypes.Output:
          code += `x = layers.Dense(${
            layer.size
          }, activation='${layer.activation.toLowerCase()}')(${prevLayer})\n`;
          prevLayer = `x`;
      }
    });

    code += `\nmodel = keras.Model(inputs=inputs, outputs=${prevLayer})\n`;
    return code;
  }

  /**
   * Generates a Keras Subclassing model based on the given CNN configuration.
   * @param config The CNN configuration
   * @returns The generated code as a string
   */
  private generateSubclassingModel(config: CNNConfig): string {
    let code = "class CNNModel(keras.Model):\n";
    code += "    def __init__(self):\n";
    code += "        super().__init__()\n";

    config.layers.forEach((layer, index) => {
      switch (layer.type) {
        case CNNLayerTypes.Conv:
          code += `        self.conv${index} = layers.Conv2D(${layer?.size}, (${layer?.kernel[0]}, ${layer?.kernel[1]}))\n`;
          break;
        case CNNLayerTypes.Pool:
          code += `        self.pool${index} = layers.MaxPooling2D(pool_size=(${layer?.kernel[0]}, ${layer?.kernel[1]}), strides=(${layer.stride[0]}, ${layer.stride[1]}))\n`;
          break;
        case CNNLayerTypes.Padding:
          code += `        self.pad${index} = layers.ZeroPadding2D(padding=(${layer?.padding[0]}, ${layer?.padding[1]}))\n`;
          break;
        case CNNLayerTypes.Flatten:
          code += `        self.flatten = layers.Flatten()\n`;
          break;
        case CNNLayerTypes.Dense:
          code += `        self.dense${index} = layers.Dense(${
            layer?.size
          }, activation='${layer.activation.toLowerCase()}')\n`;
          break;
        case CNNLayerTypes.Dropout:
          code += `        self.dropout${index} = layers.Dropout(${layer.rate})\n`;
          break;
        case CNNLayerTypes.Output:
          code += `        self.output${index} = layers.Dense(${
            layer?.size
          }, activation='${layer.activation.toLowerCase()}')\n`;
          break;
      }
    });

    code += "\n    def call(self, inputs):\n";
    code += "        x = inputs\n";
    config.layers.forEach((layer, index) => {
      switch (layer.type) {
        case CNNLayerTypes.Conv:
          code += `        x = self.conv${index}(x)\n`;
          break;
        case CNNLayerTypes.Pool:
          code += `        x = self.pool${index}(x)\n`;
          break;
        case CNNLayerTypes.Padding:
          code += `        x = self.pad${index}(x)\n`;
          break;
        case CNNLayerTypes.Flatten:
          code += `        x = self.flatten(x)\n`;
          break;
        case CNNLayerTypes.Dense:
          code += `        x = self.dense${index}(x)\n`;
          break;
        case CNNLayerTypes.Dropout:
          code += `        x = self.dropout${index}(x)\n`;
          break;
        case CNNLayerTypes.Output:
          code += `        x = self.output${index}(x)\n`;
      }
    });
    code += "        return x\n";

    return code;
  }

  /**
   * Generates training code for a Keras model based on the given CNN configuration.
   * @param config The CNN configuration
   * @returns The generated code as a string
   */
  generateTrainingCode(config: CNNConfig): string {
    return `
def train_model(model, x_train, y_train, epochs=10, batch_size=32):
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    history = model.fit(
        x_train, y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.2
    )
    return history
\n# Example usage:
# Assume x_train and y_train are defined with proper input shapes and labels
${
  config?.kerasType == "Subclassing"
    ? "# For Subclassing model, we need to create a subclass model first => model = FCNModel()\n"
    : ""
}# train_model(model, x_train, y_train)`;
  }
}
