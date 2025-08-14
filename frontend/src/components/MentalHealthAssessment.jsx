import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Video as VideoIcon,
  Type,
  Send,
  X,
  Loader2,
  MessageSquare,
  Phone
} from 'lucide-react';
import ChatBot from './ChatBot';

const MentalHealthAssessment = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [userMessage, setUserMessage] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  // store stream reference for safe cleanup
  const audioStreamRef = useRef(null);
  const videoStreamRef = useRef(null);

  // Mock analysis function - will be replaced with actual model integration
  const analyzeInput = async (input, type) => {
    setIsLoading(true);

    // Simulate API call latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock result
    const emotions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    // store as number (not string)
    const confidence = parseFloat((Math.random() * 0.5 + 0.5).toFixed(2));

    setAnalysisResult({
      emotion: randomEmotion,
      confidence: confidence, // numeric
      type: type,
      message: `Detected ${randomEmotion} with ${(confidence * 100).toFixed(0)}% confidence`
    });

    setIsLoading(false);
  };

  // Text input handler
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    analyzeInput(inputText, 'text');
  };

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // keep reference for cleanup
      audioStreamRef.current = stream;

      // create media recorder and attach stream reference on the recorder object
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      // also keep recorder._stream (safe custom prop) for potential use
      mediaRecorder.current._stream = stream;

      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          // send blob for analysis (mock)
          analyzeInput(audioBlob, 'voice');
        } catch (err) {
          console.error('Error processing audio blob:', err);
        } finally {
          // stop audio tracks when recorder stops
          try {
            mediaRecorder.current?._stream?.getTracks()?.forEach(track => track.stop());
            audioStreamRef.current = null;
          } catch (err) {
            // ignore
          }
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Unable to access microphone. Please allow microphone permissions and try again.');
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
      }
    } catch (err) {
      console.error('Error stopping media recorder:', err);
    } finally {
      setIsRecording(false);
      // ensure we stop any leftover tracks (defensive)
      try {
        audioStreamRef.current?.getTracks()?.forEach(track => track.stop());
        audioStreamRef.current = null;
      } catch (err) {
        // ignore
      }
    }
  };

  // Camera handlers
  const toggleCamera = async () => {
    if (isCameraOn) {
      // stop video tracks safely
      try {
        videoStreamRef.current?.getTracks()?.forEach(track => track.stop());
      } catch (err) {
        console.warn('Error stopping video tracks:', err);
      }
      if (videoRef.current) {
        // defensive optional chaining
        if (videoRef.current.srcObject) {
          try {
            videoRef.current.srcObject.getTracks()?.forEach(track => track.stop());
          } catch (err) {
            // ignore
          }
        }
        videoRef.current.srcObject = null;
      }
      videoStreamRef.current = null;
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // ensure video plays
          try {
            videoRef.current.play().catch(() => {});
          } catch (err) {
            // ignore
          }
          setIsCameraOn(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Unable to access camera. Please allow camera permissions and try again.');
      }
    }
  };

  const captureExpression = () => {
    if (videoRef.current && canvasRef.current) {
      const videoEl = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // draw current frame to canvas (scale to canvas size)
      try {
        context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        analyzeInput(imageData, 'facial');
      } catch (err) {
        console.error('Error capturing expression:', err);
      }
    }
  };

  // Chatbot handlers
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const newMessage = { role: 'user', content: userMessage };
    setChatMessages(prev => [...prev, newMessage]);
    setUserMessage('');

    // Mock response - replace with actual API integration
    setTimeout(() => {
      const responses = [
        "I understand how you're feeling. Would you like to talk more about it?",
        "That sounds challenging. Have you tried any coping strategies?",
        "I'm here to listen. Can you tell me more?",
        "Many people feel this way sometimes. You're not alone.",
        "Thank you for sharing. How can I support you right now?"
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      // Stop audio recorder stream if active
      try {
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
          mediaRecorder.current.stop();
        }
      } catch (err) {
        // ignore
      }

      try {
        audioStreamRef.current?.getTracks()?.forEach(track => track.stop());
        audioStreamRef.current = null;
      } catch (err) {
        // ignore
      }

      // Stop video tracks if any
      try {
        videoStreamRef.current?.getTracks()?.forEach(track => track.stop());
        videoStreamRef.current = null;
      } catch (err) {
        // ignore
      }

      try {
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks()?.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      } catch (err) {
        // ignore
      }
    };
    // empty deps - run on unmount only
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                Mental Health Assessment
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Share how you're feeling through text, voice, or facial expression analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input Tabs */}
        <motion.div
          className="flex flex-wrap gap-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <button
            onClick={() => setActiveTab('text')}
            className={`px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all ${activeTab === 'text'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
          >
            <Type size={18} />
            <span>Text</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all ${activeTab === 'voice'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
          >
            <Mic size={18} />
            <span>Voice</span>
          </button>
          <button
            onClick={() => setActiveTab('facial')}
            className={`px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all ${activeTab === 'facial'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
          >
            <VideoIcon size={18} />
            <span>Facial Expression</span>
          </button>
        </motion.div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl mb-8 border border-gray-100 dark:border-gray-700">
                {activeTab === 'text' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">How are you feeling today?</h3>
                    <form onSubmit={handleTextSubmit} className="flex space-x-2">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                      </button>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'voice' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Record your voice</h3>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-4 rounded-xl ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} text-white hover:shadow-lg transition-all`}
                      >
                        {isRecording ? (
                          <div className="w-6 h-6 bg-white rounded-sm"></div>
                        ) : (
                          <Mic size={24} />
                        )}
                      </button>
                      <span className={`text-gray-600 dark:text-gray-300 font-medium ${isRecording ? 'animate-pulse' : ''}`}>
                        {isRecording ? 'Recording... Click to stop' : 'Click to record your voice'}
                      </span>
                    </div>
                    {isLoading && (
                      <div className="flex items-center text-purple-600 dark:text-purple-400">
                        <Loader2 className="animate-spin mr-2" />
                        Analyzing your voice...
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'facial' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Show your facial expression</h3>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative w-full max-w-md h-64 bg-gray-100 dark:bg-gray-700/50 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                        {isCameraOn ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3">
                              <VideoIcon className="text-gray-400" size={28} />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Camera is turned off</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click the button below to enable</p>
                          </div>
                        )}
                        <canvas ref={canvasRef} className="hidden" width="300" height="200" />
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={toggleCamera}
                          className={`px-5 py-2.5 rounded-xl flex items-center space-x-2 ${isCameraOn ? 'bg-red-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} text-white hover:shadow-lg transition-all`}
                        >
                          <VideoIcon size={18} />
                          <span>{isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}</span>
                        </button>
                        <button
                          onClick={captureExpression}
                          disabled={!isCameraOn || isLoading}
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center space-x-2 disabled:hover:shadow-none"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="animate-spin" />
                              <span>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <Send size={18} />
                              <span>Analyze Expression</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {analysisResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 p-6 rounded-2xl mb-8 border border-purple-100 dark:border-purple-900/50 shadow-lg backdrop-blur-sm mt-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Analysis Result</h3>
                    <div className="space-y-2">
                      <p className="text-gray-700 dark:text-gray-200">
                        <span className="font-medium">Type:</span> {analysisResult.type.charAt(0).toUpperCase() + analysisResult.type.slice(1)}
                      </p>
                      <p className="text-gray-700 dark:text-gray-200">
                        <span className="font-medium">Detected Emotion:</span> {analysisResult.emotion}
                      </p>
                      <p className="text-gray-700 dark:text-gray-200">
                        <span className="font-medium">Confidence:</span> {(analysisResult.confidence * 100).toFixed(0)}%
                      </p>
                      <p className="text-gray-700 dark:text-gray-200 mt-2">
                        <span className="font-medium">Message:</span> {analysisResult.message}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Support Options */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Get Support</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setShowChatbot(!showChatbot)}
              className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/70 rounded-xl hover:shadow-lg transition-all flex flex-col items-center justify-center space-y-3 h-full border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-900/50 hover:-translate-y-1 transform"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shadow-inner">
                <MessageSquare className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <span className="font-semibold text-gray-800 dark:text-white text-lg">Chat with AI Assistant</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Get instant support from our AI assistant</p>
            </button>

            <button
              onClick={() => alert('Audio call support will be available soon!')}
              className="p-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl hover:shadow-lg transition-all flex flex-col items-center justify-center space-y-3 h-full border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900/50 hover:-translate-y-1 transform"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-inner">
                <Phone className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <span className="font-semibold text-gray-800 dark:text-white text-lg">Audio Call Support</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Talk to a mental health professional</p>
            </button>

            <button
              onClick={() => alert('Video call support will be available soon!')}
              className="p-6 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 rounded-xl hover:shadow-lg transition-all flex flex-col items-center justify-center space-y-3 h-full border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-900/50 hover:-translate-y-1 transform"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-inner">
                <VideoIcon className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <span className="font-semibold text-gray-800 dark:text-white text-lg">Video Call Support</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Face-to-face support with a counselor</p>
            </button>
          </div>
        </motion.div>

        {/* Chatbot Toggle Button */}
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all z-40"
          aria-label="Open AI Assistant"
        >
          <MessageSquare size={24} />
        </button>

        {/* Chatbot Component */}
        <ChatBot isOpen={showChatbot} onClose={() => setShowChatbot(false)} />

        <AnimatePresence>
          {showChatbot && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 w-full max-w-md h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:shadow-2xl"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
                <h3 className="font-semibold text-lg">AI Mental Health Assistant</h3>
                <button
                  onClick={() => setShowChatbot(false)}
                  className="text-white hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MentalHealthAssessment;
