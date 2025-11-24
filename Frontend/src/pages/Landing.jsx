import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/common/Navbar";
import {
  ChevronRight,
  Brain,
  BookOpen,
  BarChart3,
  MessageCircle,
  Star,
  ArrowRight,
  Sparkles,
  Users,
  Trophy,
  Clock,
  Shield,
} from "lucide-react";
import Footer from "../Components/common/Footer";

const StudyAILanding = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Quizzes",
      description:
        "Personalized quizzes that adapt to your learning pace and identify knowledge gaps instantly.",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Smart Study Materials",
      description:
        "AI-curated content tailored to your curriculum and learning style for maximum retention.",
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "24/7 AI Assistant",
      description:
        "Get instant answers to your questions and explanations that make complex topics simple.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Progress Dashboard",
      description:
        "Track your learning journey with detailed analytics and personalized insights.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Medical Student",
      content:
        "Study AI helped me ace my MCAT prep. The personalized quizzes were a game-changer!",
      rating: 5,
      avatar: "👩‍⚕️",
    },
    {
      name: "Marcus Johnson",
      role: "Computer Science Major",
      content:
        "The AI assistant explains complex algorithms better than my professors. Absolutely love it!",
      rating: 5,
      avatar: "👨‍💻",
    },
    {
      name: "Emily Rodriguez",
      role: "High School Student",
      content:
        "My grades improved by 20% after using Study AI. The progress tracking keeps me motivated!",
      rating: 5,
      avatar: "👩‍🎓",
    },
  ];

  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: "50K+",
      label: "Active Students",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      value: "95%",
      label: "Success Rate",
    },
    { icon: <Clock className="w-6 h-6" />, value: "24/7", label: "AI Support" },
    { icon: <Star className="w-6 h-6" />, value: "4.9", label: "User Rating" },
  ];

  // Custom smooth scroll handler for slower, smoother scroll
  const handleNavScroll = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    const startY = window.scrollY;
    const endY = target.getBoundingClientRect().top + window.scrollY;
    const duration = 900; // ms, increase for slower scroll
    let startTime = null;

    function scrollStep(currentTime) {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const ease =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress; // easeInOut
      window.scrollTo(0, startY + (endY - startY) * ease);
      if (progress < 1) {
        window.requestAnimationFrame(scrollStep);
      }
    }

    window.requestAnimationFrame(scrollStep);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 overflow-hidden flex flex-col pt-16">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div
            className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
            style={{
              left: mousePosition.x / 20,
              top: mousePosition.y / 20,
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-2xl animate-bounce"
            style={{ animationDuration: "3s" }}
          />
          <div
            className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl animate-pulse"
            style={{ animationDuration: "4s" }}
          />
        </div>

        {/* Hero Section */}
        <section className="relative z-10 px-6 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <div
              className={`transition-all duration-1000 delay-200 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200/50 mb-8 group hover:bg-white/90 transition-all duration-300">
                <Sparkles className="w-4 h-4 text-purple-600 mr-2 group-hover:animate-spin" />
                <span className="text-sm font-medium text-gray-700">
                  Powered by Advanced AI Technology
                </span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Learn Smarter,
                <br />
                <span className="relative">
                  Not Harder
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Transform your study experience with AI-powered personalized
                learning that adapts to your pace and maximizes your potential.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/signup"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/login"
                  className="group px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-2xl font-semibold text-lg border border-gray-200/50 hover:bg-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="flex items-center">
                    Sign In
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 px-6 py-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/80 transition-all duration-300 hover:scale-105 opacity-100 translate-y-0`}
                  style={{}}
                >
                  <div
                    style={{
                      transitionDelay: isVisible
                        ? `${index * 100 + 400}ms`
                        : undefined,
                      transitionProperty: "opacity, transform",
                      transitionDuration: "1000ms",
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible
                        ? "translateY(0)"
                        : "translateY(32px)",
                    }}
                  >
                    <div className="text-blue-600 flex justify-center mb-2">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 px-6 py-20" id="features">
          <div className="max-w-7xl mx-auto">
            <div
              className={`text-center mb-16 transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Supercharge Your Learning
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover powerful AI-driven features designed to accelerate your
                academic success
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={
                    `group p-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 hover:bg-white/90 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:scale-105 opacity-100 translate-y-0` // always instant on hover
                  }
                  style={{}}
                >
                  <div
                    style={{
                      transitionDelay: isVisible
                        ? `${index * 150 + 600}ms`
                        : undefined,
                      transitionProperty: "opacity, transform",
                      transitionDuration: "1000ms",
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible
                        ? "translateY(0)"
                        : "translateY(32px)",
                    }}
                  >
                    <div className="text-blue-600 mb-4 group-hover:text-purple-600 transition-colors duration-300 group-hover:scale-110 transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative z-10 px-6 py-20" id="testimonials">
          <div className="max-w-7xl mx-auto">
            <div
              className={`text-center mb-16 transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Success Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of students who've transformed their learning
                journey with Study AI
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`group p-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 hover:bg-white/90 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:scale-105 opacity-100 translate-y-0`}
                  style={{}}
                >
                  <div
                    style={{
                      transitionDelay: isVisible
                        ? `${index * 150 + 800}ms`
                        : undefined,
                      transitionProperty: "opacity, transform",
                      transitionDuration: "1000ms",
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible
                        ? "translateY(0)"
                        : "translateY(32px)",
                    }}
                  >
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">{testimonial.avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 px-6 py-20" id="contact">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className={`p-12 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join Study AI today and experience the future of personalized
                education
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="group px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    Start Learning Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
                <a
                  href="#about"
                  className="group px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-semibold text-lg border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* User Type Selection Section */}
        <section className="relative z-10 px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className={`transition-all duration-1000 delay-400 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Choose Your Experience
              </h2>
              <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
                Select the platform that best fits your role and start your
                journey
              </p>

              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Regular User Panel */}
                <div className="group p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 hover:bg-white/90 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Student Portal
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Access AI-powered quizzes, study materials, and personalized
                    learning tools designed for students.
                  </p>
                  <div className="space-y-3">
                    <Link
                      to="/signup"
                      className="block w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-300"
                    >
                      Join as Student
                    </Link>
                    <Link
                      to="/login"
                      className="block w-full px-6 py-3 bg-white text-blue-600 border-2 border-blue-200 rounded-xl font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                    >
                      Student Login
                    </Link>
                  </div>
                </div>

                {/* Admin Panel */}
                <div className="group p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 hover:bg-white/90 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Admin Panel
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Manage users, content, analytics, and system administration
                    with comprehensive admin tools.
                  </p>
                  <div className="space-y-3">
                    <a
                      href="https://study-monk-admin-frontend.onrender.com/signup"
                      className="block w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300"
                    >
                      Admin Registration
                    </a>
                    <a
                      href="https://study-monk-admin-frontend.onrender.com"
                      className="block w-full px-6 py-3 bg-white text-purple-600 border-2 border-purple-200 rounded-xl font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                    >
                      Admin Login
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default StudyAILanding;
