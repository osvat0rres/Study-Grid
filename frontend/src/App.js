
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Documents from "./components/documents/Documents";
import QuizPage from "./components/quizzes/QuizPage";
import QuizHistory from "./components/quizzes/QuizHistory";
import QuizReview from "./components/quizzes/QuizReview";
import Home from "./components/home/Home";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public pages. Anyone can access them */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} /> 

                {/* Protected Links. Only work when you are login */}
                <Route path="/dashboard" element={<ProtectedRoute> <Dashboard/> </ProtectedRoute>} />
                <Route path="/documents" element={<ProtectedRoute> <Documents />  </ProtectedRoute>} />
                <Route path="/quiz/:quizId" element={<ProtectedRoute> <QuizPage/> </ProtectedRoute>}/>
                <Route path="/quiz-history" element={<ProtectedRoute> <QuizHistory/> </ProtectedRoute>} />
                <Route path="/quiz-review/:attemptId" element={<ProtectedRoute> <QuizReview/> </ProtectedRoute>} /> 
            </Routes>
        </BrowserRouter>
    );
}

export default App;