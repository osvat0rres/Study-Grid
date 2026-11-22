import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser, getCurrentUser } from "../../auth";
import "./dashboard.css";
import api from "../../api";

function Dashboard() {
    /* Hook that allows to naviaget from one page to another programmatically
        without needing the user to click a regular link 
    */
   const navigate = useNavigate(); 

   //Store the logged-in users's information
   const [user, setUser] = useState(null);

   //Track whether the user information is loading
   const [loading, setLoading] = useState(true);

   // Stores the user's quiz history
   const [quizAttempts, setQuizAttempts] = useState([]);

   // Stores the user's uploaded documenst
   const [documents, setDocuments] = useState([]);

   //Tracks whether the statistics are still loading
   const [statsLoading, setStateLoading] = useState(true);


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


   // Fetch quiz attempts and uploaded documents
   useEffect(() => {
    const fetchDashboardStats = async () => {
        try {
            // Get quiz history
            const quizResponse = await api.get("quizzes/history/");

            const quizData = quizResponse.data;

            setQuizAttempts(
                Array.isArray(quizData) ? quizData : quizData.results || []
            );
            // Get uploaded documents
            const documentResponse = await api.get("documents/");

            const documentData = documentResponse.data;

            setDocuments(
                Array.isArray(documentData)
                    ? documentData : documentData.results || []
            );
        }catch (error){
            console.error("Error loading dashboard statistics:", error);
        }finally{
            setStateLoading(false);
        }
    };
    fetchDashboardStats();
   }, []);

    // Count how many quiz attempts the user has completed
    const totalQuizzes = quizAttempts.length;

    // Counts uploaded documents
    const totalDocuments = documents.length;

    // Adds all quiz percentages and divides by the number of attempts
    const averageScore = totalQuizzes > 0
        ? quizAttempts.reduce(
            (total, attempt) => total + Number(attempt.percentage),
            0
        ) / totalQuizzes
        : 0;


    const highestScore = totalQuizzes > 0
        ? Math.max(
            ...quizAttempts.map(attempt => Number(attempt.percentage))
        )
        : 0;


    // Get the 3 most recent quiz attempts
    const recentQuizzes = [...quizAttempts]
        .sort(
            (a, b) =>
                new Date(b.completed_at) - new Date(a.completed_at)
        )
        .slice(0, 3);

  

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

                {/* Dashboard Statistics */}
                <section className="dashboard-stats">

                    <div className="stat-card">
                        <h3>Quizz Completed</h3>
                        <p>
                            {statsLoading ? "..." : totalQuizzes}
                        </p>
                    </div>

                    <div className="stat-card">
                        <h3>Average Score</h3>
                        <p>
                            {statsLoading? "..." : `${averageScore.toFixed(1)}%`}
                        </p>
                    </div>

                    <div className="stat-card">
                        <h3>Highest Score</h3>
                        <p>
                            {statsLoading ? "..." : `${highestScore.toFixed(1)}%`}
                        </p>
                    </div>

                    <div className="stat-card">
                        <h3>Documents Uploaded</h3>
                        <p>
                            {statsLoading? "..." : totalDocuments}
                        </p>

                    </div>
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

                {/* Recent Quiz Activity */}
                <section className="recent-activity">

                    <div className="recent-activity-header">
                        <h2>Recent Quiz Activity</h2>

                        <Link to="/quiz-history">
                            View All →
                        </Link>
                    </div>

                    {statsLoading ? (
                        <p>Loading recent quizzes...</p>
                    ) : recentQuizzes.length === 0 ? (
                        <p className="no-activity">
                            You haven't completed any quizzes yet.
                        </p>
                    ) : (
                        <div className="recent-quiz-list">

                            {recentQuizzes.map(attempt => {

                                const percentage = Number(attempt.percentage);

                                const scoreClass = percentage >= 80 
                                    ? "hight" : percentage > 50 ? "medium"
                                    : "low";

                                return (
                                    <div className="recent-quiz-card" key={attempt.id}>

                                        <div className="recent-quiz-info">
                                            <h3>
                                                {attempt.quiz_title || `Quiz #${attempt.quiz}`}
                                            </h3>

                                            <p>
                                                Completed:{" "}
                                                {new Date(attempt.completed_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="recent-quiz-actions">

                                            <span className={`score-badge ${scoreClass}`}>
                                                {percentage.toFixed(1)}%
                                            </span>

                                            <Link to={`/quiz-review/${attempt.id}`}>
                                                Review Quiz →
                                            </Link>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    )}

                </section>

            </main>
        </div>
    );
};

export default Dashboard;