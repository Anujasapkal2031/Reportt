// src/components/ReportForm.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaArrowLeft } from "react-icons/fa";

const ReportForm = () => {
  const initialFormState = {
    title: "",
    subjectName: "",
    facultyName: "",
    date: "",
    studentsAttended: "",
    objectives: [""],
    description: "",
    learningOutcomes: "",
    targetYear: "T.E.",
    groupData: { groupA: Array(8).fill(0), groupB: Array(8).fill(0), groupC: Array(8).fill(0), groupD: Array(8).fill(0) },
    feedback: [],
    images: [],
    participationData: { totalStudents: 0, materialProvided: 0, participated: 0 },
  };

  const [imageFiles, setImageFiles] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  const handleImageChange = (e) => {
    setImageFiles([...e.target.files]); // Store selected files
  };
  const uploadImagesToCloudinary = async () => {
    const uploadedImageUrls = [];
    const cloudinaryUploadUrl = "https://api.cloudinary.com/v1_1/dyqkp6k6l/image/upload";
    const cloudinaryUploadPreset = "utkarsh"; // Your Cloudinary preset
  
    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", cloudinaryUploadPreset);
  
      try {
        const response = await axios.post(cloudinaryUploadUrl, formData);
        console.log("Cloudinary Response:", response.data); // ✅ Check response
        uploadedImageUrls.push(response.data.secure_url);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
    console.log("Uploaded Image URLs:", uploadedImageUrls); // ✅ Check if images were uploaded
    return uploadedImageUrls;
  };
const generateWordReport = async (formData) => {
  const images = await Promise.all(
      formData.images.map(async (imgUrl) => {
          try {
              const base64Image = await convertImageToBase64(imgUrl);
              return new ImageRun({
                  data: base64Image,
                  transformation: { width: 100, height: 50 }
              });
          } catch (error) {
              console.error("Error converting image:", error);
              return new Paragraph("Error loading image.");
          }
      })
  );

  const doc = new Document({
      sections: [
          {
              properties: {},
              children: [
                  new Paragraph({ text: "PUNE INSTITUTE OF COMPUTER TECHNOLOGY", heading: "Title" }),
                  new Paragraph({ text: "Department: Information Technology", bold: true }),
                  new Paragraph(`Subject: ${formData.subjectName}`),
                  new Paragraph(`Faculty: ${formData.facultyName}`),
                  new Paragraph(`Date: ${formData.date}`),
                  new Paragraph(`No. of Students Attended: ${formData.participationData.totalStudents || "N/A"}`),
                  new Paragraph(""),

                  new Paragraph({ text: "Objectives:", heading: "Heading1" }),
                  ...formData.objectives.map((obj) => new Paragraph(obj)),
                  new Paragraph(""),

                  new Paragraph({ text: "Snapshots:", heading: "Heading1" }),
                  ...images, // ✅ Include the converted Base64 images

                  new Paragraph({ text: "Learning Outcomes:", heading: "Heading1" }),
                  new Paragraph(formData.learningOutcomes),
                  new Paragraph({ text: "Student Feedback Analysis:", heading: "Heading1" }),
              ],
          },
      ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${formData.title.replace(/\s+/g, "_")}.docx`);
};

// ✅ Function to Convert Image URL to Base64
const convertImageToBase64 = async (imageUrl) => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]); // Remove Base64 prefix
      reader.readAsDataURL(blob);
  });
};



  // ✅ Generate and Download PDF Report
  const getBase64Image = async (imgUrl) => {
    const response = await fetch(imgUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
  };
const generatePDFReport = async (formData) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Teaching Activity Report", 14, 22);

  doc.setFontSize(12);
  doc.text("Department: Information Technology", 14, 30);
  doc.text("Academic Year: 2023-2024", 14, 36);
  doc.text(`Subject: ${formData.subjectName}`, 14, 42);
  doc.text(`Faculty: ${formData.facultyName}`, 14, 48);
  doc.text(`Date: ${formData.date}`, 14, 54);
  doc.text(`No. of Students Attended: ${formData.participationData.totalStudents || "N/A"}`, 14, 60);
  
  let yPos = 70; // ✅ Correctly initializing yPos

  // ✅ Objectives Section
  doc.text("Objectives:", 14, yPos);
  yPos += 6;
  formData.objectives.forEach((obj, index) => {
      doc.text(`${index + 1}. ${obj}`, 14, yPos);
      yPos += 6;
  });

  // ✅ Images Section (Ensure Proper Placement)
  if (formData.images.length > 0) {
      yPos += 10;
      doc.text("Snapshots:", 14, yPos);
      yPos += 6;

      for (const img of formData.images) {
          try {
              const imgData = await getBase64Image(img);

              // ✅ Check if a new page is needed
              if (yPos + 50 > 280) {
                  doc.addPage();
                  yPos = 20; // Reset yPos for new page
              }

              doc.addImage(imgData, "JPEG", 14, yPos, 80, 50);
              yPos += 60; // Ensure spacing after image
          } catch (error) {
              console.error("Error adding image to PDF:", error);
              doc.text("Error loading image.", 14, yPos);
              yPos += 10;
          }
      }
  } else {
      doc.text("No images uploaded.", 14, yPos);
      yPos += 10;
  }

  // ✅ Ensure Learning Outcomes don’t overlap
  if (yPos + 20 > 280) {
      doc.addPage();
      yPos = 20;
  }

  doc.text("Learning Outcomes:", 14, yPos);
  yPos += 6;

  // ✅ Wrap text properly
  const splitLearningOutcomes = doc.splitTextToSize(formData.learningOutcomes, 180);
  doc.text(splitLearningOutcomes, 14, yPos);
  yPos += splitLearningOutcomes.length * 6;

  doc.text("Student Feedback Analysis:", 14, yPos + 10);
  yPos += 16;

  formData.feedback.forEach((fb, index) => {
      if (yPos + 10 > 280) {
          doc.addPage();
          yPos = 20;
      }
      doc.text(`Roll No: ${fb.rollNo} - ${fb.expectation}`, 14, yPos);
      yPos += 6;
  });

  let yPos2 = yPos + 10;

  doc.save(`${formData.title.replace(/\s+/g, "_")}.pdf`);
};


// ✅ Handle Form Submission
//anuja

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Upload images first
  const uploadedImageUrls = await uploadImagesToCloudinary();
  const finalFormData = { ...formData, images: uploadedImageUrls };

  console.log("Submitting Report:", finalFormData);

  try {
      const token = localStorage.getItem("token"); 
      const response = await axios.post("http://localhost:8000/api/reports", finalFormData, {
          headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Report Created:", response.data);
      alert("Report submitted successfully!");

      // ✅ Ensure correct data is passed for report generation
      await generateWordReport(finalFormData);
      generatePDFReport(finalFormData);

      setFormData(initialFormState); // Reset form after submission
  } catch (error) {
      console.error("Error submitting report:", error);
  }
};
  // Handle form reset
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form? All entered data will be lost.")) {
      setFormData(initialFormState);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center mb-6">
        <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Report</h2>

        <input
          type="text"
          placeholder="Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="block w-full p-3 my-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Subject Name"
          required
          value={formData.subjectName}
          onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
          className="block w-full p-3 my-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Faculty Name"
          required
          value={formData.facultyName}
          onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
          className="block w-full p-3 my-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="block w-full p-3 my-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* ✅ Participation Data */}
        <div className="grid grid-cols-3 gap-4 my-4">
          <input
            type="number"
            placeholder="Total Students"
            required
            value={formData.participationData.totalStudents}
            onChange={(e) =>
              setFormData({
                ...formData,
                participationData: { ...formData.participationData, totalStudents: e.target.value },
              })
            }
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Material Provided"
            required
            value={formData.participationData.materialProvided}
            onChange={(e) =>
              setFormData({
                ...formData,
                participationData: { ...formData.participationData, materialProvided: e.target.value },
              })
            }
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Students Participated"
            required
            value={formData.participationData.participated}
            onChange={(e) =>
              setFormData({
                ...formData,
                participationData: { ...formData.participationData, participated: e.target.value },
              })
            }
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ✅ Objectives */}
        <label className="block mt-4 font-bold text-gray-800">Objectives:</label>
        {formData.objectives.map((objective, index) => (
          <input
            key={index}
            type="text"
            value={objective}
            onChange={(e) => {
              const newObjectives = [...formData.objectives];
              newObjectives[index] = e.target.value;
              setFormData({ ...formData, objectives: newObjectives });
            }}
            className="block w-full p-3 my-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
        <button
          type="button"
          onClick={() => setFormData({ ...formData, objectives: [...formData.objectives, ""] })}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <span className="mr-1">+</span> Add Another Objective
        </button>

        {/* ✅ Learning Outcomes */}
        <label className="block mt-4 font-bold text-gray-800">Learning Outcomes:</label>
        <textarea
          value={formData.learningOutcomes}
          onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
          className="block w-full p-3 my-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        />
      <label className="block mt-4 font-bold text-gray-800">Upload Images:</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="block w-full p-3 my-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

        {/* ✅ Submit Button */}
        <div className="flex justify-between mt-6">
          <div className="flex space-x-3">
            <Link 
              to="/dashboard" 
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
            >
              Cancel
            </Link>
            <button 
              type="button" 
              onClick={handleReset}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
            >
              Reset Form
            </button>
          </div>
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Generate Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
