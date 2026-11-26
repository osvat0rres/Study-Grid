import React from "react";
import { Link  } from "react-router-dom";
import "./home.css";

function Home(){
    
    return(
        <main className="home-navbar">
            {/* Navigation */}
            <nav className="home-navbar">
                <Link to="/" className="home-logo">
                    <span className="logo-icon">S</span>
                    Study-Grid
                </Link>

                <div className="nav-links">
                    <a href="#feature">Feature</a>
                    <a href="#how-it-workd">How it Work</a>
                </div>

                <div className="nav-link">
                    <Link to="/login" className="login-link">Login</Link>
                    <Link to="/register" className="register-buttons">Register</Link>
                </div>
            </nav>

           {/* Hero Section */}
            <section className="hero-section">

                <div className="hero-content">

                    <span className="hero-label">
                        AI-POWERED LEARNING
                    </span>

                    <h1>
                        Study Smarter.
                        <span> Learn Faster.</span>
                    </h1>

                    <p>
                        Turn your study notes into interactive
                        AI-generated quizzes and track your
                        learning progress with Study-Grid.
                    </p>

                    <div className="hero-buttons">
                        <Link to="/register" className="hero-primary-button">
                            Get Started Free →
                        </Link>

                        <a href="#features" className="hero-secondary-button">
                            Explore Features
                        </a>
                    </div>

                </div>

                <div className="hero-visual">
                    <div className="hero-card">
                        <span>AI QUIZ GENERATOR</span>

                        <h3>Biology Chapter 1</h3>

                        <p>Generating your practice quiz...</p>

                        <div className="progress-track">
                            <div className="progress-fill"></div>
                        </div>

                        <div className="hero-card-footer">
                            <span>Creating questions</span>
                            <strong>75%</strong>
                        </div>
                    </div>
                </div>

            </section>

        </main>
    );
}

export default Home;