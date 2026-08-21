import humanizeDuration from 'humanize-duration';

export const formatDuration = (ms) => {
  return humanizeDuration(ms, {
    language: 'id',
    round: true,
    units: ['d', 'h', 'm', 's'],
    fallbacks: ['en']
  });
};

export const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('id-ID').format(num);
};

export const parseJid = (jid = '') => {
  if (!jid) return '';
  return jid.replace(/:\d+/, '');
};

export const getCleanPhoneNumber = (jid = '') => {
  return parseJid(jid).split('@')[0];
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const formatUptime = (seconds) => {
  return formatDuration(seconds * 1000);
};

export const getTimeGreeting = () => {
  try {
    const hour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false }).format(new Date()), 10);
    if (hour >= 4 && hour < 11) return 'Pagi';
    if (hour >= 11 && hour < 15) return 'Siang';
    if (hour >= 15 && hour < 18) return 'Sore';
    return 'Malam';
  } catch (e) {
    return 'Pagi';
  }
};

export const getWIBTime = () => {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date()) + ' WIB';
  } catch (e) {
    return '00:00 WIB';
  }
};

export const getIndonesianDate = () => {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
  } catch (e) {
    return new Date().toLocaleDateString('id-ID');
  }
};
