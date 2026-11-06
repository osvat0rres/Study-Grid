import React, { useState, useEffect } from "react";

/*
The useParams Hook allows you to access dynamic values from the URL In
React Router. It helps render content based on route paramters like /user/:id
*/
import { useParams, Link } from "react-router-dom";
import api from "../../api";

function QuizPage(){
    const { quizid } = useParams();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchQuiz = async() => {
            try{
                const reposonse = await api.get(`quizzes/${quizid}/`);
                setQuiz(reposonse.data);
            }catch(err){
                console.error("Error loading the quiz:", err);
                setError("Unable to load quiz");
            }finally{
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizid]);

    if (loading){
        return <p>Loading quiz...</p>;
    }

    if (error){
        return <p>{error}</p>;
    }

    return(
        <main className="quiz-page">
            <h1>{quiz.title}</h1>

            <p>
                Questions: {quiz.questions.length}
            </p>

            {quiz.questions.map((question, index) => (
                <div key={question.id} className="quiz-question">
                    <h3>
                        {index + 1}. {question.question_text}
                    </h3>

                    {question.choices.map((choice, choiceIndex) => (
                        <p key={choiceIndex}>
                            {choice}
                        </p>
                    ))}
                </div>
            ))}

            <Link to="/documents">
                Back to Documents
            </Link>
        </main>
    );
}

export default QuizPage;