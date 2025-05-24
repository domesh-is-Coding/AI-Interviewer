import { useState, useRef, useEffect } from "react";
import FileUpload from "./FileUpload";
import TalkingAvatar from './TalkingAvatar'

const VoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [response, setResponse] = useState("");
  const [contextAdded, setContextAdded] = useState(false);
  const [resume, setResume] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);


  useEffect(() => console.log("This is mounted"),[])
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      new Audio(`http://localhost:5000${data?.audioUrl}`).play();
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  // const stopRecording = () => {
  //   mediaRecorderRef.current.stop();
  //   setRecording(false);
  // };


  const playResponseAudio = (url) => {
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioRef.current = new Audio(url);
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.play();
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const handleContextSubmit = (resumeFile, title, description) => {
    setResume(resumeFile);
    setJobTitle(title);
    setJobDescription(description);
    setContextAdded(true);
  };

  return (

    <div className="min-h-screen bg-gray-50">
       {/* <div className="mb-8">
            <AvatarScene isSpeaking={recording || isPlaying} />
          </div> */}
      {contextAdded ? (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center">
          {/* Avatar Section */}
          <div className="mb-8">
            {/* <AvatarScene isSpeaking={recording || isPlaying} /> */}
            <TalkingAvatar isSpeaking={recording || isPlaying} />
          </div>
          
          {/* Controls */}
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

            {/* Response */}
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
