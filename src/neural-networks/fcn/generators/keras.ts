import { CodeGenerator, FCNConfig, FCNLayer, InputLayer, DenseLayer } from '../../../types/FCNTypes';

export class KerasGenerator implements CodeGenerator {
  /**
   * Generates the necessary import statements for a Keras model.
   * @returns A string containing the import statements
   */
  generateImports(): string {
    return `from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam`;
  }

  /**
   * Generates a Keras model based on the given FCN configuration and model type.
   * @param config The FCN configuration
   * @param modelType The type of Keras model to generate, defaults to 'sequential'
   * @returns The generated code as a string
   */
  generateModel(config: FCNConfig): string {
    const modelType = config.kerasType || 'Sequential';
    switch (modelType) {
      case 'Functional':
        return this.generateFunctionalModel(config);
      case 'Subclassing':
        return this.generateSubclassingModel(config);
      case 'Sequential':
      default:
        return this.generateSequentialModel(config);
    }
  }

  /**
   * Generates a Keras Sequential model based on the given FCN configuration.
   * @param config The FCN configuration
   * @returns The generated code as a string
   */
  private generateSequentialModel(config: FCNConfig): string {
    return `
def create_model():
    model = Sequential([
        ${this.generateLayers(config.layers)}
    ])
    
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='mse',
        metrics=['accuracy']
    )
    
    return model`;
  }


  /**
   * Generates a Keras functional model based on the given FCN configuration.
   * @param config The FCN configuration
   * @returns The generated code as a string
   */
  private generateFunctionalModel(config: FCNConfig): string {
    const inputShape = config.layers[0].type === 'Input' ? config.layers[0].size : undefined;
    return `
def create_model():
    inputs = Input(shape=${JSON.stringify(inputShape)})
    x = ${this.generateLayers(config.layers, true)}
    model = Model(inputs=inputs, outputs=x)
    
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='mse',
        metrics=['accuracy']
    )
    
    return model`;
  }

  /**
   * Generates a Keras subclassing model based on the given FCN configuration.
   * @param config The FCN configuration
   * @returns The generated code as a string
   */
  private generateSubclassingModel(config: FCNConfig): string {
    return `
class CustomModel(tf.keras.Model):
    def __init__(self):
        super(CustomModel, self).__init__()
        self.layers = [
            ${this.generateLayers(config.layers)}
        ]

    def call(self, inputs):
        x = inputs
        for layer in self.layers:
            x = layer(x)
        return x

def create_model():
    model = CustomModel()
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='mse',
        metrics=['accuracy']
    )
    
    return model`;
  }

  /**
   * Generates the Keras layers for the given FCN configuration.
   * @param layers The FCN layers
   * @param isFunctional Whether to generate the layers for a functional model or not
   * @returns The generated code as a string
   */
  private generateLayers(layers: FCNLayer[], isFunctional: boolean = false): string {
    return layers.map((layer, index) => {
      switch (layer.type) {
        case 'Input':
            return isFunctional 
                ? `Input(shape=(${layer.size},)),` 
                : `Dense(${(layers[index + 1] as DenseLayer).size}, input_dim=${layer.size}, activation='${this.getActivation((layers[index + 1] as DenseLayer).activation || 'ReLU')}'),`;
        
        case 'Dense':
            if (index === 0) {
                return isFunctional 
                    ? `Dense(${layer.size}, activation='${this.getActivation(layer.activation)}')(inputs),` 
                    : `Dense(${layer.size}, input_dim=${(layers[0] as InputLayer).size}, activation='${this.getActivation(layer.activation)}'),`;
            }
            return isFunctional 
                ? `Dense(${layer.size}, activation='${this.getActivation(layer.activation)}')(x),` 
                : `Dense(${layer.size}, activation='${this.getActivation(layer.activation)}'),`;
        
        case 'Dropout':
            return `Dropout(${layer.rate}),`;
        
        default:
            return '';
      }
    }).filter(Boolean).join('\n        ');
  }

  /**
   * Returns the Keras-compatible activation string for the given activation type.
   * If the given type is not recognized, it defaults to 'relu'.
   * @param activation The activation type to map
   * @returns The Keras-compatible activation string
   */
  private getActivation(activation: string): string {
    const activationMap: Record<string, string> = {
      'ReLU': 'relu',
      'Sigmoid': 'sigmoid',
      'Tanh': 'tanh',
      'Softmax': 'softmax'
    };
    return activationMap[activation] || 'relu';
  }

  /**
   * Generates a function to train a given Keras model using the given FCN configuration.
   * @param config The FCN configuration
   * @returns The generated code as a string
   */
  generateTrainingCode(config: FCNConfig): string {
    return `
def train_model(model, x_train, y_train, epochs=10, batch_size=32):
    history = model.fit(
        x_train,
        y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.2
    )
    return history`;
  }
} 