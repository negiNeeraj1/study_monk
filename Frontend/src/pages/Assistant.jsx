import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  Sparkles,
  Brain,
  Clock,
  Book,
  ChevronDown,
  ChevronUp,
  X,
  Mic,
  Settings,
  MessageCircle,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StreamingMessage from "../Components/Assistant/StreamingMessage";
import image from "../images/AIImage.png";

const TypingIndicator = () => (
  <div className="flex space-x-2 p-4">
    {[0, 0.2, 0.4].map((delay, index) => (
      <motion.div
        key={index}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 1.2, 
          delay,
          ease: "easeInOut"
        }}
        className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-sm"
      />
    ))}
  </div>
);

const WelcomeMessage = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="text-center py-12 px-6"
  >
    <motion.div
      animate={{ 
        rotate: [0, 10, -10, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="mb-6"
    >
      <Bot className="w-16 h-16 mx-auto text-blue-500 drop-shadow-lg" />
    </motion.div>
    
    <h3 className="text-2xl font-bold text-gray-800 mb-4">
      Welcome to your AI Study Assistant! 🎓
    </h3>
    
    <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
      I'm here to help you with your studies. Ask me anything about exam preparation, 
      study techniques, or any academic topic you'd like to explore!
    </p>
    
    <div className="flex flex-wrap justify-center gap-3">
      {[
        { icon: <Brain className="w-4 h-4" />, text: "Smart Learning" },
        { icon: <Sparkles className="w-4 h-4" />, text: "Instant Help" },
        { icon: <Zap className="w-4 h-4" />, text: "Quick Answers" }
      ].map((feature, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 
                     rounded-full text-sm font-medium text-gray-700 shadow-sm"
        >
          {feature.icon}
          {feature.text}
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const Assistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const chatContainerRef = useRef(null);

  const faqQuestions = [
    {
      text: "How do I prepare for exams effectively?",
      icon: <Brain className="w-4 h-4" />,
      category: "Study Tips"
    },
    {
      text: "What are the best study techniques for retention?",
      icon: <Book className="w-4 h-4" />,
      category: "Learning"
    },
    {
      text: "Can you explain complex topics simply?",
      icon: <Sparkles className="w-4 h-4" />,
      category: "Understanding"
    },
    { 
      text: "How to manage study time efficiently?", 
      icon: <Clock className="w-4 h-4" />,
      category: "Time Management"
    },
    {
      text: "Help me with programming concepts",
      icon: <Zap className="w-4 h-4" />,
      category: "Programming"
    },
    {
      text: "Create a study schedule for me",
      icon: <Settings className="w-4 h-4" />,
      category: "Planning"
    }
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  // Handler for when streaming is complete
  const handleStreamingComplete = () => {
    setIsStreaming(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = { text: input, sender: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setMessageCount(prev => prev + 1);
    setInput("");
    setIsTyping(true);
    setIsStreaming(false);
    setSelectedFAQ(null);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (response.ok && data.response) {
        setIsTyping(false);
        setIsStreaming(true);

        const aiMessage = {
          text: data.response,
          sender: "ai",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, aiMessage]);

        // REMOVED: The problematic setTimeout - now handled by onStreamingComplete

      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        text: "I'm having trouble connecting right now. Please check your connection and try again! 🔄",
        sender: "ai",
        timestamp: new Date(),
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFAQClick = (question) => {
    setSelectedFAQ(question);
    setInput(question.text);
    setShowFAQ(false);
  };

  const clearChat = () => {
    setMessages([]);
    setMessageCount(0);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      {/* Left side - Enhanced Image Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:block w-2/5 xl:w-1/3 relative"
      >
        <div className="h-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 
                        rounded-xl overflow-hidden shadow-2xl border border-white/50">
          
          {/* Floating particles background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-300/30 rounded-full"
                animate={{
                  x: [0, 100, 0],
                  y: [0, -100, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: Math.random() * 10 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              />
            ))}
          </div>

          <div className="h-full flex flex-col items-center justify-center relative z-10 p-8">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
                y: [0, -10, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mb-8"
            >
              <div className="relative">
                <img
                  src={image} 
                  alt="AI Assistant"
                  className="w-72 h-72 xl:w-80 xl:h-80 drop-shadow-2xl filter brightness-110"
                />
                
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 
                               rounded-full blur-xl -z-10 animate-pulse" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                           bg-clip-text text-transparent mb-2">
                Your AI Study Companion
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                Powered by advanced AI to help you achieve academic excellence
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Right side - Enhanced Chat Interface */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col bg-white/95 backdrop-blur-sm rounded-xl lg:rounded-l-none 
                   shadow-2xl border border-white/50 ml-0 lg:ml-4"
      >
        {/* Enhanced Chat Header */}
        <div className="p-4 md:p-6 border-b bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
                        rounded-t-xl relative overflow-hidden">
          
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -right-4 w-24 h-24 border-2 border-white rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-4 -left-4 w-20 h-20 border border-white rounded-full"
            />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <Bot className="w-8 h-8 text-white drop-shadow-lg" />
                <div className="absolute inset-0 bg-white/30 rounded-full blur animate-ping" />
              </motion.div>
              
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-sm">
                  AI Study Assistant
                </h2>
                <p className="text-blue-100 text-sm">
                  {messageCount > 0 ? `${messageCount} messages exchanged` : "Ready to help you learn"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {messages.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearChat}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 
                           rounded-lg transition-all duration-200"
                  title="Clear chat"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFAQ(!showFAQ)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 
                         rounded-lg transition-all duration-200"
                title="Quick questions"
              >
                {showFAQ ? (
                  <ChevronUp className="w-6 h-6" />
                ) : (
                  <ChevronDown className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <AnimatePresence>
          {showFAQ && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="border-b bg-gradient-to-b from-white to-blue-50/50 overflow-hidden"
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Quick Start Questions
                      </h3>
                      <p className="text-sm text-gray-600">
                        Click any question to get started instantly
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFAQ(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                             rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {faqQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFAQClick(question)}
                      className="text-left p-4 bg-white rounded-xl shadow-md hover:shadow-lg
                        border border-gray-100 hover:border-blue-200
                        transform transition-all duration-300
                        group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 
                                      group-hover:from-blue-200 group-hover:to-indigo-200 
                                      transition-all duration-300 mt-0.5">
                          {question.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-blue-600 font-medium mb-1 opacity-75">
                            {question.category}
                          </div>
                          <span className="text-gray-700 group-hover:text-gray-900 
                                         transition-colors duration-300 font-medium text-sm leading-relaxed">
                            {question.text}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Messages Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 
                     bg-gradient-to-b from-gray-50/50 to-white custom-scrollbar"
          style={{ scrollBehavior: "smooth" }}
        >
          {messages.length === 0 ? (
            <WelcomeMessage />
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "user" ? (
                    <motion.div
                      initial={{ scale: 0.8, x: 20 }}
                      animate={{ scale: 1, x: 0 }}
                      className="max-w-[85%] md:max-w-[75%] relative group"
                    >
                      <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 
                                    text-white transform hover:scale-[1.02] transition-all duration-300
                                    relative overflow-hidden">
                        
                        {/* Message background effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative z-10">
                          {message.text}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1 text-right opacity-70">
                        {message.timestamp?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="max-w-[85%] md:max-w-[75%]">
                      <StreamingMessage
                        text={message.text}
                        isStreaming={index === messages.length - 1 && isStreaming}
                        isError={message.isError}
                        onStreamingComplete={handleStreamingComplete}
                      />
                      <div className="text-xs text-gray-500 mt-1 opacity-70">
                        {message.timestamp?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-r from-gray-100 to-blue-50 rounded-2xl 
                            shadow-lg border border-gray-200/50">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced Input Area */}
        <div className="p-4 md:p-6 border-t bg-white/80 backdrop-blur-sm">
          <div className="flex space-x-3 items-end">
            <div className="flex-1 relative">
              <motion.input
                key="chat-input"
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask me anything about your studies..."
                disabled={isTyping}
                maxLength={500}
                className="w-full p-4 pr-12 border border-gray-200 rounded-2xl
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                  shadow-lg hover:shadow-xl transition-all duration-300
                  placeholder-gray-400 hover:placeholder-gray-500
                  bg-gradient-to-r from-white to-blue-50/30
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-gray-800 font-medium resize-none"
              />
              
              {/* Character counter */}
              <div className="absolute bottom-2 right-12 text-xs text-gray-400">
                {input.length}/500
              </div>
            </div>

            {/* Voice input button (placeholder) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isTyping}
              className="p-4 rounded-2xl shadow-lg transition-all duration-300
                       bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400
                       text-gray-600 hover:text-gray-700 disabled:opacity-50"
              title="Voice input (coming soon)"
            >
              <Mic className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: isTyping ? 1 : 1.05 }}
              whileTap={{ scale: isTyping ? 1 : 0.95 }}
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className={`p-4 rounded-2xl shadow-lg transition-all duration-300 relative overflow-hidden ${
                isTyping || !input.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:shadow-md"
              } text-white min-w-[60px]`}
            >
              {isTyping ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Settings className="w-5 h-5" />
                </motion.div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
          
          {/* Quick actions */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>Press Enter to send</span>
              {messages.length > 0 && (
                <span className="text-blue-600">{messages.length} messages</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>AI Online</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  );
};

export default Assistant;
