import React, { useState, useEffect } from "react";

const FileUpload = ({ onSubmit }) => {
  const [resume, setResume] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => console.log("Component Mounted"),[]);

  const handleSubmit = async () => {
    if (!resume || !jobTitle || !jobDescription) {
      alert("Please fill out all fields!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobTitle", jobTitle);
    formData.append("jobDescription", jobDescription);

    try {
      const res = await fetch("http://localhost:5000/api/setup", {
        method: "POST",
        body: formData,
      });
    
      const data = await res.json();
      if (data.success) {
        onSubmit(resume, jobTitle, jobDescription);
      } else {
        // Better error message from the server if available
        alert(data.message || "❌ Failed to setup interview context.");
        setLoading(false)
      }
    } catch (err) {
      console.error(err);
      // Distinguish between network and other errors
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        alert("❌ Network error. Please check your connection.");
      } else {
        alert("❌ Server error.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white p-12">
      {/* Resume Upload */}
      <div className="flex items-center justify-center w-full mb-8">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-72 border-4 border-dashed border-indigo-500 rounded-xl cursor-pointer bg-gray-800 hover:bg-gray-700 transition-all duration-300 ease-in-out shadow-xl"
        >
          <div className="flex flex-col items-center justify-center pt-8 pb-8">
            <svg
              className="w-12 h-12 mb-4 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-lg text-gray-300">
              <span className="font-semibold text-indigo-500">Click to upload your resume</span> or drag and drop
            </p>
            <p className="text-sm text-gray-400">PDF, DOCX accepted</p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResume(e.target.files[0])}
          />
        </label>
      </div>

      {/* Job Info */}
      <div className="space-y-6">
        <div className="flex flex-col">
          <label htmlFor="jt" className="text-sm font-bold text-white mb-2">
            Job Title
          </label>
          <input
            type="text"
            id="jt"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Ex. Full Stack Web Developer"
            className="w-full px-4 py-3 bg-gray-800 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="jd" className="text-sm font-bold text-white mb-2">
            Job Description
          </label>
          <textarea
            id="jd"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Must have experience with..."
            className="w-full px-4 py-3 bg-gray-800 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          ></textarea>
        </div>
      </div>

      {/* Submit Button */}
      <button
        className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-lg font-medium"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Setting Up..." : "Start Interview"}
      </button>
    </div>
  );
};

export default FileUpload;