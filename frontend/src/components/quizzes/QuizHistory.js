import React, { useState, useEffect } from "react";
import api from "../../api";
import { Link } from "react-router-dom";
import "./quizHistory.css";

function QuizHistory() {

    // Stores the quiz attempts returned by Django
    const [attempt, setAttempt] = useState([]);

    //Control the loading message
    const [loading, setLoading] = useState(true);

    //Stores an error if the request fails
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try{
                const response = await api.get("quizzes/history/");

                //Stores the quiz attemps in React state
                setAttempt(response.data);

            }catch (err){
                console.error("Error fetching quiz history:", err);

                console.log("Status: ", err.response?.status);
                console.log("Backend response: ", err.response?.data);

                setError(
                    err.response?.data?.detail || 
                    err.response?.data?.error ||
                    "Unable to lead quiz history."
                )
            }finally{
                setLoading(false);
            }
        };
        /*
            The empty dependency array [] means this effect runs when the component mounts.
            That means when a student opens Quiz History, React automatically request their saved 
            attempts 
         */
        fetchHistory();
    }, []);

    //Display loading meassage
    if (loading){
        return (
            <main className="quiz-history-page">
                <p className="history-loading">Loading quiz history..</p>
            </main>
        );
    }
    
    // Display error message
    if(error){
        return(
            <main className="quiz-history-page">
                <h1>Quiz History</h1>
                <p className="history-error">{error}</p>

                <Link to="/dashboard" className="history-back-button">
                    Back top Dashboard
                </Link>
            </main>
        )
    }

    if(attempt.length === 0){
        return <p>You haven't completed any quizzes yet.</p>;
    }
    return(
        <main className="quiz-history-page">
            {/* Page heading */}
            <header className="history-header">
                <div>
                    <h1>Quiz History</h1>
                    <p>Review your previous quiz attempts and score.</p>
                </div>
                <Link to="/dashboard" className="history-bakc-button">
                    ← Back to Dashboard
                </Link>
            </header>

            {/* Empty state */}
            {attempt.length === 0 ? (
                <div className="history-empty">
                    <div className="empty-icon">📚</div>
                    <h2>No quizzes completed yet</h2>
                    <p>
                        Your completed quizzes will appear here.
                        Start sutudying and take your first quiz!
                    </p>

                    <Link to="/documents" className="history-start-button">
                        Go to My Documents
                    </Link>
                </div>
            ) : (
                /* Quiz cards */
                <div className="history-grid">
                    {attempt.map((attempt) => { 
                        const percentage = Number(attempt.percentage);

                        // determine score badge color
                        const scoreClass = 
                            percentage >= 80 ? "high"
                            : percentage >= 50 ? "medium":
                            "low";
                        
                        //Format completion date
                        const completedDate = new Date(attempt.completed_at);

                        const formattedDate =
                            completedDate.toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            });
                        
                            const formattedTime =
                            completedDate.toLocaleTimeString(undefined, {
                                hour: "numeric",
                                minute: "2-digit",
                            });
                        
                          return (
                            <article className="history-card" key={attempt.id}>

                                <div className="history-card-header">
                                    <h2>{attempt.quiz_title}</h2>

                                    <span className={`score-badge ${scoreClass}`}>
                                        {Math.round(percentage)}%
                                    </span>
                                </div>

                                <div className="history-card-score">
                                    <span className="score-label">Your Score</span>

                                    <strong>
                                        {attempt.score} / {attempt.total_questions}
                                    </strong>
                                </div>

                                <div className="history-card-footer">
                                    <span>
                                        <span className="footer-icon">📅</span>
                                        {formattedDate}
                                    </span>

                                    <span>
                                        <span className="footer-icon">🕒</span>
                                        {formattedTime}
                                    </span>
                                </div>

                            </article>
                        );
                        
                        
                    })}

                </div> 
            )}
        </main>
    );
}

export default QuizHistory;