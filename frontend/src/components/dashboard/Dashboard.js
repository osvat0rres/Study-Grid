import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser, getCurrentUser } from "../../auth";
import "./dashboard.css";
function Dashboard() {
    /* Hook that allows to naviaget from one page to another programmatically
        without needing the user to click a regular link 
    */
    const navigate = useNavigate(); 

   //Store the logged-in users's information
   const [user, setUser] = useState(null);

   //Track whether the user information is loading
   const [loading, setLoading] = useState(true);

   useEffect(() =>{
    const fetchUser = async() => {
        try{
            const userData = await getCurrentUser();
            
            //save the user information in React state
            setUser(userData);
        }catch (error){
            console.error("Unable to retrive user: ", error);

            //if authentication fails, return to login
            logoutUser();
            navigate("/login");
        }finally{
            setLoading(false);
        };
    }
    fetchUser();
   },[navigate])


    //When the user logs out, it sends them to the login page
    const handleLogout = () =>{
        logoutUser();
        navigate("/login")
    }
    return(
        <div className="dashboard-container">
            
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className='dashboard-brand'>

                    <h2>Study-Grid</h2>
                    <p>Ai-Powered Learning</p>
                </div>

                <nav className="dashboard-nav">
                    <Link to="/dashboard" className="active">
                        Dashboard
                    </Link>

                    <Link to="/documents">
                        My Documents  
                    </Link>
                    
                    <Link to="/quiz-history">
                        Quiz History
                    </Link>
                </nav>

                <button className="logout-button" onClick={handleLogout}>
                    Logout

                </button>

            </aside>

            {/* Main dashboard content */}
            <main className='dashboard-main'>
                <header className='dashboard-header'>
                    <div>
                        <h1>Dashboard</h1>
                        <p>
                            {loading
                                ? "Loading your account..."
                                : `Welcome back, ${user?.username}!`}
                        </p>
                        
                    </div>

                </header>

                {/* Welcome Section */}
                <section className="dashboard-welcome">
                    <h2>Welcome {user?.username || "to Study-Grid"}!</h2>
                    <p>
                        Turn you notes into quizzes
                        and imporve your learning with AI.
                    </p>
                </section>

                {/* Dashboard cards */}
                <section className="dashboard-cards">

                    <div className="dashboard-card">
                        <h3>My Documents</h3>
                        <p>Upload and manage your study notes.</p>
                        <Link to="/documents">View Documents  → </Link>
                    </div>

                     <div className="dashboard-card">
                        <h3>Generate Quiz</h3>
                        <p>Create quizzes from your uploaded notes.</p>
                        <Link to="/documents">
                            Get Started →
                        </Link>
                    </div>

                    <div className="dashboard-card">
                        <h3>Quiz History</h3>
                        <p>Review your previously generated quizzes.</p>
                        <Link to="/quiz-history">
                            View History →
                        </Link>
                    </div>

                </section>
            </main>

        </div>
    );
};

export default Dashboard;