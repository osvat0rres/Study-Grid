import React, { useState, useEffect } from "react";
import api from "../../api";

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

    //Display laoding meassage
    if (loading){
        return <p>Loading quiz history...</p>;
    }
    
    // Display error message
    if(error){
        return<p>{error}</p>
    }

    if(attempt.length === 0){
        return <p>You haven't completed any quizzes yet.</p>;
    }
    return(
        <section>
            <h1>Quiz History</h1>

            {/* Displays multiple attempst
                map() loops throught every attempt and creates section for it
            
            */}
            {attempt.map((attempt) => (
                <div key={attempt.id}>
                    <h3>Quiz ID:{attempt.quiz_title}</h3>

                    <p>Score: {attempt.score} / {attempt.total_questions}</p>

                    <p>Percentage: {attempt.percentage}%</p>

                    <p>Completed at: {new Date(attempt.completed_at).toLocaleDateString()}</p>

                </div>
            ))}
        </section>  
    );
}

export default QuizHistory;