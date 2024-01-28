import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch data from the backend
        const fetchData = async () => {
            try {
                const result = await axios('/api/test');
                setMessage(result.data.message);
            } catch (error) {
                console.error('Error fetching data from backend', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <p>
                    Message from backend: hiyahahhah {message}
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
