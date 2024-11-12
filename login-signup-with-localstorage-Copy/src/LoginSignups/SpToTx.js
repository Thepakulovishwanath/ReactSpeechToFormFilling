import React, { useEffect, useState } from 'react';
import { FaMicrophone, FaCircle, FaCheck, FaTimes } from 'react-icons/fa';

const SpToTx = () => {
    const [recognition, setRecognition] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        source_city: '',
        destination_city: '',
        departure_date: '',
        departure_time: '',
        mode_of_transport: 'Flight'
    });
    const [appendedText, setAppendedText] = useState('');
    const [extractedText, setExtractedText] = useState('');

    const styles = {
        body: {
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f4f4f4',
            margin: 0,
            padding: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '150vh',
        },
        container: {
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '1200px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '20px',
        },
        column: {
            flex: 1,
        },
        header: {
            textAlign: 'center',
            color: '#333',
            width: '100%',
        },
        controls: {
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px',
        },
        button: {
            padding: '10px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            display: 'inline-block',
        },
        recordingButton: {
            backgroundColor: '#ff4d4d',
        },
        textarea: {
            width: '80%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            marginBottom: '20px',
            resize: 'vertical',
        },
        input: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            marginBottom: '20px',
        },
        submitButton: {
            backgroundColor: '#28a745',
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
        },
    };

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Sorry, your browser does not support speech recognition.');
        } else {
            const recognitionInstance = new window.webkitSpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';
    
            recognitionInstance.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
    
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }
    
                if (finalTranscript) {
                    setAccumulatedTranscript((prev) => prev + finalTranscript);
                }
            };
    
            recognitionInstance.onerror = (event) => {
                console.error('Error occurred in recognition: ', event.error);
            };
    
            recognitionInstance.onend = () => {
                setIsRecording(false);
            };
    
            setRecognition(recognitionInstance);
        }
    }, []);

    const handleMicClick = () => {
        if (!isRecording) {
            recognition.start();
            setIsRecording(true);
        } else {
            recognition.stop();
            setIsRecording(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const text = accumulatedTranscript;
    
        if (text) {
            try {
                const response = await fetch('http://localhost:5000/api/analyze-text', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ booking_info: text }),
                });
    
                const data = await response.json();
                console.log("Data received from /api/analyze-text:", data);
    
                if (data.key_value_pairs) {
                    setFormData((prev) => ({
                        ...prev,
                        name: data.key_value_pairs.Name || '',
                        email: data.key_value_pairs.Email || '',
                        phone: data.key_value_pairs.Phone || '',
                        source_city: data.key_value_pairs['Source City'] || '',
                        destination_city: data.key_value_pairs['Destination City'] || '',
                        departure_date: data.key_value_pairs['Departure Date'] || '',
                        departure_time: data.key_value_pairs['Departure Time'] || '',
                        mode_of_transport: data.key_value_pairs['Mode of Transport'] || '',
                    }));
    
                    const extractedData = Object.entries(data.key_value_pairs).map(
                        ([key, value]) => `${key}: ${value}`
                    ).join('\n');
                    setExtractedText(extractedData);
                } else {
                    alert(data.error || 'Failed to analyze text. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            alert('No text to analyze!');
        }
    };

    const handleClear = () => {
        setAccumulatedTranscript('');
        setExtractedText('');
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBookingSubmit = (e) => {
        e.preventDefault();
    
        // Check if any field is empty
        const isEmptyField = Object.values(formData).some((value) => value === '');
    
        if (isEmptyField) {
            alert('Please fill the travel booking form');
            return;
        }
    
        // If all fields are filled, confirm booking
        const userConfirmed = window.confirm('Please confirm your booking');
        if (userConfirmed) {
            const appendedTextToAdd = `
            Name: ${formData.name}
            Email: ${formData.email}
            Phone: ${formData.phone}
            Source City: ${formData.source_city}
            Destination City: ${formData.destination_city}
            Departure Date: ${formData.departure_date}
            Departure Time: ${formData.departure_time}
            Mode of Transport: ${formData.mode_of_transport}`;
            setAppendedText((prev) => prev + appendedTextToAdd);
            alert('Your booking is confirmed');
            setFormData({
                name: '',
                email: '',
                phone: '',
                source_city: '',
                destination_city: '',
                departure_date: '',
                departure_time: '',
                mode_of_transport: 'Flight',
            });
            handleClear();
        }
    };
    

    const handleAppendTranscript = async () => {
        await handleSubmit(new Event('submit')); // Call handleSubmit programmatically
        setAppendedText((prev) => prev + accumulatedTranscript + "\n"); // Append transcript to history
    };

    return (
        <div style={styles.body}>
            <div style={styles.container}>
                <div style={styles.column}>
                    <h1 style={styles.header}>Speech to Text Converter</h1>
                    <div style={styles.controls}>
                        <button style={styles.button} onClick={handleMicClick}>
                            <FaMicrophone />
                        </button>
                        <button style={{ ...styles.button, ...(isRecording ? styles.recordingButton : {}) }} disabled>
                            <FaCircle />
                        </button>
                        <button style={styles.button} onClick={handleAppendTranscript}>
                            <FaCheck />
                        </button>
                        <button style={styles.button} onClick={handleClear}>
                            <FaTimes />
                        </button>
                    </div>
                    <textarea
                        style={styles.textarea}
                        rows="10"
                        value={accumulatedTranscript}
                        onChange={(e) => setAccumulatedTranscript(e.target.value)}
                        placeholder="Your speech will appear here..."
                    />
                    <textarea
                        style={styles.textarea}
                        rows="10"
                        value={appendedText}
                        readOnly
                        placeholder="Appended booking info will appear here..."
                    />
                    <textarea
                        style={styles.textarea}
                        rows="10"
                        value={extractedText} // Render extracted key-value pairs here
                        readOnly
                        placeholder="Extracted key-value pairs will appear here..."
                    />
                </div>

                <div style={styles.column}>
                    <h1 style={styles.header}>Travel Booking Form</h1>
                    <form id="booking-form" onSubmit={handleBookingSubmit}>
                        <label htmlFor="name">Name:</label>
                        <input style={styles.input} type="text" name="name" id="name" value={formData.name} onChange={handleFormChange} />
                        
                        <label htmlFor="email">Email:</label>
                        <input style={styles.input} type="email" name="email" id="email" value={formData.email} onChange={handleFormChange} />
                        
                        <label htmlFor="phone">Phone:</label>
                        <input style={styles.input} type="tel" name="phone" id="phone" value={formData.phone} onChange={handleFormChange} />

                        <label htmlFor="source_city">Source City:</label>
                        <input style={styles.input} type="text" name="source_city" id="source_city" value={formData.source_city} onChange={handleFormChange} />

                        <label htmlFor="destination_city">Destination City:</label>
                        <input style={styles.input} type="text" name="destination_city" id="destination_city" value={formData.destination_city} onChange={handleFormChange} />

                        <label htmlFor="departure_date">Departure Date:</label>
                        <input style={styles.input} type="date" name="departure_date" id="departure_date" value={formData.departure_date} onChange={handleFormChange} />

                        <label htmlFor="departure_time">Departure Time:</label>
                        <input style={styles.input} type="time" name="departure_time" id="departure_time" value={formData.departure_time} onChange={handleFormChange} />

                        <label htmlFor="mode_of_transport">Mode of Transport:</label>
                        <select style={styles.input} name="mode_of_transport" id="mode_of_transport" value={formData.mode_of_transport} onChange={handleFormChange}>
                            <option value="Flight">Flight</option>
                            <option value="Bus">Bus</option>
                            <option value="Train">Train</option>
                            <option value="Car">Car</option>
                        </select>

                        <button type="submit" style={{ ...styles.button, ...styles.submitButton }}>
                            Submit Booking
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SpToTx;
