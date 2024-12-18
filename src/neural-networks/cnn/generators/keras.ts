import { CodeGenerator, CNNConfig, CNNLayerTypes } from '../../../types/CNNTypes';

export class KerasGenerator implements CodeGenerator {

  /**
   * Generates the necessary import statements for a Keras model.
   * @returns A string containing the import statements
   */
  generateImports(): string {
    return `from tensorflow import keras
from tensorflow.keras import layers`;
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
          code += `model.add(layers.Input(shape=(${layer?.size[0]}, ${layer?.size[1]}, ${layer?.size[2]})))\n`;
          break;
        case CNNLayerTypes.Conv:
          code += `model.add(layers.Conv2D(${layer?.size}, (${layer?.kernel[0]}, ${layer?.kernel[1]})))\n`;
          break;
        case CNNLayerTypes.Pool:
          code += `model.add(layers.MaxPooling2D(pool_size=(${layer?.kernel[0]}, ${layer?.kernel[1]}), strides=(${layer.stride[0]}, ${layer.stride[1]})))\n`;
          break;
        case CNNLayerTypes.Padding:
          code += `model.add(layers.ZeroPadding2D(padding=(${layer?.padding[0]}, ${layer?.padding[1]})))\n`;
          break;
        case CNNLayerTypes.Flatten:
          code += `model.add(layers.Flatten())\n`;
          break;
        case CNNLayerTypes.Dense:
          code += `model.add(layers.Dense(${layer?.size}, activation='${layer.activation}'))\n`;
          break;
        case CNNLayerTypes.Dropout:
          code += `model.add(layers.Dropout(${layer.rate}))\n`;
          break;
        case CNNLayerTypes.Output:
          code += `model.add(layers.Dense(${layer?.size}, activation='${layer.activation}'))\n`;
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
    
    config.layers.forEach((layer, index) => {
      switch (layer.type) {
        case CNNLayerTypes.Input:
          code += `inputs = layers.Input(shape=(${layer?.size[0]}, ${layer?.size[1]}, ${layer?.size[2]}))\n`;
          break;
        case CNNLayerTypes.Conv:
          code += `x${index} = layers.Conv2D(${layer?.size}, (${layer?.kernel[0]}, ${layer?.kernel[1]})))(${prevLayer})\n`;
          prevLayer = `x${index}`;
          break;
        case CNNLayerTypes.Pool:
          code += `x${index} = layers.MaxPooling2D(pool_size=(${layer?.kernel[0]}, ${layer?.kernel[1]}), strides=(${layer.stride[0]}, ${layer.stride[1]}))(${prevLayer})\n`;
          prevLayer = `x${index}`;
          break;
        case CNNLayerTypes.Padding:
          code += `x${index} = layers.ZeroPadding2D(padding=(${layer?.padding[0]}, ${layer?.padding[1]}))(${prevLayer})\n`;
          prevLayer = `x${index}`;
          break;
        case CNNLayerTypes.Flatten:
          code += `x${index} = layers.Flatten()(${prevLayer})\n`;
          prevLayer = `x${index}`;
          break;
        case CNNLayerTypes.Dense:
          code += `x${index} = layers.Dense(${layer?.size}, activation='${layer.activation}')(${prevLayer})\n`;
          prevLayer = `x${index}`;
          break;
        case CNNLayerTypes.Dropout:
          code += `x${index} = layers.Dropout(${layer.rate})(${prevLayer})\n`;
          prevLayer = `x${index}`;
          break;
        case CNNLayerTypes.Output:
          code += `x${index} = layers.Dense(${layer?.size}, activation='${layer.activation}')(${prevLayer})\n`;
          prevLayer = `x${index}`;
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
    code += "        super(CNNModel, self).__init__()\n";

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
  generateTrainingCode(): string {
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
    return history`;
  }
} 