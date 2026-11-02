
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "./components/auth/Register";
import Login from "./components/auth/Login";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/register" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;