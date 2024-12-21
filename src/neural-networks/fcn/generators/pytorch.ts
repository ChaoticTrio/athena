import { CodeGenerator, FCNConfig, FCNLayer, InputLayer, DenseLayer } from "../../../types/FCNTypes";

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
    const { layers } = config;

    return `
class FCN(nn.Module):
    def __init__(self):
        super(FCN, self).__init__()
        self.layers = nn.Sequential(
            ${this.generateLayers(layers)}
        )
        
    def forward(self, x):
      x = self.flatten(x)
      logits = self.layers(x)
      return logits`;
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
    return layers
      .map((layer, index) => {
        switch (layer.type) {
        //   case "Input":
        //     return `nn.Linear(${layer.size}, ${
        //       layers[index + 1].type === "Dense"
        //         ? layers[index + 1].size
        //         : layer.size
        //     }),`;

        case "Dense":
          return `nn.Linear(${
              layers[index - 1].type === "Input" || 
              layers[index - 1].type === "Dense" ? 
                (layers[index - 1] as InputLayer | DenseLayer).size : 
              layers[index - 1].type === "Dropout" ? 
                  (layers[index - 2] as InputLayer | DenseLayer).size : 
                  layer.size
          }, ${layer.size}),
            ${this.getActivation(layer.activation)},`;

          case "Dropout":
            return `nn.Dropout(p=${layer.rate}),`;

          case "Output":
            return `nn.Linear(${layer.size}, ${layer.size}),`;

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
