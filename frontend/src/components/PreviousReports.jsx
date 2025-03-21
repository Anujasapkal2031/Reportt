import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaDownload, FaFilePdf, FaFileWord, FaArrowLeft } from 'react-icons/fa';

const PreviousReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug token
      
      if (!token) {
        console.error('No token found in localStorage');
        setError('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:8000/api/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response:', response.data); // Debug API response
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Show more detailed error information
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setError(`Error: ${error.response.data.message || 'Failed to fetch reports'}`);
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRefresh = () => {
    fetchReports();
  };

  const handleDownload = async (reportId, format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const reportData = response.data;
      
      if (format === 'pdf') {
        // Generate PDF
        generatePDFReport(reportData);
      } else if (format === 'docx') {
        // Generate Word document
        await generateWordReport(reportData);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  // Generate and Download Word Report
  const generateWordReport = async (reportData) => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ text: "PUNE INSTITUTE OF COMPUTER TECHNOLOGY", heading: "Title" }),
            new Paragraph( {text: "Department: Information Technology", bold: true} ),
            new Paragraph(new TextRun({ text: `Academic Year: 2023-2024`, bold: true })),
            new Paragraph(`Subject: ${reportData.subjectName || 'N/A'}`),
            new Paragraph(`Faculty: ${reportData.facultyName || 'N/A'}`),
            new Paragraph(`Date: ${reportData.date || 'N/A'}`),
            new Paragraph(`No. of Students Attended: ${reportData.participationData?.totalStudents || reportData.studentsAttended || 'N/A'}`),
            new Paragraph(""),
            new Paragraph({ text: "Objectives:", heading: "Heading1" }),
            ...(reportData.objectives || []).map((obj) => new Paragraph(obj)),
            new Paragraph(""),
            new Paragraph({ text: "Learning Outcomes:", heading: "Heading1" }),
            new Paragraph(reportData.learningOutcomes || 'N/A'),
            new Paragraph(""),
            new Paragraph({ text: "Student Feedback Analysis:", heading: "Heading1" }),
            ...(reportData.feedback || []).map((fb) => new Paragraph(`Roll No: ${fb.rollNo} - ${fb.expectation}`)),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${reportData.title.replace(/\s+/g, "_")}.docx`);
  };

  // Generate and Download PDF Report
  const generatePDFReport = (reportData) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Teaching Activity Report", 14, 22);

    doc.setFontSize(12);
    doc.text(`Department: Information Technology`, 14, 30);
    doc.text(`Academic Year: 2023-2024`, 14, 36);
    doc.text(`Subject: ${reportData.subjectName || 'N/A'}`, 14, 42);
    doc.text(`Faculty: ${reportData.facultyName || 'N/A'}`, 14, 48);
    doc.text(`Date: ${reportData.date || 'N/A'}`, 14, 54);
    doc.text(`No. of Students Attended: ${reportData.participationData?.totalStudents || reportData.studentsAttended || 'N/A'}`, 14, 60);

    doc.text("Objectives:", 14, 70);
    (reportData.objectives || []).forEach((obj, index) => {
      doc.text(`${index + 1}. ${obj}`, 14, 76 + index * 6);
    });

    doc.text("Learning Outcomes:", 14, 90);
    doc.text(reportData.learningOutcomes || 'N/A', 14, 96);

    doc.text("Student Feedback Analysis:", 14, 110);
    (reportData.feedback || []).forEach((fb, index) => {
      doc.text(`Roll No: ${fb.rollNo} - ${fb.expectation}`, 14, 116 + index * 6);
    });

    doc.save(`${reportData.title.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800">
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </Link>
        <button 
          onClick={handleRefresh} 
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Previous Reports</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button 
            onClick={handleRefresh}
            className="text-red-700 underline mt-2"
          >
            Try again
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">No reports found.</p>
          <Link 
            to="/create-report" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Create Your First Report
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-gray-600">Found {reports.length} reports</p>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{report.subjectName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{report.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDownload(report._id, 'pdf')}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Download as PDF"
                        >
                          <FaFilePdf className="mr-1" /> PDF
                        </button>
                        <button
                          onClick={() => handleDownload(report._id, 'docx')}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="Download as Word"
                        >
                          <FaFileWord className="mr-1" /> Word
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PreviousReports; 