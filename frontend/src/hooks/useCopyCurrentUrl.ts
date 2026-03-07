import { useState } from 'react';

export function useCopyCurrentUrl() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const copyUrl = async () => {
    const url = window.location.href;
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
        return;
      }
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return {
    copyUrl,
    status,
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
