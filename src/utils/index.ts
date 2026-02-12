export const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

export const maskPhoneNumber = (phone: string): string => {
  if (phone.length < 7) return phone;
  return phone.slice(0, 4) + '****' + phone.slice(-3);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const pkPhoneRegex = /^(\+92|0)?3[0-9]{9}$/;
  return pkPhoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('one number');
  return { valid: errors.length === 0, errors };
};

export const getPasswordStrength = (password: string): { level: string; color: string; width: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { level: 'Weak', color: '#EF4444', width: '25%' };
  if (score <= 3) return { level: 'Fair', color: '#F59E0B', width: '50%' };
  if (score <= 4) return { level: 'Good', color: '#3B82F6', width: '75%' };
  return { level: 'Strong', color: '#10B981', width: '100%' };
};

export const generateMemberId = (): string => {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `MUM-${num}`;
};

export const getDaysRemaining = (expiryDate: string): number => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

export const getOpeningStatus = (hours: string): { isOpen: boolean; text: string } => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const parts = hours.match(/(\d+):(\d+)\s*(AM|PM)\s*-\s*(\d+):(\d+)\s*(AM|PM)/i);
    if (!parts) return { isOpen: false, text: 'Hours unavailable' };
    let openHour = parseInt(parts[1]);
    if (parts[3].toUpperCase() === 'PM' && openHour !== 12) openHour += 12;
    if (parts[3].toUpperCase() === 'AM' && openHour === 12) openHour = 0;
    let closeHour = parseInt(parts[4]);
    if (parts[6].toUpperCase() === 'PM' && closeHour !== 12) closeHour += 12;
    if (parts[6].toUpperCase() === 'AM' && closeHour === 12) closeHour = 0;
    const isOpen = currentHour >= openHour && currentHour < closeHour;
    return { isOpen, text: isOpen ? `Open until ${parts[4]}:${parts[5]} ${parts[6]}` : `Closed \u00B7 Opens ${parts[1]}:${parts[2]} ${parts[3]}` };
  } catch {
    return { isOpen: false, text: 'Hours unavailable' };
  }
};
