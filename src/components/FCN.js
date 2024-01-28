import React, { useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

function FCNForm() {
    const [numLayers, setNumLayers] = useState(1);
    const [neuronsPerLayer, setNeuronsPerLayer] = useState('');
    const [activationFunction, setActivationFunction] = useState('ReLU');

    const handleSubmit = (event) => {
        event.preventDefault();

        // Convert neurons per layer into an array of numbers
        const neuronsArray = neuronsPerLayer.split(',').map(n => +n.trim());

        const queryParams = {
            numLayers,
            neuronsPerLayer: neuronsArray.join(','),
            activationFunction
        };

        axios.get(`http://localhost:5000/fcn-arch`, { params: queryParams })
            .then(response => {
                console.log('Response:', response.data);
                // Handle the response data
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    return (
        <form id="fcnForm" onSubmit={handleSubmit}>
            <label htmlFor="numLayers">Number of Layers:</label>
            <input 
                type="number" 
                id="numLayers" 
                name="numLayers" 
                min="1" 
                value={numLayers}
                onChange={e => setNumLayers(e.target.value)}
                required 
            />
            <br /><br />

            <label htmlFor="neuronsPerLayer">Neurons per Layer (comma-separated):</label>
            <input 
                type="text" 
                id="neuronsPerLayer" 
                name="neuronsPerLayer" 
                value={neuronsPerLayer}
                onChange={e => setNeuronsPerLayer(e.target.value)}
                required 
            />
            <br /><br />

            <label htmlFor="activationFunction">Activation Function:</label>
            <select 
                id="activationFunction" 
                name="activationFunction" 
                value={activationFunction}
                onChange={e => setActivationFunction(e.target.value)}
            >
                <option value="ReLU">ReLU</option>
                <option value="Sigmoid">Sigmoid</option>
                <option value="Tanh">Tanh</option>
            </select>
            <br /><br />

            <input type="submit" value="Generate Code" />
        </form>
    );
}

export default FCNForm;