import {
  CNNConfig,
  CNNLayerTypes,
  CodeGenerator,
} from "../../../types/CNNTypes";

export class PyTorchGenerator implements CodeGenerator {
  /**
   * Generates the necessary import statements for a PyTorch model.
   * @returns A string containing the import statements
   *
   * @see https://pytorch.org/docs/stable/index.html
   */
  generateImports(): string {
    return `import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader`;
  }

  /**
   * Generates a PyTorch model based on the given CNN configuration.
   * @param config The CNN configuration
   * @returns The generated code as a string
   */
  generateModel(config: CNNConfig): string {
    let code = "class CNNModel(nn.Module):\n";
    code += "    def __init__(self):\n";
    code += "        super().__init__()\n";

    // Layer definitions
    let prevChannels = 0;
    let index = 1;
    config.layers.forEach((layer) => {
      switch (layer.type) {
        case CNNLayerTypes.Input:
          prevChannels = layer.size[2]; // Input channels
          break;
        case CNNLayerTypes.Conv:
          code += `        self.conv${index++} = nn.Conv2d(${prevChannels}, ${
            layer.size
          }, kernel_size=(${layer.kernel[0]}, ${layer.kernel[1]}))\n`;
          prevChannels = layer.size;
          break;
        case CNNLayerTypes.Pool:
          code += `        self.pool${index++} = nn.MaxPool2d(kernel_size=(${
            layer.kernel[0]
          }, ${layer.kernel[1]}), stride=(${layer.stride[0]}, ${
            layer.stride[1]
          }))\n`;
          break;
        case CNNLayerTypes.Padding:
          code += `        self.pad${index++} = nn.ZeroPad2d((${
            layer.padding[1]
          }, ${layer.padding[1]}, ${layer.padding[0]}, ${layer.padding[0]}))\n`;
          break;
        case CNNLayerTypes.Flatten:
          code += `        self.flatten = nn.Flatten()\n`;
          break;
        case CNNLayerTypes.Dense:
          code += `        self.fc${index++} = nn.Linear(${prevChannels}, ${
            layer.size
          })\n        self.act${index++} = ${this.getActivation(
            layer.activation
          )}\n`;
          prevChannels = layer.size;
          break;
        case CNNLayerTypes.Dropout:
          code += `        self.dropout${index++} = nn.Dropout(p=${
            layer.rate
          })\n`;
          break;
        case CNNLayerTypes.Output:
          code += `        self.output = nn.Linear(${prevChannels}, ${
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
        case CNNLayerTypes.Conv:
          code += `        x = self.conv${index++}(x)\n`;
          break;
        case CNNLayerTypes.Pool:
          code += `        x = self.pool${index++}(x)\n`;
          break;
        case CNNLayerTypes.Padding:
          code += `        x = self.pad${index++}(x)\n`;
          break;
        case CNNLayerTypes.Flatten:
          code += `        x = self.flatten(x)\n`;
          break;
        case CNNLayerTypes.Dense:
          code += `        x = self.fc${index++}(x)\n        x = self.act${index++}(x)\n`;
          break;
        case CNNLayerTypes.Dropout:
          code += `        x = self.dropout${index++}(x)\n`;
          break;
        case CNNLayerTypes.Output:
          code += `        x = self.output(x)\n        x = self.act${index++}(x)\n`;
          break;
      }
    });
    code += "        return x\n";

    return code;
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
   * Generates training code for a PyTorch model based on the given CNN configuration.
   * @param config The CNN configuration
   * @returns The generated code as a string
   */
  generateTrainingCode(): string {
    return `
def train_model(model, train_loader, num_epochs=10):
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    for epoch in range(num_epochs):
        running_loss = 0.0
        for inputs, labels in train_loader:
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
