import React, {useState} from "react";
import { registerUser  } from "../../auth";

function Register() {

    // Inital state of  variables


    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    })

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
    return(
        <main className="auth-container">
            <section className="auth-card">
                <h2>Create Your account</h2>
                <p>Join Study-Grid and start studyinh smarter</p>

                {message && (
                    <p className="success-message">{message}</p>
                )}

                {error && (
                    <p className="error-message">{error}</p>
                )}

                <form onSubmit ={handleSubmit}>
                    <label>Username</label>
                    <input type="text" name="username" value={formData.username}
                        onChange={handleChange} placeholder="Enter username" required/>

                    <label>Email</label>
                    <input type="email" name="email" value={formData.email}
                    onChange={handleChange} placeholder="Enter your Email" required/>

                    <label>Password</label>
                    <input type="password" name="password" value={formData.password}
                    onChange={handleChange} placeholder="Enter your password" minLength={8} required />

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating Account..." : "Register"}
                    </button>


                </form>

                
            </section>
        </main>
    );
}

export default Register;