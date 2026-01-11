const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(to, subject, html, text = null, attachments = []) {
    try {
      const mailOptions = {
        from: `"${process.env.HOSPITAL_NAME || 'Hospital Management'}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
        attachments: attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      
      // Log attachment info if present
      if (attachments && attachments.length > 0) {
        console.log('📎 Email attachments:', attachments.map(att => att.filename).join(', '));
      }
      
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Helper method to safely convert ObjectId to string and get short ID
  getShortId(objectId) {
    try {
      if (!objectId) return 'N/A';
      const idString = typeof objectId === 'string' ? objectId : objectId.toString();
      return idString.slice(-6).toUpperCase();
    } catch (error) {
      console.warn('⚠️ Error converting ObjectId to string:', error);
      return 'N/A';
    }
  }

  // Payment confirmation email with PDF receipt
  async sendPaymentConfirmationWithPDF(patient, bill, paymentDetails) {
    try {
      const subject = 'Payment Confirmation & Receipt';
      
      // Generate PDF receipt
      const pdfService = require('./pdfService');
      const pdfResult = await pdfService.generatePaymentReceiptPDF(patient, bill, paymentDetails);
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Payment Successful!</h2>
          <p>Dear ${patient.userId?.name || patient.name},</p>
          <p>Thank you for your payment. Your transaction has been processed successfully.</p>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #059669;">
            <h3 style="color: #059669; margin-top: 0;">Payment Receipt</h3>
            <p><strong>Receipt ID:</strong> ${this.getShortId(bill._id)}</p>
            <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Amount Paid:</strong> ₹${bill.amount}</p>
            <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod || 'Card'}</p>
            <p><strong>Transaction ID:</strong> ${paymentDetails.paymentIntentId || 'N/A'}</p>
            <p><strong>Description:</strong> ${bill.description}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📎 Attached Documents:</strong></p>
            <ul>
              <li>📄 Payment Receipt (PDF) - Official receipt for your records</li>
            </ul>
          </div>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Hospital Information:</strong></p>
            <p>${process.env.HOSPITAL_NAME || 'HealthCare Excellence Medical Center'}</p>
            <p>Phone: ${process.env.HOSPITAL_PHONE || '(555) 123-4567'}</p>
          </div>
          
          <p>Please keep the attached receipt for your records. If you have any questions about this payment, please contact our billing department.</p>
          
          <p>Thank you for choosing our healthcare services!</p>
          
          <p>Best regards,<br>${process.env.HOSPITAL_NAME || 'Hospital Management Team'}</p>
        </div>
      `;
      
      // Prepare attachments
      const attachments = [];
      if (pdfResult.success) {
        attachments.push({
          filename: `Payment_Receipt_${this.getShortId(bill._id)}.pdf`,
          content: pdfResult.buffer,
          contentType: 'application/pdf'
        });
      }
      
      return await this.sendEmail(patient.userId?.email || patient.email, subject, html, null, attachments);
    } catch (error) {
      console.error('❌ Payment confirmation email with PDF failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Prescription email with PDF
  async sendPrescriptionWithPDF(patient, prescription, doctor) {
    try {
      const subject = 'New Prescription Available';
      
      // Generate PDF prescription
      const pdfService = require('./pdfService');
      const pdfResult = await pdfService.generatePrescriptionPDF(patient, prescription, doctor);
      
      const medicineList = prescription.medicines.map(med => `${med.name} - ${med.dosage} (${med.frequency})`).join(', ');
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">New Prescription from Dr. ${doctor.userId?.name}</h2>
          <p>Dear ${patient.userId?.name},</p>
          <p>Dr. ${doctor.userId?.name} has prescribed the following medications for you:</p>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Prescribed Medications:</h3>
            <p><strong>Medicines:</strong> ${medicineList}</p>
            ${prescription.notes ? `<p><strong>Instructions:</strong> ${prescription.notes}</p>` : ''}
          </div>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📎 Attached Documents:</strong></p>
            <ul>
              <li>📄 Prescription (PDF) - Official prescription for pharmacy</li>
            </ul>
          </div>
          
          <p>Please visit the pharmacy to collect your medications. Bring your ID and the attached prescription.</p>
          <p><strong>Prescription ID:</strong> ${this.getShortId(prescription._id)}</p>
          
          <p>If you have any questions about your prescription, please contact us.</p>
          
          <p>Best regards,<br>${process.env.HOSPITAL_NAME || 'Hospital Management Team'}</p>
        </div>
      `;
      
      // Prepare attachments
      const attachments = [];
      if (pdfResult.success) {
        attachments.push({
          filename: `Prescription_${this.getShortId(prescription._id)}.pdf`,
          content: pdfResult.buffer,
          contentType: 'application/pdf'
        });
      }
      
      return await this.sendEmail(patient.userId?.email || patient.email, subject, html, null, attachments);
    } catch (error) {
      console.error('❌ Prescription email with PDF failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Original payment confirmation (fallback)
  async sendPaymentConfirmation(patient, bill, paymentDetails) {
    const subject = 'Payment Confirmation & Receipt';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Payment Successful!</h2>
        <p>Dear ${patient.userId?.name || patient.name},</p>
        <p>Thank you for your payment. Your transaction has been processed successfully.</p>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #059669;">
          <h3 style="color: #059669; margin-top: 0;">Payment Receipt</h3>
          <p><strong>Receipt ID:</strong> ${this.getShortId(bill._id)}</p>
          <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Amount Paid:</strong> ₹${bill.amount}</p>
          <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod || 'Card'}</p>
          <p><strong>Transaction ID:</strong> ${paymentDetails.paymentIntentId || 'N/A'}</p>
          <p><strong>Description:</strong> ${bill.description}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Hospital Information:</strong></p>
          <p>${process.env.HOSPITAL_NAME || 'HealthCare Excellence Medical Center'}</p>
          <p>Phone: ${process.env.HOSPITAL_PHONE || '(555) 123-4567'}</p>
        </div>
        
        <p>Please keep this receipt for your records. If you have any questions about this payment, please contact our billing department.</p>
        
        <p>Thank you for choosing our healthcare services!</p>
        
        <p>Best regards,<br>${process.env.HOSPITAL_NAME || 'Hospital Management Team'}</p>
      </div>
    `;
    
    return await this.sendEmail(patient.userId?.email || patient.email, subject, html);
  }

  // Other email functions (keeping existing ones)
  async sendAppointmentConfirmation(patient, appointment, doctor) {
    const subject = 'Appointment Confirmation';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Confirmed</h2>
        <p>Dear ${patient.userId?.name},</p>
        <p>Your appointment has been confirmed with the following details:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Doctor:</strong> ${doctor.userId?.name}</p>
          <p><strong>Specialization:</strong> ${doctor.specialization}</p>
          <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Reason:</strong> ${appointment.reason}</p>
        </div>
        
        <p>Please arrive 15 minutes before your scheduled time.</p>
        <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
        
        <p>Best regards,<br>${process.env.HOSPITAL_NAME || 'Hospital Management Team'}</p>
      </div>
    `;
    
    return await this.sendEmail(patient.userId?.email, subject, html);
  }

  async sendAppointmentCompletionEmail(patient, appointment, doctor) {
    const subject = 'Appointment Completed - Medical Records Updated';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Appointment Completed Successfully</h2>
        <p>Dear ${patient.userId?.name},</p>
        <p>Your appointment with Dr. ${doctor.userId?.name} has been completed successfully.</p>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Appointment Details:</h3>
          <p><strong>Doctor:</strong> Dr. ${doctor.userId?.name}</p>
          <p><strong>Specialization:</strong> ${doctor.specialization}</p>
          <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Status:</strong> Completed</p>
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Next Steps:</h3>
          <ul>
            <li>Your medical records have been updated</li>
            <li>Check your patient portal for detailed medical records</li>
            <li>Review any prescriptions provided by your doctor</li>
            <li>Complete payment for any outstanding bills</li>
            <li>Schedule follow-up appointments if recommended</li>
          </ul>
        </div>
        
        <p>If you have any questions about your treatment or need clarification, please don't hesitate to contact us.</p>
        
        <p>Thank you for choosing our healthcare services!</p>
        
        <p>Best regards,<br>${process.env.HOSPITAL_NAME || 'Hospital Management Team'}</p>
      </div>
    `;
    
    return await this.sendEmail(patient.userId?.email, subject, html);
  }

  // Welcome email for new patients
  async sendWelcomeEmail(patient) {
    const subject = 'Welcome to Our Hospital Management System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Welcome to ${process.env.HOSPITAL_NAME || 'Our Hospital'}!</h2>
        <p>Dear ${patient.userId?.name || patient.name},</p>
        <p>Welcome to our hospital management system! Your patient account has been successfully created.</p>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #059669;">
          <h3 style="color: #059669; margin-top: 0;">Your Account Details</h3>
          <p><strong>Patient ID:</strong> ${this.getShortId(patient._id)}</p>
          <p><strong>Email:</strong> ${patient.userId?.email || patient.email}</p>
          <p><strong>Phone:</strong> ${patient.phone || 'Not provided'}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4>What you can do with your account:</h4>
          <ul>
            <li>📅 Book appointments with our doctors</li>
            <li>💊 View your prescriptions and medical history</li>
            <li>💳 Manage your billing and payments</li>
            <li>📱 Receive appointment reminders and notifications</li>
            <li>📋 Access your medical reports</li>
          </ul>
        </div>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Hospital Information:</strong></p>
          <p>${process.env.HOSPITAL_NAME || 'HealthCare Excellence Medical Center'}</p>
          <p>Phone: ${process.env.HOSPITAL_PHONE || '(555) 123-4567'}</p>
          <p>Website: ${process.env.FRONTEND_URL || 'http://localhost:3000'}</p>
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <p>Thank you for choosing our healthcare services!</p>
        
        <p>Best regards,<br>${process.env.HOSPITAL_NAME || 'Hospital Management Team'}</p>
      </div>
    `;
    
    return await this.sendEmail(patient.userId?.email || patient.email, subject, html);
  }

  // Welcome email for new doctors
  async sendDoctorWelcomeEmail(doctor) {
    const subject = 'Welcome to Our Medical Team';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Our Medical Team!</h2>
        <p>Dear Dr. ${doctor.userId?.name || doctor.name},</p>
        <p>Welcome to ${process.env.HOSPITAL_NAME || 'our hospital'}! We are excited to have you join our medical team.</p>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #2563eb;">
          <h3 style="color: #2563eb; margin-top: 0;">Your Doctor Profile</h3>
          <p><strong>Doctor ID:</strong> ${this.getShortId(doctor._id)}</p>
          <p><strong>Specialization:</strong> ${doctor.specialization}</p>
          <p><strong>Department:</strong> ${doctor.department?.name || 'Not assigned'}</p>
          <p><strong>Consultation Fee:</strong> $${doctor.consultationFee}</p>
          <p><strong>Email:</strong> ${doctor.userId?.email || doctor.email}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4>Your doctor portal includes:</h4>
          <ul>
            <li>📅 Manage your appointment schedule</li>
            <li>👥 View and manage patient records</li>
            <li>💊 Create and manage prescriptions</li>
            <li>📋 Access medical history and reports</li>
            <li>📊 View your performance analytics</li>
            <li>🔔 Receive appointment notifications</li>
          </ul>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4>Next Steps:</h4>
          <ol>
            <li>Log in to your doctor portal at ${process.env.FRONTEND_URL || 'http://localhost:3000'}</li>
            <li>Complete your profile and set your availability</li>
            <li>Review the hospital policies and procedures</li>
            <li>Contact IT support if you need any technical assistance</li>
          </ol>
        </div>
        
        <p>We look forward to working with you to provide excellent patient care!</p>
        
        <p>Best regards,<br>Hospital Administration<br>${process.env.HOSPITAL_NAME || 'Hospital Management Team'}</p>
      </div>
    `;
    
    return await this.sendEmail(doctor.userId?.email || doctor.email, subject, html);
  }

  // Welcome email for new receptionists
  async sendReceptionistWelcomeEmail(receptionist) {
    const subject = 'Welcome to Our Hospital Team';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Welcome to Our Hospital Team!</h2>
        <p>Dear ${receptionist.userId?.name || receptionist.name},</p>
        <p>Welcome to ${process.env.HOSPITAL_NAME || 'our hospital'}! We are pleased to have you join our reception team.</p>
        
        <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #7c3aed;">
          <h3 style="color: #7c3aed; margin-top: 0;">Your Employment Details</h3>
          <p><strong>Employee ID:</strong> ${receptionist.employeeId}</p>
          <p><strong>Department:</strong> ${receptionist.department}</p>
          <p><strong>Shift:</strong> ${receptionist.shift}</p>
          <p><strong>Email:</strong> ${receptionist.userId?.email || receptionist.email}</p>
          <p><strong>Phone:</strong> ${receptionist.phone || 'Not provided'}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4>Your responsibilities include:</h4>
          <ul>
            <li>📞 Managing patient appointments and inquiries</li>
            <li>👥 Registering new patients</li>
            <li>📋 Maintaining patient records</li>
            <li>💳 Processing payments and billing</li>
            <li>🏥 Managing the patient queue</li>
            <li>📊 Generating reports and analytics</li>
          </ul>
        </div>
        
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4>Getting Started:</h4>
          <ol>
            <li>Log in to your receptionist portal at ${process.env.FRONTEND_URL || 'http://localhost:3000'}</li>
            <li>Familiarize yourself with the patient management system</li>
            <li>Review the hospital procedures and protocols</li>
            <li>Contact your supervisor for any training needs</li>
          </ol>
        </div>
        
        <p>We appreciate your commitment to providing excellent patient service!</p>
        
        <p>Best regards,<br>Human Resources<br>${process.env.HOSPITAL_NAME || 'Hospital Management Team'}</p>
      </div>
    `;
    
    return await this.sendEmail(receptionist.userId?.email || receptionist.email, subject, html);
  }
}

module.exports = new EmailService();