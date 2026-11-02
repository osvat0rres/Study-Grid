import React, { useState } from "react";
import { loginUser } from "../../auth";
import { Link, useNavigate } from "react-router-dom";

function Login() {

    // Stores the username and password entered by the user 
    const [formData, setFormData] = useState({
        usename:"",
        password:""
    });

    // Stores success and error messages
    const[error, setError] = useState("");

    // Track whether the login request is processing
    const[loading, setLoading] = useState(false);

    //Allows us to navigate to another page
    const navigate = useNavigate();

    // Updates the form whenever the user types
    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try{
            await loginUser(formData);
            
            //login successful: navigate to the dashboard
            navigate("/dashboard");
        }catch (err){
            const responseData = err.response?.data;

            if(responseData){
                setError(
                    responseData.detail || 
                    "Invalid password"
                );
            }else{
                setError("Unable to connect to the server.");
            }
        }finally{
            setLoading(false);
        }
    };
    return(
        <>
         <main className="auth-container">

            {/* Left colored section */}
            <section className="auth-left">

                <div className="brand">
                    <h1>Study-Grid</h1>
                    <span>AI-Powered Learning</span>
                </div>

                <div className="welcome-content">
                    <h2>Welcome Back.<br />Keep Learning.</h2>

                    <p>
                        Continue your learning journey.
                        Turn your study notes into quizzes
                        and strengthen your knowledge.
                    </p>

                    <div className="feature">
                        <span>✦</span>
                        <p>Generate quizzes with AI</p>
                    </div>

                    <div className="feature">
                        <span>✦</span>
                        <p>Access your study materials</p>
                    </div>

                    <div className="feature">
                        <span>✦</span>
                        <p>Track your learning progress</p>
                    </div>
                </div>

                <div className="left-footer">
                    Your learning journey continues here.
                </div>

            </section>

            {/* Right login section */}
            <section className="auth-right">

                <div className="register-form">

                    <h2>Welcome Back</h2>

                    <p className="form-description">
                        Enter your credentials to access your account.
                    </p>

                    {error && (
                        <p className="error-message">{error}</p>
                    )}

                    <form onSubmit={handleSubmit}>

                        <label>Username</label>

                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />

                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />

                        <button type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>

                    </form>

                    <p className="login-text">
                        Don't have an account?{" "}
                        <Link to="/register">Create Account</Link>
                    </p>

                </div>

            </section>

        </main>
        </>
    );
}

export default Login;