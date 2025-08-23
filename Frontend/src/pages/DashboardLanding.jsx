import React, { useState, useEffect } from "react";
import {
  Star,
  BookOpen,
  Brain,
  Trophy,
  TrendingUp,
  Quote,
  Sparkles,
  Target,
  Clock,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AnimatedTestimonials } from "../Components/ui/animated-testimonials";
import { SimpleTestimonials } from "../Components/ui/simple-testimonials";

const StudyAIDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get user's first name from the user object, or fallback to "User"
  const userName = user?.name ? user.name.split(" ")[0] : "User";

  const testimonials = [
    {
      description:
        "Study AI transformed my learning experience! The AI quizzes helped me ace my medical boards with confidence.",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      name: "Sarah Johnson",
      handle: "@sarahjohnson",
    },
    {
      description:
        "The personalized study materials are incredible. My grades improved by 40% since using Study AI!",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      name: "Michael Chen",
      handle: "@michaelchen",
    },
    {
      description:
        "The AI assistant understands exactly what I need. It's like having a personal tutor available 24/7.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      name: "Emily Rodriguez",
      handle: "@emilyrodriguez",
    },
    {
      description:
        "Study AI's adaptive quizzes helped me identify my weak areas and focus my study time effectively. My exam scores improved dramatically!",
      image:
        "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      name: "David Park",
      handle: "@davidpark",
    },
    {
      description:
        "The platform's AI-generated study materials are perfectly tailored to my learning style. It's like having a personal tutor who never sleeps!",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      name: "Lisa Martinez",
      handle: "@lisamartinez",
    },
    {
      description:
        "I recommend Study AI to every student. The comprehensive analytics and progress tracking keep me motivated and on track.",
      image:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      name: "Priya Patel",
      handle: "@priyapatel",
    },
  ];

  const motivationalQuotes = [
    "The beautiful thing about learning is that no one can take it away from you.",
    "Success is the sum of small efforts repeated day in and day out.",
    "The expert in anything was once a beginner.",
    "Education is the most powerful weapon which you can use to change the world.",
  ];

  const stats = [
    {
      label: "Study Streak",
      value: "12 days",
      icon: Target,
      color: "text-blue-500",
    },
    {
      label: "Time Studied",
      value: "34h 20m",
      icon: Clock,
      color: "text-purple-500",
    },
    {
      label: "Quizzes Completed",
      value: "47",
      icon: Trophy,
      color: "text-blue-600",
    },
    {
      label: "Study Partners",
      value: "23",
      icon: Users,
      color: "text-purple-600",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 overflow-hidden flex flex-col pt-16">
      <div className="flex-1">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg animate-bounce">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent mb-2">
              {getGreeting()}, {userName}!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ready to unlock your potential? Let's make today another step
              towards your goals.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:bg-white/80 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-full bg-gradient-to-r ${
                      stat.color.includes("blue")
                        ? "from-blue-100 to-blue-200"
                        : "from-purple-100 to-purple-200"
                    } group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Motivational Quote */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/20 text-center hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-500">
            <Quote className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-pulse" />
            <p className="text-lg italic text-gray-700 mb-2">
              "
              {
                motivationalQuotes[
                  Math.floor(Math.random() * motivationalQuotes.length)
                ]
              }
              "
            </p>
            <p className="text-sm text-gray-500">— Your daily motivation</p>
          </div>

          {/* Student Success Stories */}
          <div className="mb-12 rounded-2xl bg-gradient-to-r from-[#FFEEEE] to-[#DDEFBB] p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Student Success Stories
              </h2>
              <p className="text-gray-600">
                See how Study AI is transforming learning experiences
              </p>
            </div>
            <AnimatedTestimonials data={testimonials} />
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <button
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate("/study-material")}
            >
              <Brain className="w-6 h-6 group-hover:animate-pulse" />
              <span className="font-semibold text-lg">
                Continue Your Learning Journey
              </span>
              <BookOpen className="w-6 h-6 group-hover:animate-bounce" />
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default StudyAIDashboard;
