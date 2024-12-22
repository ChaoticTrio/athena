import {
  CodeGenerator,
  DenseLayer,
  FCNConfig,
  FCNLayer,
  FCNLayerTypes,
  InputLayer,
} from "../../../types/FCNTypes";

export class PyTorchGenerator implements CodeGenerator {
  /**
   * Generates the necessary import statements for a PyTorch model.
   * @returns A string containing the import statements
   */
  generateImports(): string {
    return `import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader`;
  }

  /**
   * Generates a PyTorch model based on the given FCN configuration.
   * @param config The FCN configuration
   * @returns The generated code as a string
   */
  generateModel(config: FCNConfig): string {
    let code = "class FCNModel(nn.Module):\n";
    code += "    def __init__(self):\n";
    code += "        super().__init__()\n";

    // Layer definitions
    let prevSize = 0;
    let index = 1;
    config.layers.forEach((layer) => {
      switch (layer.type) {
        case FCNLayerTypes.Input:
          prevSize = layer.size;
          break;
        case FCNLayerTypes.Dense:
          code += `        self.fc${index++} = nn.Linear(${prevSize}, ${
            layer.size
          })\n        self.act${index++} = ${this.getActivation(
            layer.activation
          )}\n`;
          prevSize = layer.size;
          break;
        case FCNLayerTypes.Dropout:
          code += `        self.dropout${index++} = nn.Dropout(p=${
            layer.rate
          })\n`;
          break;
        case FCNLayerTypes.Output:
          code += `        self.output = nn.Linear(${prevSize}, ${
            layer.size
          })\n        self.act${index++} = ${this.getActivation(
            layer.activation
          )}\n`;
          break;
      }
    });

    // Forward method
    index = 1;
    code += "\n    def forward(self, x):\n";
    config.layers.forEach((layer) => {
      switch (layer.type) {
        case FCNLayerTypes.Dense:
          code += `        x = self.fc${index++}(x)\n        x = self.act${index++}(x)\n`;
          break;
        case FCNLayerTypes.Dropout:
          code += `        x = self.dropout${index++}(x)\n`;
          break;
        case FCNLayerTypes.Output:
          code += `        x = self.output(x)\n        x = self.act${index++}(x)\n`;
          break;
      }
    });
    code += "        return x\n";

    return code;
  }

  /**
   * Generates the PyTorch layers for the given fully connected network (FCN) configuration.
   * Maps through each FCN layer and generates the corresponding PyTorch layer code.
   * Supports 'Dense' and 'Dropout' layer types.
   *
   * @param layers - An array of FCNLayer objects representing the layers to be generated
   * @returns The generated PyTorch layer code as a formatted string
   */

  private generateLayers(layers: FCNLayer[]): string {
    let prevSize = 0;
    return layers
      .map((layer) => {
        switch (layer.type) {
          case "Input":
            prevSize = (layer as InputLayer).size;
            return "";
          case "Dense": {
            const res = `nn.Linear(${prevSize}, ${layer.size}),
            ${this.getActivation(layer.activation)},`;
            prevSize = (layer as DenseLayer).size;
            return res;
          }

          case "Dropout":
            return `nn.Dropout(p=${layer.rate}),`;

          case "Output":
            return `nn.Linear(${prevSize}, ${layer.size}),
            ${this.getActivation(layer.activation)},`;

          default:
            return "";
        }
      })
      .filter(Boolean)
      .join("\n            ");
  }

  /**
   * Returns the PyTorch-compatible activation string for the given activation type.
   * If the given type is not recognized, it defaults to 'relu'.
   * @param {string} activation The activation type to map
   * @returns {string} The PyTorch-compatible activation string
   */
  private getActivation(activation: string): string {
    const activationMap: Record<string, string> = {
      ReLU: "nn.ReLU()",
      Sigmoid: "nn.Sigmoid()",
      Tanh: "nn.Tanh()",
      Softmax: "nn.Softmax(dim=1)",
    };
    return activationMap[activation] || "nn.ReLU()";
  }

  /**
   * Generates the training code for a PyTorch model.
   *
   * @param {FCNConfig} config The configuration of the model.
   * @returns {string} The generated code as a string.
   */
  generateTrainingCode(): string {
    return `
def train_model(model, train_loader, num_epochs=10):
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    for epoch in range(num_epochs):
        running_loss = 0.0
        for inputs, labels in train_loader:
            inputs = inputs.view(inputs.size(0), -1)  # Flatten the input
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
            
        print(f'Epoch {epoch + 1}, Loss: {running_loss / len(train_loader)}')
        
# Example usage:
# Assume train_loader is defined with proper inputs of size [batch_size, input_size] and labels of size [batch_size, input_size]
# model = FCN()
# train_model(model, train_loader)`;
  }
}
