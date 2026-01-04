// Calculate number of days between two dates
const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
};

// Format date to DD/MM/YYYY
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Generate employee ID
const generateEmployeeId = (department) => {
  const departmentCodes = {
    'general': 'GEN',
    'admin-finance': 'ADM',
    'technical': 'TEC',
    'corporate-affairs': 'CRP',
    'directorate': 'DIR'
  };
  
  const code = departmentCodes[department] || 'GEN';
  const timestamp = Date.now().toString().slice(-6);
  return `EMP-${code}-${timestamp}`;
};

// Calculate net salary
const calculateNetSalary = (basicSalary, allowances = {}, deductions = {}) => {
  const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
  const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
  return basicSalary + totalAllowances - totalDeductions;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random code
const generateRandomCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Check if date is expired
const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

// Get month name from number
const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'Invalid Month';
};

// Paginate results
const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(array.length / limit),
      totalItems: array.length,
      itemsPerPage: limit,
      hasNextPage: endIndex < array.length,
      hasPreviousPage: page > 1
    }
  };
};

module.exports = {
  calculateDaysBetween,
  formatDate,
  generateEmployeeId,
  calculateNetSalary,
  isValidEmail,
  generateRandomCode,
  isExpired,
  getMonthName,
  paginate
};