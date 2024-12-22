import { FCNConfig } from "../../types/FCNTypes";
import { KerasGenerator } from "./generators/keras";
import { PyTorchGenerator } from "./generators/pytorch";

export class FCNGenerator {
  private generators: Map<string, PyTorchGenerator | KerasGenerator>;

  /**
   * Creates a new FCNGenerator with PyTorch and Keras generators
   */
  constructor() {
    this.generators = new Map<string, PyTorchGenerator | KerasGenerator>([
      ["pytorch", new PyTorchGenerator()],
      ["keras", new KerasGenerator()],
    ]);
  }

  /**
   * Generates the code for a fully connected neural network model based on the specified framework.
   * @param framework The target framework for which to generate the code, e.g., 'pytorch' or 'keras'.
   * @param config The configuration for the fully connected neural network model.
   * @returns A string containing the generated code, including imports, model definition, and training code.
   * @throws Error if the specified framework is not supported.
   */

  generateCode(framework: string, config: FCNConfig): string {
    const generator = this.generators.get(framework.toLowerCase());
    if (!generator) {
      throw new Error(`Unsupported framework: ${framework}`);
    }

    return `${generator.generateImports()}

${generator.generateModel(config)}

${generator.generateTrainingCode(config)}`;
  }
}
