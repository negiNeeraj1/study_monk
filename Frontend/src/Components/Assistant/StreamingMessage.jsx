import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const StreamingMessage = ({ 
  text, 
  isStreaming = false, 
  isError = false,
  onStreamingComplete = () => {} // Callback prop for when streaming finishes
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const messageRef = useRef(null);

  useEffect(() => {
    if (!text) return;

    // If not streaming, show the full text immediately
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }

    // Split text into words to stream word-by-word
    const words = text.split(/(\s+)/); 
    let wordIndex = 0;

    // Reset the text when a new stream begins
    setDisplayedText(""); 

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        // Append the next word (or space/newline)
        setDisplayedText((prev) => prev + words[wordIndex]);
        wordIndex++;
        
        // Auto-scroll as text appears
        setTimeout(() => {
          if (messageRef.current) {
            messageRef.current.scrollIntoView({
              behavior: "smooth",
              block: "end",
            });
          }
        }, 50);
      } else {
        // We're done streaming
        clearInterval(interval);
        onStreamingComplete(); // Notify the parent component
      }
    }, 50); // Adjust this value to change typing speed

    return () => clearInterval(interval); // Cleanup on unmount or re-render
  }, [text, isStreaming, onStreamingComplete]);

  // Function to format text with bold text, emojis, and proper paragraphs
  const formatText = (text) => {
    if (!text) return "";

    // Split by double line breaks to identify paragraphs
    const paragraphs = text.split("\n\n");

    return paragraphs.map((paragraph, index) => {
      // Handle bold text formatting
      const formatBoldText = (text) => {
        return text.split("**").map((part, i) => {
          if (i % 2 === 1) {
            // Bold text - check if it's a heading (starts with emoji)
            const isHeading = /^[📚🎯💡⏰🧠📝🎓🚀❓✅]/.test(part);
            return (
              <span
                key={i}
                className={`font-bold text-gray-900 ${
                  isHeading ? "text-xl mb-2 block" : "text-lg"
                }`}
              >
                {part}
              </span>
            );
          } else {
            // Regular text
            return part;
          }
        });
      };

      // Handle bullet points and numbered lists
      if (
        paragraph.trim().startsWith("- ") ||
        paragraph.trim().startsWith("* ")
      ) {
        const lines = paragraph.split("\n");
        return (
          <div key={index} className="mb-6">
            {lines.map((line, lineIndex) => (
              <div key={lineIndex} className="flex items-start mb-3">
                <span className="text-blue-600 mr-3 mt-1 text-lg">•</span>
                <span className="flex-1 leading-relaxed">
                  {formatBoldText(line.replace(/^[-*]\s*/, ""))}
                </span>
              </div>
            ))}
          </div>
        );
      }

      // Handle numbered lists
      if (/^\d+\./.test(paragraph.trim())) {
        const lines = paragraph.split("\n");
        return (
          <div key={index} className="mb-6">
            {lines.map((line, lineIndex) => {
              const match = line.match(/^(\d+)\.\s*(.*)/);
              if (match) {
                return (
                  <div key={lineIndex} className="flex items-start mb-3">
                    <span className="text-blue-600 mr-3 font-semibold min-w-[25px] text-lg">
                      {match[1]}.
                    </span>
                    <span className="flex-1 leading-relaxed">
                      {formatBoldText(match[2])}
                    </span>
                  </div>
                );
              }
              return (
                <div key={lineIndex} className="mb-3 leading-relaxed">
                  {formatBoldText(line)}
                </div>
              );
            })}
          </div>
        );
      }

      // Regular paragraphs with bold text support
      return (
        <div key={index} className="mb-6 leading-relaxed text-gray-800">
          {paragraph.split("\n").map((line, lineIndex) => (
            <div key={lineIndex} className="mb-3">
              {formatBoldText(line)}
            </div>
          ))}
        </div>
      );
    });
  };

  const messageClasses = isError 
    ? "bg-gradient-to-r from-red-100 to-yellow-100 border border-red-200 text-red-800"
    : "bg-gradient-to-r from-gray-100 to-blue-50 text-gray-800";

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`max-w-[80%] p-4 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 ${messageClasses}`}
    >
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {formatText(displayedText)}
      </div>
      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-1 h-4 bg-blue-500 ml-1"
        />
      )}
    </motion.div>
  );
};

export default StreamingMessage;
