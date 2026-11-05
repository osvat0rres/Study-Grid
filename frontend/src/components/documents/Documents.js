import React, { useState, useEffect } from "react";
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
        const selectedFile = event.currentTarget.files?.[0];

        if (!selectedFile) {
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setMessage("");
        setError("");
    };
    
    // Uploaded documents from Django
    const [documents, setDocuments] = useState([]);
    // Weather documents are loading
    const [loadingDocuments, setLoadingDocuments] = useState(true);
    // Error message if loading fails
    const [documentsError, setDocumentError] = useState("");

    const fetchDocuments = async() => {
        try{
            const response = await api.get("documents/");

            // Support both regular list and paginated reponses
            const data = response.data;

            setDocuments(Array.isArray(data) ? data : data.results || []);
            setDocumentError("");
        }catch(err){
            console.error("Error loading documents: ", err);
            setDocumentError("Unable to load documents. ");
        }finally{
            setLoadingDocuments(false);
            
        }
    };

    useEffect(() =>{
        fetchDocuments();
    },[]);


    // Sends the selectecd file to Django
    const handleUpload = async (event) =>  {
        event.preventDefault();

        if(!file){
            setError("Please select a file to start")
            return;
        }

        // FormData allows us to send file through HTTP
        const formData = new FormData();

        // Automatically use the filename as the document title
        const documentTitle = file.name.replace(/\.[^/.]+$/, "");

        formData.append("title", documentTitle);
        formData.append("file", file);

        setMessage("");
        setError("");
        setLoading(true);

        try{
            await api.post("documents/", formData);

            setMessage("Document uploaded successfully!");
            await fetchDocuments();

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
                <section className="documents-list-section">
                    <h2>Your Documents</h2>

                    {loadingDocuments && (
                        <p>Loading documents...</p>
                    )}

                    {documentsError &&(
                        <p className="error-message">{documentsError}</p>
                    )}

                    {!loadingDocuments && documents.lenght === 0 && (
                        <p>You haven't uploaded any documents yet.</p>
                    )}

                    <div className="documents-list">

                        {documents.map((document) => (
                          <div className="document-card" key={document.id}>

                            <div className="document-info">
                                <h3>{document.title}</h3>

                                <p>
                                    Uploaded:{""}
                                    {new Date(document.uploaded_at).toLocaleDateString()}
                                </p> 

                            </div>

                            <span className="document-status">
                                Ready
                            </span>

                          </div>  
                        ))}

                    </div>


                </section>

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