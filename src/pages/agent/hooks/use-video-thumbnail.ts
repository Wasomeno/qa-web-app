import { useState, useEffect } from 'react';

export function useVideoThumbnail(videoUrl: string, timeInSeconds: number = 3) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!videoUrl) return;

    let isMounted = true;
    setIsLoading(true);

    const authSessionId = localStorage.getItem('qa_webapp_session_id');
    const url = new URL('/api/video/thumbnail', window.location.origin);
    url.searchParams.set('url', videoUrl);
    url.searchParams.set('time', timeInSeconds.toString());
    if (authSessionId) {
      url.searchParams.set('session_id', authSessionId);
    }

    // Request thumbnail from backend API
    fetch(url.toString(), {
      headers: {
        ...(authSessionId ? {
          'X-Session-ID': authSessionId,
          'Authorization': `Bearer ${authSessionId}`
        } : {})
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        if (!isMounted) return;

        if (data.thumbnail) {
          setThumbnail(data.thumbnail);
          setError(null);
        } else {
          setError(new Error(data.error || 'Failed to generate thumbnail'));
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Failed to get video thumbnail:', err);
        setError(err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [videoUrl, timeInSeconds]);

  return { thumbnail, isLoading, error };
}
