import { Routes, Route } from "react-router";
// import Hello from "./Hello";
import VoiceRecorder from './components/VoiceRecorder'

function App() {
  
  return (
    <Routes>
      <Route path="/" element={<VoiceRecorder />} />
    </Routes>
  )
}

export default App
