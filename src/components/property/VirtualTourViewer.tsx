import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { convertToEmbedUrl, isEmbeddableUrl, getVirtualTourType } from '@/utils/virtualTourUtils';

interface VirtualTourViewerProps {
  url: string;
  className?: string;
  title?: string;
}

export const VirtualTourViewer = ({ url, className = '', title = 'Virtual Tour' }: VirtualTourViewerProps) => {
  const [iframeError, setIframeError] = useState(false);

  if (!url) return null;

  const embedUrl = convertToEmbedUrl(url);
  const canEmbed = isEmbeddableUrl(url);
  const tourType = getVirtualTourType(url);

  // If iframe fails to load or URL is not embeddable, show a link instead
  if (iframeError || !canEmbed) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/50 ${className}`}>
        <ExternalLink className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Virtual Tour Available</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          This virtual tour needs to be opened in a new window for security reasons.
        </p>
        <Button asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Virtual Tour
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <iframe
        src={embedUrl}
        className="w-full h-full min-h-[400px]"
        allowFullScreen
        loading="lazy"
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onError={() => setIframeError(true)}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
      <div className="absolute top-2 right-2">
        <Button
          size="sm"
          variant="secondary"
          asChild
          className="bg-white/90 hover:bg-white"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3 mr-1" />
            Open
          </a>
        </Button>
      </div>
    </div>
  );
};
