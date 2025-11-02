# Master's Gurukulam - Complete Website & Admin Dashboard

A high-performance, full-stack educational platform built with Next.js, React, Node.js, and MongoDB.

## Features

### Frontend
- **Home Page**: Hero section, courses showcase, facilities, testimonials, quick links
- **About Page**: Academy overview, faculty directory, facilities gallery, programs
- **Exams Page**: Exam registration, result checking, grievance filing
- **Activities Page**: Photo gallery with lightbox, category filtering, image carousel
- **Contact Page**: Contact form, location, business hours
- **Responsive Design**: Mobile-first, optimized for all devices

### Admin Dashboard
- **Secure Authentication**: Email/password login
- **Course Management**: Add, edit, delete courses
- **Faculty Management**: Manage faculty profiles with photos and qualifications
- **Facilities Management**: Manage facility images and descriptions
- **Testimonials Management**: Add and manage student testimonials
- **Exam Management**: Create exams, manage registrations, handle grievances
- **Activities Management**: Upload and organize activity photos
- **Contact Messages**: View and manage contact form submissions
- **Registrations Management**: View exam registrations with CSV export
- **Grievance Management**: Track and respond to student grievances

### Technical Highlights
- **Lightweight Stack**: Minimal dependencies for maximum performance
- **MongoDB**: Optimized database with proper indexing
- **API Routes**: Efficient server-side endpoints
- **Email Automation**: Automated confirmation and notification emails
- **Caching**: HTTP caching headers for fast content delivery
- **SEO Ready**: Meta tags, semantic HTML, structured data
- **Type-Safe**: Full TypeScript support

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Gmail account with app-specific password (for emails)

### Installation

1. **Clone and install dependencies**
\`\`\`bash
npm install
\`\`\`

2. **Configure environment variables** (`.env.local`)
\`\`\`
MONGODB_URI=your_mongodb_connection_string
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@mastersgurukulam.com
\`\`\`

3. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

4. **Access the application**
- Frontend: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3000/admin`
- Default admin credentials: (Set in database initially)

## Database Schema

### Collections
- `courses` - Course information
- `faculty` - Faculty members
- `facilities` - Facilities photos and info
- `testimonials` - Student testimonials
- `exams` - Exam information
- `exam_registrations` - Student exam registrations
- `grievances` - Student grievances
- `activities` - Activity posts and photos
- `contacts` - Contact form submissions
- `admin_users` - Admin user accounts

## API Endpoints

### Public APIs
- `GET /api/courses` - Get all courses
- `GET /api/exams` - Get all exams
- `GET /api/activities` - Get all activities
- `GET /api/faculty` - Get all faculty
- `GET /api/facilities` - Get all facilities
- `GET /api/testimonials` - Get all testimonials
- `POST /api/contacts` - Submit contact form
- `POST /api/enquiries` - Submit admission enquiry
- `POST /api/exam-registrations` - Register for exam
- `POST /api/grievances` - File a grievance

### Admin APIs
- `POST /api/auth` - Admin login
- `PUT /api/[resource]/[id]` - Update resource
- `DELETE /api/[resource]/[id]` - Delete resource
- `GET /api/exam-registrations` - Get all registrations
- `GET /api/grievances` - Get all grievances
- `GET /api/contacts` - Get all contacts

## Performance Optimizations

1. **Image Optimization**: Lazy loading on all image galleries
2. **Caching**: 1-hour cache for static content, daily for archives
3. **Database Indexing**: Indexes on frequently queried fields
4. **Minified Code**: Production builds are optimized
5. **Connection Pooling**: MongoDB connection pooling enabled
6. **API Rate Limiting**: Ready for implementation

## Email Templates

The system includes automated emails for:
- Admission enquiry confirmation
- Exam registration confirmation
- Grievance acknowledgment
- Contact form acknowledgment

Customize email templates in `lib/email-service.ts`

## Future Enhancements

- Online payment integration (Razorpay/Cashfree)
- Student login portal
- Parent dashboard
- SMS notifications
- Online test portal
- LMS integration
- Advanced analytics
- Push notifications

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

Private - Master's Gurukulam

## Support

For issues or questions, contact the development team.
