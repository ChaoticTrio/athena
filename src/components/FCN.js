import React, { useState } from 'react';
import axios from 'axios';

function FCNForm() {
    const [layers, setLayers] = useState([{ numNeurons: '', selectedOption: 'ReLU', width: 20}]); // Initial state with one layer

    const addLayer = () => {
        const newLayers = [...layers, { numNeurons: '', selectedOption: 'ReLU', width: 20}];
        setLayers(newLayers);
    }

    const removeLayer = index => {
        const newLayers = layers.filter((layer, i) => i !== index);
        setLayers(newLayers);
    }

    const handleLayerChange = (index, field, value) => {
        const newLayers = [...layers];
        newLayers[index][field] = value;
        setLayers(newLayers);
    }

    const Layer = ({ index, numNeurons, selectedOption, width, onRemove}) => {
        return (
            <div className="row entry">
                <div className="input-group mb-2 mr-sm-2 col-4">
                    <button className="btn btn-secondary btn-remove" onClick={onRemove}><span className="fa fa-minus"></span></button>
                    <input 
                        type="number" 
                        className="form-control" 
                        name="numberOfNodes" 
                        step="1" 
                        value={numNeurons} 
                        onChange={(e) => handleLayerChange(index, 'numNeurons', e.target.value)}
                    />
                     <select 
                        value={selectedOption}
                        onChange={(e) => handleLayerChange(index, 'selectedOption', e.target.value)}
                    >
                        <option value="ReLU">ReLU</option>
                        <option value="Sigmoid">Sigmoid</option>
                        <option value="Tanh">Tanh</option>
                    </select>
                </div>
                <input 
                    type="range" 
                    className="form-control col-4" 
                    name="betweenNodesInLayer" 
                    min="0" 
                    max="100" 
                    step="1" 
                    value={width}
                    onChange={(e) => handleLayerChange(index, 'width', e.target.value)}
                    style={{ position: "relative", top: "-4px" }} 
                />
            </div>
        );
    }


    // const handleNumLayersChange = (event) => {
    //     setNumLayers(event.target.value);
    // }


    const handleSubmit = (event) => {
        event.preventDefault();

        // Convert neurons per layer into an array of numbers
        // const neuronsArray = neuronsPerLayer.split(',').map(n => +n.trim());

        // const queryParams = {
        //     numLayers,
        //     neuronsPerLayer: neuronsArray.join(','),
        //     activationFunction
        // };

        // axios.get(`http://localhost:5000/fcn-arch`, { params: queryParams })
        //     .then(response => {
        //         console.log('Response:', response.data);
        //         // Handle the response data
        //     })
        //     .catch(error => {
        //         console.error('Error:', error);
        //     });
    }

    return (
        <div className='column align-items-center'>
                {layers.map((layer, index) => (
                    <Layer
                        key={index}
                        index={index}
                        numNeurons={layer.numNeurons}
                        width={layer.width}
                        selectedOption={layer.selectedOption}
                        onRemove={() => removeLayer(index)}
                    />
                ))}
                    <button className="btn btn-secondary btn-add" onClick={addLayer}>+</button>
            <hr/>
            <button className="btn btn-secondary" onClick={handleSubmit}>Generate Code </button>
        </div>
    );
}

export default FCNForm;