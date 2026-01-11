// Date utility functions for consistent date handling across the application

export const formatDate = (dateValue: any): string => {
  if (!dateValue) return 'No Date';
  
  try {
    const date = new Date(dateValue);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateValue: any, timeValue?: string): string => {
  const formattedDate = formatDate(dateValue);
  
  if (formattedDate === 'No Date' || formattedDate === 'Invalid Date') {
    return formattedDate;
  }
  
  if (timeValue) {
    return `${formattedDate} at ${timeValue}`;
  }
  
  return formattedDate;
};

export const formatDateForInput = (dateValue: any): string => {
  if (!dateValue) return '';
  
  try {
    const date = new Date(dateValue);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Date input formatting error:', error);
    return '';
  }
};

export const isToday = (dateValue: any): boolean => {
  if (!dateValue) return false;
  
  try {
    const date = new Date(dateValue);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return false;
    }
    
    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch (error) {
    console.error('Date comparison error:', error);
    return false;
  }
};

export const isSameDay = (date1: any, date2: any): boolean => {
  if (!date1 || !date2) return false;
  
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    // Check if both dates are valid
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return false;
    }
    
    return d1.toDateString() === d2.toDateString();
  } catch (error) {
    console.error('Date comparison error:', error);
    return false;
  }
};