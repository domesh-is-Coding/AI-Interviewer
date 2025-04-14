import { useState, useRef, useEffect } from "react";
import FileUpload from "./FileUpload";

const VoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [response, setResponse] = useState("");
  const [contextAdded, setContextAdded] = useState(false);
  const [resume, setResume] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");


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
    <div>
      {contextAdded ? (
        <div className="p-4">
          <button
            onClick={recording ? stopRecording : startRecording}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {recording ? "Stop Recording" : "Start Recording"}
          </button>
          <div className="mt-4">
            <p className="text-lg">AI Response:</p>
            <p>{response?.reply}</p>
          </div>
        </div>
      ) : (
        <FileUpload onSubmit={handleContextSubmit} />
      )}
    </div>
  );
};

export default VoiceRecorder;
