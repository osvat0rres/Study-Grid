
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Documents from "./components/documents/Documents";
import QuizPage from "./components/quizzes/QuizPage";
import QuizHistory from "./components/quizzes/QuizHistory";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute> <Dashboard/> </ProtectedRoute>} />
                <Route path="/documents" element={<ProtectedRoute> <Documents />  </ProtectedRoute>} />
                <Route path="/quiz/:quizId" element={<ProtectedRoute> <QuizPage/> </ProtectedRoute>}/>
                <Route path="/quiz-history" element={<ProtectedRoute> <QuizHistory/> </ProtectedRoute>} />
                <Route path="/" element={<Navigate to="/register" />} /> 
            </Routes>
        </BrowserRouter>
    );
}

export default App;