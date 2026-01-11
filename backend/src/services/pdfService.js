const PDFDocument = require('pdfkit');

class PDFService {
  
  // Generate payment receipt PDF
  async generatePaymentReceiptPDF(patient, bill, paymentDetails) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve({ success: true, buffer: pdfBuffer });
        });
        
        doc.on('error', (error) => {
          reject({ success: false, error: error.message });
        });
        
        // Header
        doc.fontSize(20)
           .fillColor('#059669')
           .text(process.env.HOSPITAL_NAME || 'HealthCare Excellence Medical Center', 50, 50);
        
        doc.fontSize(12)
           .fillColor('#666666')
           .text('Payment Receipt', 50, 80)
           .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 95);
        
        // Receipt details box
        doc.rect(50, 120, 500, 200)
           .stroke('#059669');
        
        doc.fontSize(16)
           .fillColor('#059669')
           .text('PAYMENT RECEIPT', 70, 140);
        
        // Receipt information
        const receiptInfo = [
          ['Receipt ID:', bill._id.toString().slice(-6).toUpperCase()],
          ['Patient Name:', patient.userId?.name || patient.name || 'N/A'],
          ['Patient Email:', patient.userId?.email || patient.email || 'N/A'],
          ['Payment Date:', new Date().toLocaleDateString()],
          ['Amount Paid:', `₹${bill.amount}`],
          ['Payment Method:', paymentDetails.paymentMethod || 'Card'],
          ['Transaction ID:', paymentDetails.paymentIntentId || 'N/A'],
          ['Description:', bill.description || 'Medical services'],
          ['Status:', 'PAID']
        ];
        
        let yPosition = 170;
        doc.fontSize(11).fillColor('#333333');
        
        receiptInfo.forEach(([label, value]) => {
          doc.text(label, 70, yPosition, { width: 120, align: 'left' })
             .text(value, 200, yPosition, { width: 300, align: 'left' });
          yPosition += 15;
        });
        
        // Payment summary
        doc.rect(50, 340, 500, 80)
           .fillAndStroke('#f0fdf4', '#059669');
        
        doc.fontSize(14)
           .fillColor('#059669')
           .text('Payment Summary', 70, 360);
        
        doc.fontSize(12)
           .fillColor('#333333')
           .text(`Total Amount: ₹${bill.amount}`, 70, 380)
           .text(`Payment Status: COMPLETED`, 70, 395);
        
        // Footer
        doc.fontSize(10)
           .fillColor('#666666')
           .text('Thank you for choosing our healthcare services!', 50, 450)
           .text('Please keep this receipt for your records.', 50, 465)
           .text(`Hospital Phone: ${process.env.HOSPITAL_PHONE || '(555) 123-4567'}`, 50, 480)
           .text(`Website: ${process.env.FRONTEND_URL || 'www.hospital.com'}`, 50, 495);
        
        // Barcode-like element (simple lines for receipt ID)
        doc.fontSize(8)
           .text(`Receipt ID: ${bill._id.toString().slice(-6).toUpperCase()}`, 400, 450);
        
        // Add some decorative lines
        for (let i = 0; i < 20; i++) {
          doc.rect(400 + (i * 5), 465, 2, 15).fill('#333333');
        }
        
        doc.end();
      });
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Generate prescription PDF
  async generatePrescriptionPDF(patient, prescription, doctor) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve({ success: true, buffer: pdfBuffer });
        });
        
        doc.on('error', (error) => {
          reject({ success: false, error: error.message });
        });
        
        // Header
        doc.fontSize(20)
           .fillColor('#2563eb')
           .text(process.env.HOSPITAL_NAME || 'HealthCare Excellence Medical Center', 50, 50);
        
        doc.fontSize(14)
           .fillColor('#666666')
           .text('MEDICAL PRESCRIPTION', 50, 80)
           .text(`Date: ${new Date().toLocaleDateString()}`, 50, 100);
        
        // Doctor information
        doc.rect(50, 130, 240, 120)
           .stroke('#2563eb');
        
        doc.fontSize(12)
           .fillColor('#2563eb')
           .text('PRESCRIBING DOCTOR', 60, 145);
        
        doc.fontSize(10)
           .fillColor('#333333')
           .text(`Dr. ${doctor.userId?.name || doctor.name}`, 60, 165)
           .text(`Specialization: ${doctor.specialization}`, 60, 180)
           .text(`License: ${doctor.licenseNumber || 'N/A'}`, 60, 195)
           .text(`Phone: ${doctor.phone || process.env.HOSPITAL_PHONE}`, 60, 210)
           .text(`Email: ${doctor.userId?.email}`, 60, 225);
        
        // Patient information
        doc.rect(310, 130, 240, 120)
           .stroke('#2563eb');
        
        doc.fontSize(12)
           .fillColor('#2563eb')
           .text('PATIENT INFORMATION', 320, 145);
        
        doc.fontSize(10)
           .fillColor('#333333')
           .text(`Name: ${patient.userId?.name || patient.name}`, 320, 165)
           .text(`Patient ID: ${patient._id.toString().slice(-6).toUpperCase()}`, 320, 180)
           .text(`Age: ${patient.age || 'N/A'}`, 320, 195)
           .text(`Gender: ${patient.gender || 'N/A'}`, 320, 210)
           .text(`Phone: ${patient.phone || 'N/A'}`, 320, 225);
        
        // Prescription details
        doc.fontSize(14)
           .fillColor('#2563eb')
           .text('PRESCRIPTION DETAILS', 50, 280);
        
        doc.fontSize(10)
           .fillColor('#666666')
           .text(`Prescription ID: ${prescription._id.toString().slice(-6).toUpperCase()}`, 50, 300)
           .text(`Date Prescribed: ${new Date(prescription.createdAt).toLocaleDateString()}`, 50, 315);
        
        // Medicines table
        doc.rect(50, 340, 500, 30)
           .fillAndStroke('#f1f5f9', '#2563eb');
        
        doc.fontSize(11)
           .fillColor('#2563eb')
           .text('Medicine Name', 60, 350, { width: 120 })
           .text('Dosage', 180, 350, { width: 80 })
           .text('Frequency', 260, 350, { width: 100 })
           .text('Duration', 360, 350, { width: 80 })
           .text('Instructions', 440, 350, { width: 100 });
        
        let yPos = 380;
        doc.fontSize(10).fillColor('#333333');
        
        prescription.medicines.forEach((medicine, index) => {
          if (yPos > 700) { // Start new page if needed
            doc.addPage();
            yPos = 50;
          }
          
          // Alternate row colors
          if (index % 2 === 0) {
            doc.rect(50, yPos - 5, 500, 20).fill('#f8fafc');
          }
          
          doc.text(medicine.name || 'N/A', 60, yPos, { width: 115 })
             .text(medicine.dosage || 'N/A', 180, yPos, { width: 75 })
             .text(medicine.frequency || 'N/A', 260, yPos, { width: 95 })
             .text(medicine.duration || 'N/A', 360, yPos, { width: 75 })
             .text(medicine.instructions || 'N/A', 440, yPos, { width: 95 });
          
          yPos += 25;
        });
        
        // Additional notes
        if (prescription.notes) {
          yPos += 20;
          doc.fontSize(12)
             .fillColor('#2563eb')
             .text('ADDITIONAL NOTES:', 50, yPos);
          
          doc.fontSize(10)
             .fillColor('#333333')
             .text(prescription.notes, 50, yPos + 20, { width: 500 });
        }
        
        // Footer with signature area
        const footerY = Math.max(yPos + 80, 650);
        
        doc.rect(50, footerY, 500, 100)
           .stroke('#e5e7eb');
        
        doc.fontSize(10)
           .fillColor('#666666')
           .text('Doctor Signature: ________________________', 60, footerY + 20)
           .text(`Dr. ${doctor.userId?.name}`, 60, footerY + 40)
           .text(`Date: ${new Date().toLocaleDateString()}`, 60, footerY + 55);
        
        doc.text('Pharmacy Use Only:', 300, footerY + 20)
           .text('Dispensed by: ________________', 300, footerY + 40)
           .text('Date: ________________', 300, footerY + 55);
        
        // Warning text
        doc.fontSize(8)
           .fillColor('#dc2626')
           .text('⚠️ This prescription is valid for 30 days from the date of issue.', 50, footerY + 80)
           .text('⚠️ Do not exceed the prescribed dosage. Consult your doctor for any concerns.', 50, footerY + 90);
        
        doc.end();
      });
    } catch (error) {
      console.error('❌ Prescription PDF generation error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Generate medical report PDF
  async generateMedicalReportPDF(patient, medicalRecord, doctor) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve({ success: true, buffer: pdfBuffer });
        });
        
        doc.on('error', (error) => {
          reject({ success: false, error: error.message });
        });
        
        // Header
        doc.fontSize(20)
           .fillColor('#059669')
           .text(process.env.HOSPITAL_NAME || 'HealthCare Excellence Medical Center', 50, 50);
        
        doc.fontSize(14)
           .fillColor('#666666')
           .text('MEDICAL REPORT', 50, 80)
           .text(`Report Date: ${new Date().toLocaleDateString()}`, 50, 100);
        
        // Patient and doctor info (similar to prescription)
        // ... (implement similar structure as prescription)
        
        // Medical record details
        doc.fontSize(14)
           .fillColor('#059669')
           .text('MEDICAL EXAMINATION REPORT', 50, 150);
        
        // Add diagnosis, symptoms, treatment, vitals, etc.
        // ... (implement detailed medical report structure)
        
        doc.end();
      });
    } catch (error) {
      console.error('❌ Medical report PDF generation error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PDFService();