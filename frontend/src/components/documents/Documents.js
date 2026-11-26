import React, { useState, useEffect } from "react";
import api from "../../api";
import { Link, useNavigate } from "react-router-dom";
import "./documents.css";

function Documents() {

    
    // Store selected file
    const [file, setFile] = useState(null);

    const [subject, setSubject] = useState("");
    const [title, setTitle ] = useState("")

    // Store success and error message
    const [message, setMessage] = useState("");
    const [error, setError] = useState(""); 

    //Track whether the upload is proccessing
    const [loading, setLoading] = useState(false);

    // Tracks which document is genrating a quiz
    const [generatingQuizId, setGeneratingQuizId] = useState(null);

    // Stores quiz generation errors
    const [quizError, setQuizError] = useState("");

    // This lets React navigate to another page without refreshing the browser
    const navigate = useNavigate();

    // runs when the user select the file
    // event represents the input event
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

    // Generates a quiz using the document
   const handleGenerateQuiz = async (documentId) => {
        setGeneratingQuizId(documentId);
        setQuizError("");

        //This sends a POST request to Django
        try {
            const response = await api.post("quizzes/generate/", {
                // The ID of the uploaded document
                document_id: documentId,
                //How many questions Ollama should generate
                num_questions: 5,
            });

            console.log("Generated quiz:", response.data);

            // Navigate to the quiz page using its ID.
            navigate(`/quiz/${response.data.id}`);

            // This block of code will executes when something goes wrong 
            // inside the try block
        } catch (err) {
            console.error("Quiz generation error:", err);

            /*  This retrives the error reponse returned by Django
             The ?. is call a optional chaining. it prevenst JavaScript from 
             if err.response doesn't exits
            */

            const responseData = err.response?.data;

            if (responseData) {
                setQuizError(JSON.stringify(responseData));
            } else {
                setQuizError("Unable to generate quiz.");
            }

        } finally {
            setGeneratingQuizId(null);
        }
    };

    // Allows React to execute code after rendering a component
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

        if(!title.trim()){
            setError("Please enter a docuement title.")
            return;
        }

        if(!subject){
            setError("Please select a subject")
            return;
        }



        // FormData allows us to send file through HTTP
        const formData = new FormData();
        
        formData.append("title", title);
        formData.append("subject", subject);
        formData.append("file", file);

        setMessage("");
        setError("");
        setLoading(true);

        try{
            await api.post("documents/", formData);

            setMessage("Document uploaded successfully!");
            await fetchDocuments();

            event.target.reset();

            setTitle("");
            setSubject("");
            setFile("");

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

                    {!loadingDocuments && documents.length === 0 && (
                        <p>You haven't uploaded any documents yet.</p>
                    )}

                    <div className="documents-list">

                        {documents.map((document) => (
                          <div className="document-card" key={document.id}>

                            <div className="document-info">
                                <h3>{document.title}</h3>
                                
                                {/* Subject Badge 
                                    The className dynamically creates a CSS class based on the subject
                                */}
                                <span className={`subject-badge subject-${(document.subject || "Other")
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")}`}
                                >
                                    {document.subject || "Other"}

                                </span>

                                <p>
                                    Uploaded:{" "}
                                    {new Date(document.uploaded_at).toLocaleDateString()}
                                </p>

                            </div>

                            <div className="document-actions">
                                <span className="document-status">
                                    Ready
                                </span>
                                <button className="generate-quiz-button" onClick={() => handleGenerateQuiz(document.id)}
                                    disabled={generatingQuizId !== null}>
                                        {generatingQuizId === document.id
                                                ? "Generating..." : "Generate Quiz"}
                                </button>

                                        {quizError && (
                                                <p className="quiz-error">{quizError}</p>
                                            )}
                            </div>

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

                    {/* Document Title */}
                    <label htmlFor="document-title">
                        Document Title
                    </label>

                    <input
                        id="document-title"
                        type="text"
                        placeholder="Example: Chapter 1 - Cell Structure"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                    />

                    {/* Subject Dropdown */}
                    <label htmlFor="document-subject">
                        Subject
                    </label>

                    <select
                        id="document-subject"
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        required
                    >
                        <option value="">Select a subject</option>
                        <option value="Biology">Biology</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="History">History</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Physics">Physics</option>
                        <option value="Other">Other</option>
                    </select>


                    {/* This is the section where you select the file */}
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