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

             {/* Features Section */}
            <section className="features-section" id="features">

                <div className="section-heading">
                    <span>FEATURES</span>
                    <h2>Everything you need to study smarter.</h2>
                    <p>
                        A better way to organize your study materials
                        and prepare for exams.
                    </p>
                </div>

                <div className="features-grid">

                    <div className="feature-card">
                        <span>📁</span>
                        <h3>Upload Study Notes</h3>
                        <p>
                            Upload PDF and TXT files containing
                            your study materials.
                        </p>
                    </div>

                    <div className="feature-card">
                        <span>🧠</span>
                        <h3>AI Quiz Generation</h3>
                        <p>
                            Transform your notes into multiple-choice
                            practice questions.
                        </p>
                    </div>

                    <div className="feature-card">
                        <span>📊</span>
                        <h3>Track Your Progress</h3>
                        <p>
                            Monitor your quiz scores and see how
                            your performance improves.
                        </p>
                    </div>

                    <div className="feature-card">
                        <span>📚</span>
                        <h3>Organize Subjects</h3>
                        <p>
                            Keep your study documents organized
                            by subject.
                        </p>
                    </div>

                </div>

            </section>

            {/* How It Works */}
            <section className="how-section" id="how-it-works">

                <div className="section-heading">
                    <span>HOW IT WORKS</span>
                    <h2>Three steps to smarter studying.</h2>
                </div>

                <div className="steps-grid">

                    <div className="step-card">
                        <span>01</span>
                        <h3>Upload Your Notes</h3>
                        <p>
                            Choose a PDF or TXT file containing
                            your study material.
                        </p>
                    </div>

                    <div className="step-card">
                        <span>02</span>
                        <h3>Generate a Quiz</h3>
                        <p>
                            Let AI create practice questions
                            based on your notes.
                        </p>
                    </div>

                    <div className="step-card">
                        <span>03</span>
                        <h3>Track Your Progress</h3>
                        <p>
                            Complete quizzes, review answers,
                            and monitor your results.
                        </p>
                    </div>

                </div>

            </section>

            {/* Call To Action */}
            <section className="cta-section">
                <h2>Ready to transform the way you study?</h2>

                <p>
                    Start turning your notes into knowledge today.
                </p>

                <Link to="/register">
                    Create Your Free Account →
                </Link>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <h3>Study-Grid</h3>
                <p>Study Smarter. Learn Faster.</p>
                <p>© 2026 Study-Grid. All rights reserved.</p>
            </footer>


        </main>
    );
}

export default Home;