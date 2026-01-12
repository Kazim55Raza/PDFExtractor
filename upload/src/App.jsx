 
import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import './App.css';

// --- Correct Worker Setup for Vite ---
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();


// pdfjsLib.GlobalWorkerOptions.workerSrc =
//   `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export default function App() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // --- Extract PDF Text ---
  const extractPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let textContent = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      let page = await pdf.getPage(i);
      let content = await page.getTextContent();
      textContent += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return textContent;
  };

  // --- Extract Image Text ---
  const extractImage = async (file) => {
    const result = await Tesseract.recognize(file, "eng", {
      logger: (m) => console.log(m),
    });
    return result.data.text;
  };

  // --- Main Function on Button Click ---
  const handleExtractText = async () => {
    if (!file) {
      alert("Please upload a CV file first!");
      return;
    }

    setLoading(true);

    try {
      let text = "";

      if (file.type === "application/pdf") {
        text = await extractPDF(file);
      } else if (file.type.startsWith("image/")) {
        text = await extractImage(file);
      } else {
        alert("Only PDF or Image CV allowed.");
        return;
      }

      setExtractedText(text);
    } catch (error) {
      alert("Error reading CV file!");
      console.log(error);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h2>Upload Your Final CV</h2>

      <input type="file" accept=".pdf,image/*" onChange={handleFileChange} />

      <br /><br />
      <button
        onClick={handleExtractText}
        style={{
          padding: "10px 20px",
          background: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Extract CV Data
      </button>

      <br /><br />

      {loading && <h3>Extracting text from CV... Please wait.</h3>}

      {extractedText && (
        <div>
          <h3>Extracted CV Data</h3>
          <textarea
            value={extractedText}
            readOnly
            style={{ width: "100%", height: "250px" }}
          />
        </div>
      )}
    </div>
  );
}
