// Analytics utility functions for tracking user behavior
declare global {
  interface Window {
    trackEvent: (eventName: string, parameters?: Record<string, any>) => void
    trackFormSubmission: (formType: string, formData?: Record<string, any>) => void
    trackEngagement: (action: string, category: string, label?: string) => void
    gtag: (...args: any[]) => void
  }
}

export const analytics = {
  // Track page views
  trackPageView: (pageName: string, pageType?: string) => {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('page_view', {
        page_title: pageName,
        page_type: pageType || 'page',
        timestamp: new Date().toISOString()
      })
    }
  },

  // Track user interactions
  trackInteraction: (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.trackEngagement) {
      window.trackEngagement(action, category, label)
    }
  },

  // Track form submissions
  trackFormSubmit: (formType: string, additionalData?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.trackFormSubmission) {
      window.trackFormSubmission(formType, {
        ...additionalData,
        timestamp: new Date().toISOString()
      })
    }
  },

  // Track course enrollments
  trackCourseEnrollment: (courseId: string, courseName: string) => {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('course_enrollment', {
        course_id: courseId,
        course_name: courseName,
        timestamp: new Date().toISOString()
      })
    }
  },

  // Track exam registrations
  trackExamRegistration: (examId: string, examName: string, paymentMethod: string) => {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('exam_registration', {
        exam_id: examId,
        exam_name: examName,
        payment_method: paymentMethod,
        timestamp: new Date().toISOString()
      })
    }
  },

  // Track contact form submissions
  trackContactSubmission: (contactType: string) => {
    if (typeof window !== 'undefined' && window.trackFormSubmission) {
      window.trackFormSubmission('contact_form', {
        contact_type: contactType,
        timestamp: new Date().toISOString()
      })
    }
  },

  // Track downloads
  trackDownload: (fileType: string, fileName: string) => {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('file_download', {
        file_type: fileType,
        file_name: fileName,
        timestamp: new Date().toISOString()
      })
    }
  },

  // Track search queries
  trackSearch: (searchTerm: string, searchType: string) => {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('search', {
        search_term: searchTerm,
        search_type: searchType,
        timestamp: new Date().toISOString()
      })
    }
  },

  // Track user engagement time
  trackTimeSpent: (page: string, timeSpent: number) => {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('time_spent', {
        page: page,
        time_spent_seconds: timeSpent,
        timestamp: new Date().toISOString()
      })
    }
  },

  // Track errors
  trackError: (errorType: string, errorMessage: string, errorLocation?: string) => {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('error', {
        error_type: errorType,
        error_message: errorMessage,
        error_location: errorLocation,
        timestamp: new Date().toISOString()
      })
    }
  }
}

export default analytics