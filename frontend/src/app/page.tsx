// components/VideoUpload.tsx
'use client'
import React, { useState } from 'react';
import axios from 'axios';


const Home = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setError(null);
    } else {
      setError("Please upload a valid video file");
      setVideoFile(null);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setError("No video file selected");
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append('file', videoFile);

    try {
      const response = await axios.post('http://localhost:9050/v1/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Upload successful:", response.data);
      setVideoFile(null); // Reset file input after successful upload
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

 

  return (

    <div className="flex">
      <div className="flex-1 p-4">
        <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-md max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4">Upload a Video File</h2>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            onClick={handleUpload}
            disabled={!videoFile || uploading}
            className={`mt-4 px-6 py-2 rounded-md text-white ${uploading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

