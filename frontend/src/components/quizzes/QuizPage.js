
/*
    useEffect: runs the code when the component loads or when certain values change
    useState: Stors information while the page is running
    useParams: reads pramater from the URL
*/

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import "./quiz.css";

function QuizPage() {
    const { quizId } = useParams();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // Stores the answer selected by the user
    const [answers, setAnswers] = useState({});
    // Determines wheather the quiz has been submitted
    const [submitted, setSubmitted] = useState(false);
    // Store the number of correct answers
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                // Retrives the quiz from Djabo using a GET request
                const response = await api.get(`quizzes/${quizId}/`);
                // Stores the reponse
                setQuiz(response.data);

            // If Django returns an error, this code executes
            } catch (err) {
                console.error("Error loading quiz:", err);
                setError("Unable to load this quiz.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    // This is where we store the students selections
    const handleAnswerChange = (questionId, choiceId) => {
        /*
            questionId: which question the students is answering
            choiceId: which anser the student selected
         */
        setAnswers((previousAnswers) => ({
            // contains the answers the student previously selected
            // The spread operator copies aLL previous answers into an object
            ...previousAnswers,
            
            // Adds or updated the answer for the current question
            [questionId]: choiceId,
        }));
    };

    // Submit and grade the quiz.
    const handleSubmit = () => {
        // This finds unanswered question
        const unanswered = quiz.questions.filter(
            (question) => answers[question.id] === undefined
        );

        // This prevents submission if any questions are unanaswered
        if (unanswered.length > 0) {
            alert(`Please answer all questions. ${unanswered.length} remaining.`);
            return;
        }

        // initialuze the score, is set to zero because the quiz has not been grade it yet
        let correctAnswers = 0;

        // if the quiz conatans fice questions, the loop executes five time
        quiz.questions.forEach((question) => {
            /*
                The .find() method searches an array and retursn the first element
                matching the condition
            */
            const selectedChoice = question.choices.find(
                (choice) => choice.id === answers[question.id]
            );

            // Check if the anser is correct

            /* The ?. is called optional chaining 
                optional chnaging sefely access nested object propertirs or method by returning 
                undefined instead of throwing an error when a reference is null or undefined
            */
            if (selectedChoice?.is_correct) {
                // if the answer is correct this increases the score by one
                correctAnswers++;
            }
        });

        // Give the final score
        setScore(correctAnswers);
        setSubmitted(true);
    };

    // Retake the quiz.
    const handleRetake = () => {
        // removes all the slected answers
        setAnswers({});
        // reset the score to 0
        setScore(0);

        // returns the quiz mode
        setSubmitted(false);
    };

    // Handles the loading screen
    if (loading) return <p>Loading quiz...</p>;
    if (error) return <p>{error}</p>;
    if (!quiz) return <p>Quiz not found.</p>;

    // This calculates the percentange
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
        <div className="quiz-page">
            <h1>{quiz.title}</h1>

            {/* Display quiz mode or result mode
                if the quiz has been summited, it shows the result if not shows steh quizz instructions  */}
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

            {/* displayings the questions with map()  */}
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

                         {/* Shows the correct option and explaniation  */}
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

            {/* Submit and retake buttons */}
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
