
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import "./quizReview.css";

function QuizReview() {
    const { attemptId } = useParams();

    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const response = await api.get(
                    `quizzes/attempts/${attemptId}/review/`
                );

                console.log("Quiz Review:", response.data);
                setReview(response.data);
            } catch (err) {
                console.error("Error loading quiz review:", err);
                setError("Unable to load quiz review.");
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [attemptId]);

    if (loading) {
        return <p>Loading quiz review...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!review) {
        return <p>Quiz review not found.</p>;
    }

    return (
        <div className="quiz-review-container">

            <div className="quiz-review-header">
                <Link to="/quiz-history" className="review-back-button">
                    ← Back to Quiz History
                </Link>

                <h1>{review.quiz_title}</h1>

                <div className="review-score">
                    <h2>
                        {review.score} / {review.total_questions}
                    </h2>

                    <p>{Math.round(review.percentage)}%</p>
                </div>
            </div>

            <div className="review-questions">

                {(review.answers || []).map((answer, index) => (
                    <div
                        key={answer.id}
                        className="review-question-card"
                    >

                        <h3>
                            Question {index + 1}
                        </h3>

                        <p className="review-question-text">
                            {answer.question_text}
                        </p>

                        <div className="review-answer">
                            <strong>Your Answer:</strong>

                            <p>{answer.selected_answer}</p>
                        </div>

                        <div className="review-correct-answer">
                            <strong>Correct Answer:</strong>

                            <p>{answer.correct_answer}</p>
                        </div>

                        <div className="review-explanation">
                            <strong>Explanation:</strong>

                            <p>{answer.explanation}</p>
                        </div>

                        <div
                            className={
                                answer.is_correct
                                    ? "review-result correct"
                                    : "review-result incorrect"
                            }
                        >
                            {answer.is_correct
                                ? "✓ Correct"
                                : "✗ Incorrect"}
                        </div>

                    </div>
                ))}

            </div>

            <Link to="/dashboard" className="review-dashboard-button">
                Back to Dashboard
            </Link>

        </div>
    );
}

export default QuizReview;