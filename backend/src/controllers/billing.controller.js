const Billing = require('../models/Billing');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

/* ================================
   CREATE BILL
   (Admin / Receptionist)
================================ */
exports.createBill = async (req, res) => {
  try {
    const { appointmentId, patientId, amount, description } = req.body;

    if (!appointmentId || !patientId || !amount) {
      return res.status(400).json({ message: 'Missing required fields: appointmentId, patientId, amount' });
    }

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const bill = await Billing.create({
      appointmentId,
      patientId,
      doctorId: appointment.doctorId,
      amount,
      description: description || 'Medical consultation',
      paymentStatus: 'unpaid'
    });

    const populatedBill = await Billing.findById(bill._id)
      .populate('appointmentId')
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    res.status(201).json(populatedBill);
  } catch (err) {
    console.error('Create bill error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET ALL BILLS
   (Admin)
================================ */
exports.getBills = async (req, res) => {
  try {
    const bills = await Billing.find()
      .populate('appointmentId')
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (err) {
    console.error('Get bills error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET PATIENT BILLS
   (Patient)
================================ */
exports.getMyBills = async (req, res) => {
  try {
    console.log('=== GET MY BILLS DEBUG ===');
    console.log('User ID from token:', req.user.id);
    
    // First, find the patient record for this user
    const patient = await Patient.findOne({ userId: req.user.id });
    console.log('Patient record found:', !!patient);
    if (!patient) {
      console.log('Patient profile not found for user:', req.user.id);
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    console.log('Patient ID:', patient._id);
    
    // Query billing using the patient's _id (not user ID)
    const bills = await Billing.find({ patientId: patient._id })
      .populate('appointmentId')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    console.log('Bills found for patient:', bills.length);
    console.log('Bills data:', bills.map(b => ({
      id: b._id,
      patientId: b.patientId,
      amount: b.amount,
      status: b.paymentStatus,
      appointmentId: b.appointmentId
    })));

    res.json(bills);
  } catch (err) {
    console.error('Get my bills error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   PROCESS PAYMENT (Patient)
   (Patient)
================================ */
exports.processPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    // Find the bill
    const bill = await Billing.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Find the patient record for this user
    const patient = await Patient.findOne({ userId: req.user.id })
      .populate('userId', 'name email');
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Verify the bill belongs to the patient (check against patient ID)
    if (bill.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if already paid
    if (bill.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Bill is already paid' });
    }

    // Process payment (in real app, integrate with payment processor)
    const updatedBill = await Billing.findByIdAndUpdate(
      req.params.id,
      { 
        paymentStatus: 'paid',
        paymentMethod: paymentMethod || 'card',
        paidAt: new Date()
      },
      { new: true }
    ).populate('appointmentId')
     .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    // Send payment confirmation email with PDF receipt
    try {
      console.log('📧 Sending payment confirmation email with PDF receipt...');
      const emailService = require('../services/emailService');
      
      const paymentDetails = {
        paymentMethod: paymentMethod || 'card',
        paymentIntentId: `pay_${Date.now()}`, // Generate a transaction ID
        transactionDate: new Date()
      };
      
      const emailResult = await emailService.sendPaymentConfirmationWithPDF(
        patient,
        updatedBill,
        paymentDetails
      );
      
      if (emailResult.success) {
        console.log('✅ Payment confirmation email sent successfully');
      } else {
        console.error('❌ Payment confirmation email failed:', emailResult.error);
        // Try fallback email without PDF
        await emailService.sendPaymentConfirmation(patient, updatedBill, paymentDetails);
      }
    } catch (emailError) {
      console.error('❌ Payment email error:', emailError);
      // Don't fail the payment if email fails
    }

    res.json(updatedBill);
  } catch (err) {
    console.error('Process payment error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   MARK BILL AS PAID
   (Admin / Receptionist)
================================ */
exports.markAsPaid = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const bill = await Billing.findByIdAndUpdate(
      req.params.id,
      { 
        paymentStatus: 'paid',
        paymentMethod: paymentMethod || 'cash',
        paidAt: new Date()
      },
      { new: true }
    ).populate('appointmentId')
     .populate('patientId', 'name email')
     .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (err) {
    console.error('Mark as paid error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET BILLING ANALYTICS
   (Admin)
================================ */
exports.getBillingAnalytics = async (req, res) => {
  try {
    const totalRevenue = await Billing.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingRevenue = await Billing.aggregate([
      { $match: { paymentStatus: 'unpaid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyRevenue = await Billing.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingRevenue: pendingRevenue[0]?.total || 0,
      monthlyRevenue
    });
  } catch (err) {
    console.error('Billing analytics error:', err);
    res.status(500).json({ message: err.message });
  }
};