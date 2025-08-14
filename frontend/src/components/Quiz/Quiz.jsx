import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const quizQuestions = [
  {
    id: 1,
    question: 'How often do you feel nervous or anxious?',
    options: [
      { id: 1, text: 'Never', score: 0 },
      { id: 2, text: 'Rarely', score: 1 },
      { id: 3, text: 'Sometimes', score: 2 },
      { id: 4, text: 'Often', score: 3 },
    ],
  },
  {
    id: 2,
    question: 'How often do you have trouble falling or staying asleep?',
    options: [
      { id: 1, text: 'Never', score: 0 },
      { id: 2, text: 'Rarely', score: 1 },
      { id: 3, text: 'Sometimes', score: 2 },
      { id: 4, text: 'Often', score: 3 },
    ],
  },
  // Add 8 more questions...
  {
    id: 3,
    question: 'How often do you feel tired or have little energy?',
    options: [
      { id: 1, text: 'Never', score: 0 },
      { id: 2, text: 'Rarely', score: 1 },
      { id: 3, text: 'Sometimes', score: 2 },
      { id: 4, text: 'Often', score: 3 },
    ],
  },
  {
    id: 4,
    question: 'How often do you have trouble relaxing?',
    options: [
      { id: 1, text: 'Never', score: 0 },
      { id: 2, text: 'Rarely', score: 1 },
      { id: 3, text: 'Sometimes', score: 2 },
      { id: 4, text: 'Often', score: 3 },
    ],
  },
  {
    id: 5,
    question: 'How often do you feel bad about yourself?',
    options: [
      { id: 1, text: 'Never', score: 0 },
      { id: 2, text: 'Rarely', score: 1 },
      { id: 3, text: 'Sometimes', score: 2 },
      { id: 4, text: 'Often', score: 3 },
    ],
  },
  {
    id: 6,
    question: 'How often do you have trouble concentrating?',
    options: [
      { id: 1, text: 'Never', score: 0 },
      { id: 2, text: 'Rarely', score: 1 },
      { id: 3, text: 'Sometimes', score: 2 },
      { id: 4, text: 'Often', score: 3 },
    ],
  },
  {
    id: 7,
    question: 'How often do you feel so restless that it is hard to sit still?',
    options: [
      { id: 1, text: 'Never', score: 0 },
      { id: 2, text: 'Rarely', score: 1 },
      { id: 3, text: 'Sometimes', score: 2 },
      { id: 4, text: 'Often', score: 3 },
    ],
  },
  {
    id: 8,
    question: 'How often do you feel that everything is an effort?',
    options: [
      { id: 1, text: 'Never', score: 0 },
      { id: 2, text: 'Rarely', score: 1 },
      { id: 3, text: 'Sometimes', score: 2 },
      { id: 4, text: 'Often', score: 3 },
    ],
  },
  {
    id: 9,
    question: 'How often do you feel hopeless?',
    options: [
      { id: 1, text: 'Never', score: 0 },
      { id: 2, text: 'Rarely', score: 1 },
      { id: 3, text: 'Sometimes', score: 2 },
      { id: 4, text: 'Often', score: 3 },
    ],
  },
  {
    id: 10,
    question: 'How often do you feel that you are not as good as other people?',
    options: [
      { id: 1, text: 'Never', score: 0 },
      { id: 2, text: 'Rarely', score: 1 },
      { id: 3, text: 'Sometimes', score: 2 },
      { id: 4, text: 'Often', score: 3 },
    ],
  },
];

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;

  const handleAnswer = (optionId) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId,
    });

    if (!isLastQuestion) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    } else {
      calculateScore();
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    quizQuestions.forEach((question) => {
      const selectedOptionId = answers[question.id];
      if (selectedOptionId) {
        const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
        totalScore += selectedOption.score;
      }
    });
    setScore(totalScore);
  };

  const getResultMessage = () => {
    // Max score is 30 (10 questions * 3 points each for 'Often' answer)
    const percentage = (score / 30) * 100;
    
    if (percentage < 25) {
      return {
        title: 'Mild Stress Level',
        color: 'text-green-400',
        message: 'You\'re managing stress well overall.',
        insights: [
          'Your responses suggest you have good coping mechanisms in place.',
          'You seem to maintain a healthy balance in your daily life.'
        ],
        recommendations: [
          'Continue practicing self-care and stress management techniques',
          'Maintain your healthy routines and social connections',
          'Consider mindfulness or meditation to maintain your mental wellbeing'
        ]
      };
    } else if (percentage < 50) {
      return {
        title: 'Moderate Stress',
        color: 'text-yellow-400',
        message: 'You\'re experiencing some stress that may need attention.',
        insights: [
          'You might be feeling overwhelmed by certain aspects of your life.',
          'Some daily activities may be causing you more stress than usual.'
        ],
        recommendations: [
          'Practice regular relaxation techniques (deep breathing, meditation, yoga)',
          'Ensure you\'re getting 7-9 hours of quality sleep each night',
          'Consider talking to friends, family, or a counselor about your stress',
          'Try to identify and limit exposure to key stressors when possible'
        ]
      };
    } else if (percentage < 75) {
      return {
        title: 'High Stress Level',
        color: 'text-orange-500',
        message: 'Your responses indicate significant stress that needs attention.',
        insights: [
          'You may be experiencing symptoms of anxiety or depression.',
          'Your stress levels could be affecting your daily functioning.'
        ],
        recommendations: [
          'Consider speaking with a mental health professional',
          'Practice stress-reduction techniques daily',
          'Ensure you\'re maintaining a healthy lifestyle (diet, exercise, sleep)',
          'Reach out to supportive friends or family members',
          'Consider reducing your workload or responsibilities if possible'
        ]
      };
    } else {
      return {
        title: 'Severe Stress Level',
        color: 'text-red-500',
        message: 'Your responses indicate very high stress levels that require attention.',
        insights: [
          'You may be experiencing significant emotional distress.',
          'These stress levels can have serious impacts on your physical and mental health.'
        ],
        recommendations: [
          'Please consider reaching out to a mental health professional as soon as possible',
          'Contact a crisis hotline if you\'re feeling overwhelmed or having thoughts of self-harm',
          'Reach out to trusted friends or family members for support',
          'Prioritize self-care and reduce unnecessary stressors',
          'Consider speaking with your doctor about how you\'ve been feeling'
        ],
        emergency: true
      };
    }
  };

  const result = getResultMessage();

  if (showResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Assessment Complete</h2>
          
          <div className="mb-8 space-y-6">
            <div>
              <div className={`text-4xl font-bold mb-2 ${result.color}`}>
                {result.title}
              </div>
              <p className="text-xl text-gray-200 mb-4">{result.message}</p>
              
              <div className="w-full bg-gray-700 rounded-full h-3 mb-1 mt-6">
                <motion.div 
                  className={`h-full rounded-full ${result.color.replace('text', 'bg')} ${result.emergency ? 'animate-pulse' : ''}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / 30) * 100}%` }}
                  transition={{ duration: 1.5, type: 'spring' }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-400 mb-6">
                <span>Low Stress</span>
                <span>High Stress</span>
              </div>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Key Insights</h3>
              <ul className="space-y-2 text-gray-300">
                {result.insights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
              <ul className="space-y-2 text-gray-300">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {result.emergency && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                <h4 className="font-semibold text-red-400 mb-2">Important Notice</h4>
                <p className="text-red-300 text-sm">
                  If you're in crisis or having thoughts of self-harm, please contact a mental health professional immediately or call a crisis hotline in your area.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold text-white">Your Answers:</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {quizQuestions.map((question) => (
                <div key={question.id} className="bg-white/5 p-4 rounded-lg">
                  <p className="text-white/90 font-medium">{question.question}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your answer: {
                      question.options.find(o => o.id === answers[question.id])?.text || 'Not answered'
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => {
                setCurrentQuestionIndex(0);
                setAnswers({});
                setShowResult(false);
                setScore(0);
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Retake Assessment
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Mental Health Assessment</h2>
          <div className="text-sm text-gray-400">
            Question {currentQuestionIndex + 1} of {quizQuestions.length}
          </div>
        </div>

        <div className="mb-8">
          <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
            <motion.div 
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-medium text-white mb-6">{currentQuestion.question}</h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option.id)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      answers[currentQuestion.id] === option.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-gray-200'
                    }`}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <button
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
              }
            }}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-lg ${
              currentQuestionIndex === 0
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-blue-400 hover:text-white'
            }`}
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-400">
            {currentQuestionIndex + 1} / {quizQuestions.length}
          </div>
          
          <button
            onClick={() => {
              if (currentQuestionIndex < quizQuestions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
              } else {
                calculateScore();
                setShowResult(true);
              }
            }}
            disabled={!answers[currentQuestion.id]}
            className={`px-4 py-2 rounded-lg ${
              !answers[currentQuestion.id]
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-blue-400 hover:text-white'
            }`}
          >
            {isLastQuestion ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
