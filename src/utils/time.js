/**
 * 格式化时间为相对时间或具体日期
 * @param {string|number|Date} timestamp - 要格式化的时间戳或日期对象
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (timestamp) => {
  if (!timestamp) {
    return '未知时间';
  }

  let date;
  try {
    // 如果是数字字符串，先转换为数字
    if (typeof timestamp === 'string' && !isNaN(timestamp)) {
      timestamp = Number(timestamp);
    }
    
    // 创建日期对象
    date = new Date(timestamp);
    
    // 检查是否是有效日期
    if (isNaN(date.getTime())) {
      return '无效时间';
    }
  } catch (error) {
    console.error('时间格式化错误:', error);
    return '无效时间';
  }

  const now = new Date();
  
  // 处理时区问题，获取本地时间的时间戳
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  
  // 计算时间差（毫秒）
  const diff = localNow - localDate;
  
  // 如果是未来时间，直接显示具体时间
  if (diff < 0) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Intl.DateTimeFormat('zh-CN', options).format(date);
  }
  
  // 转换为分钟
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (minutes < 1) {
    return '刚刚';
  }
  
  if (minutes < 60) {
    return `${minutes}分钟前`;
  }
  
  // 转换为小时
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}小时前`;
  }
  
  // 转换为天
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}天前`;
  }
  
  // 转换为月
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}个月前`;
  }
  
  // 超过一年显示具体日期
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('zh-CN', options).format(date);
}; 