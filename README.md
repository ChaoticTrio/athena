# ATHENA
<p align="center">
<img src="https://github.com/ChaoticTrio/athena/blob/main/src/assets/Logo.png" width="200">
<br><br>
Automated Tool for Hierarchical Exploration of Neural Architectures

</p>


## Description
**Athena**, named after the Greek goddess of wisdom and strategy, is an intuitive web-based tool designed to streamline the creation of machine learning models by generating starter code and meaningful visualizations. Whether you're a beginner looking for a quick way to structure your ML projects or an experienced practitioner prototyping architectures, **Athena** simplifies the process by providing ready-to-use code snippets and clear model diagrams.

## Live
**[https://athena-gamma-eight.vercel.app/](https://athena-gamma-eight.vercel.app/)**

## Features
- 🔀 Model Types
  - Support for Fully Connected (FCN) and Convolution Neural Networks (CNN)
- ⚙️ Model Architecture
  - Add, remove, rearrange layers
  - Edit layer parameters such as type, size, and other applicable parameters such as kernel and stride
- ✅ Validation
  - Layer arrangement and all layer parameters are validated upon generation.
- ⚙️ Generation
  - Single click generation of starter code and architecture visualization
- 🖼️ Interactive Visualization
  - Interactive visualization with ability to expand into full screen, zoom and pan along with rotate for CNNs
  - Clean and minimal architecture visualizations with configurable annotations settings
- 📋💾 Copy and Save
  - Copy your code or download as a python file
  - Download the model visualization as an image   

## Usage
- Choose the type of your model - FCN or CNN
- Add and configure layers and their parameters
- Move, delete and rearrange layers to achieve your desired model architecture
- Generate code and visualization with one click
- Configure visualization's annotation settings
- Download the visualization an an image
- Copy the code or save as a .py file

## Supported Frameworks & Libraries
Currently the following frameworks/libraries are supported along with their respective paradigms for creating models
- PyTorch
- Keras
  - Sequential
  - Functional
  - Subclassing 

## Local Setup & Development
To run the project locally and set up a development environment, follow these steps:

### Prerequisites
Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Recommended: Latest LTS version)
- [npm](https://www.npmjs.com/) (Comes with Node.js)
- [Git](https://git-scm.com/) (for cloning the repository)

### Clone the repository
```bash
git clone https://github.com/ChaoticTrio/athena.git
cd athena
```

### Install Dependencies
Use npm to install the required packages:
```bash
npm install
```

### Run the Development Server
Start the local development server:
```bash
npm run dev
```

## Credits & Acknowledgements
- [D3.js](https://d3js.org/) for FCN visualization
- [Three.js](https://threejs.org/) for CNN visualization
- [monaco-editor/react](https://www.npmjs.com/package/@monaco-editor/react) for Code editor
  
## Contributors
- [Avinash Changrani](https://github.com/nabobery)
- [Ayaan Ahmed](https://github.com/ayaanmayooq/)
- [Yeluri Ketan](http://github.com/YeluriKetan)
