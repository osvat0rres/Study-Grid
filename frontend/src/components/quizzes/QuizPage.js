
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";

function QuizPage() {
    const { quizId } = useParams();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await api.get(`quizzes/${quizId}/`);
                setQuiz(response.data);
            } catch (err) {
                console.error("Error loading quiz:", err);
                setError("Unable to load this quiz.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId]);

    if (loading) {
        return <p>Loading quiz...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="quiz-page">
            <h1>{quiz.title}</h1>

            <p>
                Questions: {quiz.questions.length}
            </p>

            {quiz.questions.map((question, index) => (
                <div key={question.id} className="quiz-question">
                    <h3>
                        {index + 1}. {question.question_text}
                    </h3>

                    
                    {question.choices.map((choice) => (
                        <p key={choice.id}>
                            {choice.choice_text}
                        </p>
                    ))}
                </div>
            ))}

            <Link to="/documents">
                Back to Documents
            </Link>
        </div>
    );
}

export default QuizPage;