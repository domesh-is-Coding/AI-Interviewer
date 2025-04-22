import { useState, useRef, useEffect } from "react";
import FileUpload from "./FileUpload";
import TalkingAvatar from './TalkingAvatar';

const VoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [response, setResponse] = useState("");
  const [contextAdded, setContextAdded] = useState(false);
  const [resume, setResume] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Initialize audio context when component mounts
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      // Clean up audio context when component unmounts
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.wav");

        const res = await fetch("http://localhost:5000/api/interview", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        console.log({ data });
        setResponse(data);
        playResponseAudio(`http://localhost:5000${data?.audioUrl}`);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const playResponseAudio = (url) => {
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    audioRef.current = new Audio(url);
    audioRef.current.onended = () => setIsPlaying(false);
    
    // Create a media stream source for the audio element for lip sync
    audioRef.current.onplay = () => {
      if (audioContextRef.current) {
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        const analyser = audioContextRef.current.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioContextRef.current.destination);
        mediaStreamRef.current = analyser.context.createMediaStreamDestination().stream;
      }
    };
    
    audioRef.current.play();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    
    // Stop all tracks in the media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleContextSubmit = (resumeFile, title, description) => {
    setResume(resumeFile);
    setJobTitle(title);
    setJobDescription(description);
    setContextAdded(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {contextAdded ? (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center">
          <div className="mb-8">
            <TalkingAvatar 
              isSpeaking={recording || isPlaying} 
              audioContext={audioContextRef.current}
              audioStream={mediaStreamRef.current}
            />
          </div>
          
          <div className="flex flex-col items-center space-y-6 w-full max-w-md">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors ${
                recording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {recording ? (
                <span className="flex items-center justify-center">
                  <span className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></span>
                  Stop Recording
                </span>
              ) : 'Start Recording'}
            </button>

            {response && (
              <div className="w-full bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Interviewer Response</h3>
                <p className="text-gray-600">{response.reply}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <FileUpload onSubmit={handleContextSubmit} />
      )}
    </div>
  );
};

export default VoiceRecorder;