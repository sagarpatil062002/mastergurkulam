const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function clearAndSeedData() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://sagarpatil062002_db_user:DIymNxxF7WS0UYjW@mastergurukulam.orcxtev.mongodb.net/?retryWrites=true&w=majority&appName=mastergurukulam";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('mastergurukulam');

    console.log('Connected to MongoDB');

    // Collections to clear (except admin_users)
    const collectionsToClear = [
      'contacts',
      'exam_registrations',
      'grievances',
      'exam_results',
      'activities',
      'videos',
      'testimonials',
      'newsletter',
      'notifications',
      'email_templates'
    ];

    // Clear all collections except admin_users
    for (const collectionName of collectionsToClear) {
      await db.collection(collectionName).deleteMany({});
      console.log(`Cleared ${collectionName}`);
    }

    // Keep admin users but clear and add sample admin
    await db.collection('admin_users').deleteMany({});

    // Hash password for admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insert sample admin user
    await db.collection('admin_users').insertOne({
      name: 'Admin User',
      email: 'admin@mastersgurukulam.com',
      password: hashedPassword,
      role: 'super_admin',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Added sample admin user');

    // Add sample courses
    const courses = [
      {
        title: 'UPSC Civil Services',
        slug: 'upsc-civil-services',
        duration: '2 Years',
        description: 'Comprehensive preparation for UPSC Civil Services Examination',
        image: '/placeholder-course.jpg',
        order: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'SSC CGL',
        slug: 'ssc-cgl',
        duration: '1 Year',
        description: 'Complete preparation for SSC Combined Graduate Level Examination',
        image: '/placeholder-course.jpg',
        order: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Bank PO',
        slug: 'bank-po',
        duration: '6 Months',
        description: 'Bank Probationary Officer examination preparation',
        image: '/placeholder-course.jpg',
        order: 3,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('courses').insertMany(courses);
    console.log('Added sample courses');

    // Add sample exams
    const exams = [
      {
        title: 'UPSC Prelims 2025',
        slug: 'upsc-prelims-2025',
        description: 'Union Public Service Commission Preliminary Examination 2025',
        banner: '/placeholder-exam.jpg',
        registrationStartDate: new Date('2024-12-01'),
        registrationEndDate: new Date('2025-01-31'),
        examDate: new Date('2025-05-16'),
        examFee: 100,
        centers: ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore'],
        languages: ['English', 'Hindi'],
        showResults: false,
        registrationOpen: true,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'SSC CGL 2025',
        slug: 'ssc-cgl-2025',
        description: 'Staff Selection Commission Combined Graduate Level Examination 2025',
        banner: '/placeholder-exam.jpg',
        registrationStartDate: new Date('2024-12-15'),
        registrationEndDate: new Date('2025-01-15'),
        examDate: new Date('2025-03-10'),
        examFee: 100,
        centers: ['Delhi', 'Mumbai', 'Chennai', 'Kolkata'],
        languages: ['English', 'Hindi'],
        showResults: false,
        registrationOpen: true,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('exams').insertMany(exams);
    console.log('Added sample exams');

    // Add sample exam registrations
    const examRegistrations = [
      {
        exam_id: (await db.collection('exams').findOne({ slug: 'upsc-prelims-2025' }))._id,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        mobile: '9876543210',
        dob: '1995-05-15',
        center: 'Delhi',
        language: 'English',
        paymentStatus: 'completed',
        paymentMethod: 'gateway',
        confirmationEmailSent: true,
        registrationNumber: 'REG-UPSC-001-2025',
        examFee: 100,
        razorpayOrderId: 'order_test_123',
        razorpayPaymentId: 'pay_test_456',
        paymentVerifiedAt: new Date(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        exam_id: (await db.collection('exams').findOne({ slug: 'ssc-cgl-2025' }))._id,
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        mobile: '9876543211',
        dob: '1998-08-20',
        center: 'Mumbai',
        language: 'Hindi',
        paymentStatus: 'completed',
        paymentMethod: 'gateway',
        confirmationEmailSent: true,
        registrationNumber: 'REG-SSC-001-2025',
        examFee: 100,
        razorpayOrderId: 'order_test_789',
        razorpayPaymentId: 'pay_test_012',
        paymentVerifiedAt: new Date(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    await db.collection('exam_registrations').insertMany(examRegistrations);
    console.log('Added sample exam registrations');

    // Add sample contacts/enquiries
    const contacts = [
      {
        name: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        mobile: '9876543212',
        message: 'Course: UPSC Civil Services',
        type: 'admission',
        status: 'new',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Sneha Gupta',
        email: 'sneha.gupta@example.com',
        mobile: '9876543213',
        message: 'I want to know more about SSC CGL course fees and duration.',
        type: 'general',
        status: 'new',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    await db.collection('contacts').insertMany(contacts);
    console.log('Added sample contacts');

    // Add sample grievances
    const grievances = [
      {
        exam_id: (await db.collection('exams').findOne({ slug: 'upsc-prelims-2025' }))._id,
        registration_id: (await db.collection('exam_registrations').findOne({ registrationNumber: 'REG-UPSC-001-2025' }))._id,
        description: 'I have not received my hall ticket yet. Please help.',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        exam_id: (await db.collection('exams').findOne({ slug: 'ssc-cgl-2025' }))._id,
        registration_id: (await db.collection('exam_registrations').findOne({ registrationNumber: 'REG-SSC-001-2025' }))._id,
        description: 'There was an issue with my payment. Amount was deducted but status shows pending.',
        status: 'resolved',
        adminReply: 'Your payment has been verified. Hall ticket will be sent shortly.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    await db.collection('grievances').insertMany(grievances);
    console.log('Added sample grievances');

    // Add sample exam results
    const examResults = [
      {
        exam_id: (await db.collection('exams').findOne({ slug: 'upsc-prelims-2025' }))._id,
        registrationNumber: 'REG-UPSC-001-2025',
        studentName: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        marks: 85,
        totalMarks: 100,
        percentage: 85.00,
        grade: 'A',
        status: 'pass',
        resultFile: 'https://example.com/results/rahul-sharma-result.pdf',
        answerBookFile: 'https://example.com/answer-books/rahul-sharma-answers.pdf',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        exam_id: (await db.collection('exams').findOne({ slug: 'ssc-cgl-2025' }))._id,
        registrationNumber: 'REG-SSC-001-2025',
        studentName: 'Priya Patel',
        email: 'priya.patel@example.com',
        marks: 92,
        totalMarks: 100,
        percentage: 92.00,
        grade: 'A+',
        status: 'pass',
        resultFile: 'https://example.com/results/priya-patel-result.pdf',
        answerBookFile: 'https://example.com/answer-books/priya-patel-answers.pdf',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('exam_results').insertMany(examResults);
    console.log('Added sample exam results');

    // Add sample testimonials
    const testimonials = [
      {
        name: 'Vikram Singh',
        course: 'UPSC Civil Services',
        message: 'Excellent coaching and study materials. Helped me clear prelims in first attempt.',
        image: '/placeholder-user.jpg',
        rating: 5,
        order: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Anjali Mehta',
        course: 'SSC CGL',
        message: 'Great faculty and supportive environment. Highly recommended for competitive exams.',
        image: '/placeholder-user.jpg',
        rating: 5,
        order: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('testimonials').insertMany(testimonials);
    console.log('Added sample testimonials');

    // Add sample activities
    const activities = [
      {
        title: 'Mock Test Series Launch',
        description: 'New comprehensive mock test series for UPSC 2025 aspirants launched today.',
        images: ['/placeholder-activity.jpg'],
        category: 'Academic',
        tags: ['UPSC', 'Mock Test', '2025'],
        date: new Date(),
        order: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Career Guidance Seminar',
        description: 'Interactive session with successful candidates sharing their journey and tips.',
        images: ['/placeholder-activity.jpg'],
        category: 'Seminar',
        tags: ['Career', 'Guidance', 'Success Stories'],
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        order: 2,
        active: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    await db.collection('activities').insertMany(activities);
    console.log('Added sample activities');

    // Add sample email templates
    const emailTemplates = [
      {
        name: 'Exam Registration Confirmation',
        subject: 'Exam Registration Confirmed - {{examTitle}}',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Exam Registration Confirmed!</h2>
            <p>Dear {{studentName}},</p>
            <p>Your registration for <strong>{{examTitle}}</strong> has been successfully confirmed.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Registration Details:</h3>
              <p><strong>Registration Number:</strong> {{registrationNumber}}</p>
              <p><strong>Exam:</strong> {{examTitle}}</p>
              <p><strong>Exam Date:</strong> {{examDate}}</p>
              <p><strong>Center:</strong> {{center}}</p>
              <p><strong>Language:</strong> {{language}}</p>
              <p><strong>Fee Paid:</strong> ₹{{examFee}}</p>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h4 style="margin: 0 0 10px 0; color: #92400e;">Important Instructions:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                <li>Your hall ticket will be sent 7 days before the exam</li>
                <li>Keep your registration number safe for future reference</li>
                <li>Check your email regularly for updates</li>
                <li>Contact us if you have any questions</li>
              </ul>
            </div>

            <p>Best regards,<br>Master's Gurukulam Team</p>
          </div>
        `,
        type: 'registration',
        variables: ['studentName', 'examTitle', 'registrationNumber', 'examDate', 'center', 'language', 'examFee'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Hall Ticket Email',
        subject: 'Your Hall Ticket - {{examTitle}}',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Your Hall Ticket is Ready!</h2>
            <p>Dear {{studentName}},</p>
            <p>Your hall ticket for the upcoming exam has been generated. Please find the details below:</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Exam Details:</h3>
              <p><strong>Registration Number:</strong> {{registrationNumber}}</p>
              <p><strong>Exam:</strong> {{examTitle}}</p>
              <p><strong>Date:</strong> {{examDate}}</p>
              <p><strong>Center:</strong> {{center}}</p>
              <p><strong>Language:</strong> {{language}}</p>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h4 style="margin: 0 0 10px 0; color: #92400e;">Important Instructions:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                <li>Arrive at the exam center at least 30 minutes before the scheduled time</li>
                <li>Bring a valid photo ID proof along with this hall ticket</li>
                <li>Electronic devices are not allowed in the exam hall</li>
                <li>Follow all instructions given by the exam invigilators</li>
              </ul>
            </div>

            <p>You can also download your hall ticket from our website using your registration number.</p>
            <p>Best regards,<br>Master's Gurukulam Team</p>
          </div>
        `,
        type: 'admit_card',
        variables: ['studentName', 'registrationNumber', 'examTitle', 'examDate', 'center', 'language'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Grievance Status Update',
        subject: 'Grievance Status Update - Master\'s Gurukulam',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Grievance Status Update</h2>
            <p>Dear Student,</p>
            <p>We have updated the status of your grievance. Here are the details:</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Grievance Details:</h3>
              <p><strong>Grievance ID:</strong> {{grievanceId}}</p>
              <p><strong>Description:</strong> {{description}}</p>
              <p><strong>Status:</strong> <span style="color: {{statusColor}}; font-weight: bold;">{{status}}</span></p>
              <p><strong>Updated on:</strong> {{updatedDate}}</p>
            </div>

            {{#if resolved}}
              <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #065f46;">Your grievance has been resolved. If you have any further concerns, please contact us.</p>
              </div>
            {{/if}}

            {{#if rejected}}
              <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <p style="margin: 0; color: #991b1b;">Your grievance has been reviewed and unfortunately could not be resolved at this time. Please contact us for more information.</p>
              </div>
            {{/if}}

            {{#if pending}}
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e;">Your grievance is still under review. We will update you once there is further progress.</p>
              </div>
            {{/if}}

            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>Master's Gurukulam Support Team</p>
          </div>
        `,
        type: 'grievance',
        variables: ['grievanceId', 'description', 'status', 'statusColor', 'updatedDate', 'resolved', 'rejected', 'pending'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Admission Enquiry Confirmation',
        subject: 'Admission Enquiry Received - Master\'s Gurukulam',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Admission Enquiry Received</h2>
            <p>Dear {{studentName}},</p>
            <p>Thank you for your interest in Master's Gurukulam. We have received your enquiry for admission.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Enquiry Details:</h3>
              <p><strong>Registration Number:</strong> {{registrationNumber}}</p>
              <p><strong>Course:</strong> {{course}}</p>
              <p><strong>Email:</strong> {{email}}</p>
              <p><strong>Mobile:</strong> {{mobile}}</p>
            </div>

            <p>Our admission team will contact you within 24-48 hours with detailed information about the course, fees, and admission process.</p>

            <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
              <h4 style="margin: 0 0 10px 0; color: #0c4a6e;">What happens next?</h4>
              <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
                <li>Our counsellor will call you to understand your requirements</li>
                <li>You will receive detailed course information and brochure</li>
                <li>Schedule a visit to our campus if interested</li>
                <li>Complete admission formalities</li>
              </ul>
            </div>

            <p>For immediate assistance, you can call us at +91-XXXXXXXXXX or reply to this email.</p>
            <p>Best regards,<br>Master's Gurukulam Admission Team</p>
          </div>
        `,
        type: 'admission',
        variables: ['studentName', 'registrationNumber', 'course', 'email', 'mobile'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Contact Form Acknowledgment',
        subject: 'We received your message - Master\'s Gurukulam',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Thank you for contacting us</h2>
            <p>Dear {{name}},</p>
            <p>Thank you for reaching out to Master's Gurukulam. We have received your message and will get back to you soon.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Your Message:</h3>
              <p><strong>Name:</strong> {{name}}</p>
              <p><strong>Email:</strong> {{email}}</p>
              <p><strong>Mobile:</strong> {{mobile}}</p>
              <p><strong>Message:</strong></p>
              <div style="background: white; padding: 10px; border-radius: 4px; margin-top: 10px;">
                {{message}}
              </div>
            </div>

            <p>Our team typically responds within 24 hours. If you have any urgent queries, please call us at +91-XXXXXXXXXX.</p>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <h4 style="margin: 0 0 10px 0; color: #0c4a6e;">Connect with us:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
                <li>Website: www.mastersgurukulam.com</li>
                <li>Email: info@mastersgurukulam.com</li>
                <li>Phone: +91-XXXXXXXXXX</li>
              </ul>
            </div>

            <p>Best regards,<br>Master's Gurukulam Team</p>
          </div>
        `,
        type: 'confirmation',
        variables: ['name', 'email', 'mobile', 'message'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('email_templates').insertMany(emailTemplates);
    console.log('Added sample email templates');

    console.log('✅ Database cleared and seeded with sample data successfully!');
    console.log('\n📋 Sample Admin Credentials:');
    console.log('Email: admin@mastersgurukulam.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

clearAndSeedData();