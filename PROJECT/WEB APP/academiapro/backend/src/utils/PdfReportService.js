// NOTE: This service requires 'pdfkit' to be installed via: npm install pdfkit
const PDFDocument = require("pdfkit");
const Submission = require("../models/Submission");

/**
 * Service to dynamically generate a PDF report for a student's exam results.
 */
class PdfReportService {
  /**
   * Generates a PDF report and streams it directly to the Express response.
   * 
   * @param {string} submissionId - The MongoDB ID of the submission
   * @param {Object} res - The Express response object to pipe the PDF into
   */
  static async generateResultReport(submissionId, res) {
    try {
      // 1. Fetch the submission and aggressively populate the required details
      const submission = await Submission.findById(submissionId)
        .populate("studentId", "name email")
        .populate("examId", "title courseCode totalMarks duration");

      if (!submission) {
        throw new Error("Submission record not found.");
      }

      const { studentId: student, examId: exam, score, submittedAt } = submission;

      // Calculate percentage and determine Pass/Fail (Assuming 50% threshold)
      const totalMarks = exam.totalMarks || 100;
      const percentage = score !== null ? ((score / totalMarks) * 100).toFixed(1) : 0;
      const resultStatus = percentage >= 50 ? "PASS" : "FAIL";

      // 2. Initialize a new PDF document using PDFKit
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      // Pipe the PDF directly to the HTTP response stream so the user's browser downloads it instantly
      doc.pipe(res);

      // --- Header Section ---
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text("AcademiaPro Official Result Report", { align: 'center' })
        .moveDown(2);

      // --- Student Details Section ---
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text("Student Information")
        .moveTo(50, doc.y).lineTo(550, doc.y).stroke() // Draws a neat underline
        .moveDown(0.5);

      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Name: ${student.name}`)
        .text(`Email: ${student.email}`)
        .moveDown(1.5);

      // --- Exam Details Section ---
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text("Exam Details")
        .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
        .moveDown(0.5);

      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Course Code: ${exam.courseCode.toUpperCase()}`)
        .text(`Exam Title: ${exam.title}`)
        .text(`Allotted Duration: ${exam.duration} Minutes`)
        .text(`Submitted On: ${new Date(submittedAt).toLocaleString()}`)
        .moveDown(1.5);

      // --- Score & Result Status Section ---
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text("Performance Summary")
        .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
        .moveDown(0.5);

      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Score Obtained: ${score !== null ? score : "Pending"} / ${totalMarks}`)
        .text(`Percentage: ${score !== null ? percentage + '%' : "N/A"}`)
        .moveDown(1.5);

      // Highlight the Pass/Fail status with color and larger text
      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor(resultStatus === "PASS" ? "#16a34a" : "#dc2626") // Green or Red
        .text(`FINAL STATUS: ${resultStatus}`, { align: 'center' })
        .fillColor("black") // Reset color back to default
        .moveDown(4);

      // --- Footer Section ---
      doc
        .fontSize(10)
        .font('Helvetica-Oblique')
        .fillColor("gray")
        .text("This is an automatically generated electronic report and requires no physical signature.", { align: 'center' });

      // 3. Finalize the PDF (this closes the stream and finishes the download)
      doc.end();

    } catch (error) {
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }
}

module.exports = PdfReportService;
