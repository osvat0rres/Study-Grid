import React, {useState} from "react";
import { registerUser  } from "../../auth";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

function Register() {

    // Inital state of  variables
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    })

    const navigate = useNavigate()

    // This stores a message when registration succeeds
    const [message, setMessage] = useState("");
    //Return an error by the backend
    const [error, setError] = useState("");
    // This tells React wether the registration request is currently running
    // This is created to prevent users from repeatedly clicking the 
    // registration button while django proccess their request
    const [loading, setLoading] = useState(false);


    //This function is use to prevent users from repeatdly clicking the registration
    // button while Django proccess their request

    /*
        Why do we use ...formData inside handle change?
        it prevents existing form values while updating the field that changed
        The spread operator copies the exiting form data so changing the email
        doesn't erase the username or password
    */
    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name] : event.target.value,
        });
    };

    // This is where the registration actually happens
    const handleSubmit = async (event) => {
        // prevents the browser from refreshing 
        event.preventDefault();

        //Clear any old messages and tell React that registration is now procesging
        setMessage("");
        setError("");
        setLoading(true);

        try{
            //This tells JavaScript to wait for registration request to finish before continuing 
            await registerUser(formData);

            /* 
            if Django successfully creates the account
            1. displys a success message
            2. We clear the input field
            */ 
            setMessage("Account create successfully!");
            setFormData({
                username: "",
                email: "",
                password: "",
            });
            //If the request fails, JavaScript catches the error
        } catch(err){
            const responseData = err.response?.data;

            // This code converst Djnago's error reponse into a readable message
            if(responseData){
                const errorMessages = Object.entries(responseData)
                    .map(([field, message]) => {
                        const details = Array.isArray(message)
                            ? message.join(" ") : String(message);
                        return `${field}: ${details}`;
                    })
                    .join(" ");
                setError(errorMessages); 
            }else{
                setError("Unable to connect to the server.");
            }
            //This return whether the request succeeds or fails
        }finally{
            setLoading(false);
        }
    };
     return (
    <main className="auth-container">

        {/* Left colored section */}
        <section className="auth-left">

            <div className="brand">
                <h1>Study-Grid</h1>
                <span>AI-Powered Learning</span>
            </div>

            <div className="welcome-content">
                <h2>Study Smarter.<br />Learn Better.</h2>

                <p>
                    Transform your study notes into personalized
                    quizzes and take your learning to the next level.
                </p>

                <div className="feature">
                    <span>✦</span>
                    <p>Generate quizzes with AI</p>
                </div>

                <div className="feature">
                    <span>✦</span>
                    <p>Upload your own study notes</p>
                </div>

                <div className="feature">
                    <span>✦</span>
                    <p>Track your learning progress</p>
                </div>
            </div>

            <div className="left-footer">
                Your learning journey starts here.
            </div>

        </section>

        {/* Right registration section */}
        <section className="auth-right">

            <div className="register-form">

                <h2>Create Account</h2>
                <p className="form-description">
                    Sign up to get started with Study-Grid.
                </p>

                {message && (
                    <p className="success-message">{message}</p>
                )}

                {error && (
                    <p className="error-message">{error}</p>
                )}

                <form onSubmit={handleSubmit}>

                    <label>Username</label>
                    <input type="text" name="username" value={formData.username}
                        onChange={handleChange} placeholder="Enter your username" required/>

                    <label>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                        placeholder="Enter your email" required />

                    <label>Password</label>
                    <input
                        type="password" name="password" value={formData.password}
                        onChange={handleChange} placeholder="Create a password" minLength={8} register />
                    <button type="submit" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                </form>
                    <p className="login-text">
                        Already have an account? {" "} 
                        <span onClick={() => navigate("/login")}>login</span>
                    </p>
    
             

            </div>

        </section>

    </main>
);
}

export default Register;