import React, { useState } from "react";
import api from "../../api";
import { Link } from "react-router-dom";
import "./documents.css";

function Documents() {
    
    // Store selected file
    const [file, setFile] = useState(null);

    // Store success and error message
    const [message, setMessage] = useState("");
    const [error, setError] = useState(""); 

    //Track whether the upload is proccessing
    const [loading, setLoading] = useState(false);

    // runs when the user select the file
    const handleFileChange = (event) => {
        setFile(event.target.file[0]);
        setMessage("");
        setError("");
    };

    // Sends the selectecd file to Django
    const handleUpload = async (event) =>  {
        event.preventDefault();

        if(!file){
            setError("Please select a file to start")
            return;
        }

        // FormData allows us to send file through HTTP
        const formData = new FormData();
        formData.append("file", file);

        setMessage("");
        setError("");
        setLoading(true);

        try{
            await api.post("documents/", formData);

            setMessage("Document uploaded successfully!");
            setFile(null);

            //clears the file input visually
            event.target.reset();
        }catch (err){
            const responseData = err.response?.data;

              if (responseData) {
                setError(JSON.stringify(responseData));
            } else {
                setError("Unable to connect to the server.");
            }
        }finally{
            setLoading(false);
        }
    };

    return (
        <main className="documents-container">

            <header className="documents-header">
                <div>
                    <h1>My Documents</h1>
                    <p>Upload your study notes and prepare for AI quizzes.</p>
                </div>

                <Link to="/dashboard">Back to Dashboard</Link>
            </header>

            <section className="upload-card">

                <h2>Upload Study Notes</h2>

                <p>
                    Select a PDF or TXT file containing your study material.
                </p>

                {message && (
                    <p className="success-message">{message}</p>
                )}

                {error && (
                    <p className="error-message">{error}</p>
                )}

                <form onSubmit={handleUpload}>

                    <label htmlFor="study-file">
                        Choose a study file
                    </label>

                    <input
                        id="study-file"
                        type="file"
                        accept=".pdf,.txt"
                        onChange={handleFileChange}
                        required
                    />

                    {file && (
                        <p className="selected-file">
                            Selected: {file.name}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Uploading..." : "Upload Document"}
                    </button>

                </form>

            </section>

        </main>
    );

};


export default Documents;