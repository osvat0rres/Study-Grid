import React, { useState, useEffect } from "react";
import { data, Link, useNavigate } from "react-router-dom";
import { logoutUser, getCurrentUser } from "../../auth";
import "./dashboard.css";
import api from "../../api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"



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

    const performanceData = [...quizAttempts]
        .sort(
            (a,b) =>
                new Date(a.completed_at) - new Date(b.completed_at)
        )
        .map((attempt, index) => ({
            quiz: `Quiz ${index + 1}`,
            score: Number(attempt.percentage),
            date: new Date(attempt.completed_at).toLocaleDateString()
        }));

  

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
                
         
                {/* Quiz Performance Chart */}
                <section className="performance-section">

                    <div className="performance-header">
                        <h2>Quiz Performance</h2>
                        <p>Track your progress over time</p>
                    </div>

                    {/* 
                        Conditional rendering. For this example we are using nested ternery operators.

                        First Condition: IF statsLoading is true, React display "Loading performance data"

                        Second Condition: If loading has finished but the arrey is empty, React displays a message 
                        asking the students to complete a quiz

                        Third Condition: If the data has loaded and at least one quiz exits, React displays the chart 

                    */}
                    {statsLoading ? (
                        <p>Loading performance data...</p>

                    ) : performanceData.length === 0 ? (
                        <p className="no-activity">
                            Complete a quiz to see your performance chart.
                        </p>

                    ) : (
                        <div className="performance-chart">

                            {/* 
                                This component makes thechart responsive
                                With out this componets the chart may not adjust correctly
                                when the browser window changes size
                            */}
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={performanceData}>

                                    {/* This creates the background grid lines */}
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                    />

                                    {/* The X-axis is the horizoantal axis at the bottom of the chart */}
                                    <XAxis
                                        dataKey="quiz"
                                        stroke="#64748b"
                                    />

                                    {/* The y-Axis is teh vertical axis on the left
                                        The domain sets the chart's minimun and maximun values */}
                                    <YAxis
                                        domain={[0, 100]}
                                        // This formats the number of the y-axis
                                        tickFormatter={(value) => `${value}%`}
                                        stroke="#64748b"
                                    />

                                    {/* the tooltip displays additional informastion when the 
                                        student moves their mouse over a chart point
                                    */}
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, "Score"]}
                                        labelFormatter={(label) => label}
                                    />

                                        {/* This is the componrnt that actually draws the line connecting the quiz scores */}
                                    <Line

                                        /*
                                            type: creates a smooth line
                                            dateKey: Uses the score property from the data
                                            stroke: sets the line color to purple
                                            strokeWidth: Sets the line thickness
                                            dot: Controls the apperance of each quiz point
                                            activaDot: Makes a point larger when hovered over
                                         */

                                        type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3}
                                        dot={{
                                            r: 5,
                                            fill: "#6366f1"
                                        }}
                                        activeDot={{
                                            r: 8
                                        }}
                                    />

                                </LineChart>
                            </ResponsiveContainer>

                        </div>
                    )}

                </section>

                    

                {/* Recent Quiz Activity */}
                <section className="recent-activity">

                    <div className="recent-activity-header">
                        <h2>Recent Quiz Activity</h2>

                        <Link to="/quiz-history">
                            View All →
                        </Link>
                    </div>

                    {/* Displays if data is still loading or if there are no quiz attempts  */}
                    {statsLoading ? (
                        <p>Loading recent quizzes...</p>
                    ) : recentQuizzes.length === 0 ? (
                        <p className="no-activity">
                            You haven't completed any quizzes yet.
                        </p>
                    ) : (
                        <div className="recent-quiz-list">

                            {/* This is how we display multiple quiz attempts
                                the map function goes throught each element in the array */}
                            {recentQuizzes.map(attempt => {

                                const percentage = Number(attempt.percentage);

                                // Displays the percentage of the score
                                const scoreClass = percentage >= 80 
                                    ? "hight" : percentage > 50 ? "medium"
                                    : "low";

                                return (
                                    <div className="recent-quiz-card" key={attempt.id}>

                                        {/* If the name of the quiz exits, then the name is display or
                                         if it does not exits, the number of the quiz is display */}
                                        <div className="recent-quiz-info">
                                            <h3>
                                                {attempt.quiz_title || `Quiz #${attempt.quiz}`}
                                            </h3>

                                            {/* This displays the completion date */}
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