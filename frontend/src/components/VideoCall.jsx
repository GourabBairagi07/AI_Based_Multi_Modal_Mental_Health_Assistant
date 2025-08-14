import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const VideoCall = ({ isOpen, onClose, userData }) => {
  const [supporters, setSupporters] = useState([]);
  const [selectedSupporter, setSelectedSupporter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionStatus, setSessionStatus] = useState('idle'); // idle, connecting, active, ended

  useEffect(() => {
    if (isOpen) {
      fetchSupporters();
    }
  }, [isOpen]);

  const fetchSupporters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/supporters/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSupporters(data);
      } else {
        toast.error('Failed to load supporters');
      }
    } catch (error) {
      console.error('Error fetching supporters:', error);
      toast.error('Failed to load supporters');
    }
  };

  const startSession = async (supporter) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/video-sessions/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          supporter_id: supporter.id,
          topic: 'Mental health consultation',
          crisis_related: false
        })
      });

      if (response.ok) {
        const sessionData = await response.json();
        setCurrentSession(sessionData);
        setSelectedSupporter(supporter);
        setSessionStatus('connecting');
        
        // Simulate connecting to video call
        setTimeout(() => {
          setSessionStatus('active');
          toast.success(`Connected with ${supporter.name}`);
        }, 2000);
      } else {
        toast.error('Failed to start session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!currentSession) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/video-sessions/${currentSession.id}/end/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSessionStatus('ended');
        toast.success('Session ended successfully');
        setTimeout(() => {
          resetSession();
        }, 2000);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const resetSession = () => {
    setCurrentSession(null);
    setSelectedSupporter(null);
    setSessionStatus('idle');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Video Call with Mental Health Professional</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {sessionStatus === 'idle' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Mental Health Professionals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {supporters.map((supporter) => (
                  <div
                    key={supporter.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => startSession(supporter)}
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                        {supporter.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{supporter.name}</h4>
                        <p className="text-sm text-gray-600">{supporter.specialization_display}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 line-clamp-2">{supporter.bio}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-gray-600 ml-1">{supporter.average_rating}</span>
                          <span className="text-sm text-gray-500 ml-1">({supporter.total_reviews})</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          ${supporter.hourly_rate}/hr
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {supporter.years_experience} years exp.
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {supporter.status_display}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sessionStatus === 'connecting' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Connecting to {selectedSupporter?.name}</h3>
              <p className="text-gray-600">Please wait while we establish your secure video connection...</p>
            </div>
          )}

          {sessionStatus === 'active' && (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-lg p-8 mb-6">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                  {selectedSupporter?.name.charAt(0)}
                </div>
                <h3 className="text-xl font-semibold mb-2">Connected with {selectedSupporter?.name}</h3>
                <p className="text-gray-600 mb-4">{selectedSupporter?.specialization_display}</p>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-semibold mb-2">Session Information</h4>
                    <p className="text-sm text-gray-600">Session ID: {currentSession?.session_id}</p>
                    <p className="text-sm text-gray-600">Room URL: {currentSession?.room_url}</p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Video Call Features</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Secure end-to-end encrypted video</li>
                      <li>• Screen sharing capability</li>
                      <li>• Chat messaging during call</li>
                      <li>• Session recording (with consent)</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={endSession}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  End Session
                </button>
                <button
                  onClick={() => window.open(currentSession?.room_url, '_blank')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Open Video Room
                </button>
              </div>
            </div>
          )}

          {sessionStatus === 'ended' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Session Ended</h3>
              <p className="text-gray-600 mb-4">Thank you for your session. We hope you found it helpful.</p>
              <button
                onClick={resetSession}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start New Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
