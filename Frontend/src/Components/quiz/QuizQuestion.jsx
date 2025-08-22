import React from 'react'
import {motion} from 'framer-motion';
import { useState } from 'react';
import { 
    BookOpen, 
    Award, 
    Star, 
    CheckCircle2, 
    XCircle, 
    Clock 
  } from 'lucide-react';
  
const QuizQuestion = ({ question, options, onAnswer }) => {
    const [selected, setSelected] = useState(null);
  
    const handleSelect = (option) => {
      setSelected(option);
      onAnswer(option);
    };
  
    return (
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center mb-6">
          <BookOpen className="mr-3 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">{question.text}</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(option)}
              className={`p-4 rounded-lg text-left transition-all duration-300 
                ${selected === option 
                  ? 'bg-blue-100 border-2 border-blue-500 text-blue-800' 
                  : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {option.text}
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  };

export default QuizQuestion