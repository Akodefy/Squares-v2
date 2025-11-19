/**
 * Utility functions for handling virtual tour URLs
 */

export const convertToEmbedUrl = (url: string): string => {
  if (!url) return '';

  // YouTube URLs
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Vimeo URLs
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  // Google Street View or Maps
  if (url.includes('google.com/maps')) {
    return url.replace('/maps/', '/maps/embed/');
  }

  // Matterport 3D tours
  if (url.includes('matterport.com')) {
    return url;
  }

  // Default: return as-is for other embed-friendly URLs
  return url;
};

export const isEmbeddableUrl = (url: string): boolean => {
  if (!url) return false;

  const embeddablePatterns = [
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'matterport.com',
    'google.com/maps',
    'kuula.co',
    'roundme.com',
    'momento360.com'
  ];

  return embeddablePatterns.some(pattern => url.includes(pattern));
};

export const getVirtualTourType = (url: string): 'youtube' | 'vimeo' | 'matterport' | 'maps' | 'other' => {
  if (!url) return 'other';

  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.includes('matterport.com')) return 'matterport';
  if (url.includes('google.com/maps')) return 'maps';
  
  return 'other';
};
