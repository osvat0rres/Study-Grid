import React, { useState, useEffect} from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import "./quiz.css";

function QuizPage() {

    const { quizId } = useParams();

    const [quiz, setQuiz ] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [answers, setAnswers] = useState({});
    const [submit, setSubmit] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            try{
                const response = await api.get(`quizzes/${quizId}/`);
                setQuiz(response.data)
            }catch (err){
                console.error("Error loading the quiz", err);
                setError("Unable to load this quiz")
            }finally{
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
    }

    const handleSubmit = () => {
        const unanswered = quiz.questions.filter(
            (question) => answers[question.id] === undefined
        );

        if (unanswered.lenght > 0){
            alert(`Please annser all questions.${unanswered.lenght} remaining.`);
            return;
        }

        let correctAanswer = 0;

        quiz.questions.forEach((question) => {
            const selectedChoice = question.choices.find(
                (choice) => choice.id === answers[question.id]
            );
            
            if (selectedChoice?.is_correct){
                correctAanswer++;
            }
        });

        const handleRetake = () => {
            setAnswers({});
            setScore(0);
            setSubmit(false);
        }
    };

    if (loading) return <p>Loading quiz...</p>;
    if (error) return <p>{error}</p>;
    if (!quiz) return  <p>Quiz not found.</p>

    const percenatage = Math.round((score / quiz.question.lenght) * 100);
    return (
        <>
        </>
    ); 
}

export default QuizPage;