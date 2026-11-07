
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import "./quiz.css";

function QuizPage() {
    const { quizId } = useParams();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

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

    const handleAnswerChange = (questionId, choiceId) => {
        setAnswers((previousAnswers) => ({
            ...previousAnswers,
            [questionId]: choiceId,
        }));
    };

    // Submit and grade the quiz.
    const handleSubmit = () => {
        const unanswered = quiz.questions.filter(
            (question) => answers[question.id] === undefined
        );

        if (unanswered.length > 0) {
            alert(`Please answer all questions. ${unanswered.length} remaining.`);
            return;
        }

        let correctAnswers = 0;

        quiz.questions.forEach((question) => {
            const selectedChoice = question.choices.find(
                (choice) => choice.id === answers[question.id]
            );

            if (selectedChoice?.is_correct) {
                correctAnswers++;
            }
        });

        setScore(correctAnswers);
        setSubmitted(true);
    };

    // Retake the quiz.
    const handleRetake = () => {
        setAnswers({});
        setScore(0);
        setSubmitted(false);
    };

    if (loading) return <p>Loading quiz...</p>;
    if (error) return <p>{error}</p>;
    if (!quiz) return <p>Quiz not found.</p>;

    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
        <div className="quiz-page">
            <h1>{quiz.title}</h1>

            {!submitted ? (
                <p>Questions: {quiz.questions.length} | Select one answer per question.</p>
            ) : (
                <div className="quiz-results">
                    <h2>Quiz Results</h2>
                    <p className="quiz-score">
                        {score} / {quiz.questions.length}
                    </p>
                    <p className="quiz-percentage">{percentage}%</p>
                    <p>
                        {percentage >= 80
                            ? "Excellent work!"
                            : percentage >= 60
                            ? "Good job! Keep practicing."
                            : "Keep studying and try again!"}
                    </p>
                </div>
            )}

            {quiz.questions.map((question, index) => {
                const selectedChoice = question.choices.find(
                    (choice) => choice.id === answers[question.id]
                );

                return (
                    <div key={question.id} className="quiz-question">
                        <h3>
                            {index + 1}. {question.question_text}
                        </h3>

                        {question.choices.map((choice) => {
                            let choiceClass = "quiz-choice";

                            if (submitted && choice.is_correct) {
                                choiceClass += " correct-answer";
                            } else if (
                                submitted &&
                                selectedChoice?.id === choice.id &&
                                !choice.is_correct
                            ) {
                                choiceClass += " incorrect-answer";
                            }

                            return (
                                <label key={choice.id} className={choiceClass}>
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={choice.id}
                                        checked={answers[question.id] === choice.id}
                                        disabled={submitted}
                                        onChange={() =>
                                            handleAnswerChange(question.id, choice.id)
                                        }
                                    />

                                    {choice.choice_text}
                                </label>
                            );
                        })}

                        {submitted && (
                            <div className="question-feedback">
                                <p>
                                    <strong>Your answer:</strong>{" "}
                                    {selectedChoice?.choice_text}
                                </p>

                                <p>
                                    <strong>Correct answer:</strong>{" "}
                                    {question.choices.find(
                                        (choice) => choice.is_correct
                                    )?.choice_text}
                                </p>

                                <p>
                                    <strong>Explanation:</strong>{" "}
                                    {question.explanation}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}

            {!submitted ? (
                <button className="submit-quiz-btn" onClick={handleSubmit}>
                    Submit Quiz
                </button>
            ) : (
                <button className="submit-quiz-btn" onClick={handleRetake}>
                    Retake Quiz
                </button>
            )}

            <br />

            <Link to="/documents">
                Back to Documents
            </Link>
        </div>
    );
}

export default QuizPage;