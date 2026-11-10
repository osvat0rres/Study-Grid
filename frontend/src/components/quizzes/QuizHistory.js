import React, { useState, useEffect } from "react";
import api from "../../api";

function QuizHistory() {

    // Stores the quiz attempts returned by Django
    const [attempts, setAttempts] = useState([]);

    //Control the loading message
    const [loading, setLoading] = useState(true);

    //Stores an error if the request fails
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try{
                const response = await api.await.get("quizzes/history/");

                //Stores the quiz attemps in React state
                setAttempts(response.data);

            }catch (err){
                console.error("Error fetching quiz history:", err);
                setError("Unable to load quiz history");
            }finally{
                setLoading(false);
            }
        };
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

    if(attempts.length === 0){
        return <p>You haven't completed any quizzes yet.</p>;
    }
    return(
        <>
        </>
    );
}

export default QuizHistory;