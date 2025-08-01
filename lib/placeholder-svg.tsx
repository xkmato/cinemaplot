interface PlaceholderSVGProps {
    type: 'event' | 'movie';
    title: string;
    width?: number;
    height?: number;
    className?: string;
}

export function PlaceholderSVG({
    type,
    title,
    width = 300,
    height = 200,
    className = ""
}: PlaceholderSVGProps) {

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
            {/* Background gradient */}
            <defs>
                <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={type === 'event' ? '#667eea' : '#f093fb'} />
                    <stop offset="100%" stopColor={type === 'event' ? '#764ba2' : '#f5576c'} />
                </linearGradient>
            </defs>

            <rect
                width="100%"
                height="100%"
                fill={`url(#gradient-${type})`}
            />

            {/* Icon */}
            <g transform={`translate(${width / 2}, ${height / 2 - 20})`}>
                <circle
                    r="30"
                    fill="rgba(255, 255, 255, 0.2)"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="2"
                />
                {type === 'event' ? (
                    <g transform="translate(-12, -12)" fill="white">
                        <rect x="3" y="2" width="18" height="20" rx="2" fill="none" stroke="white" strokeWidth="2" />
                        <path d="M8 2v4M16 2v4M3 10h18" stroke="white" strokeWidth="2" fill="none" />
                    </g>
                ) : (
                    <g transform="translate(-12, -12)" fill="white">
                        <rect x="2" y="3" width="20" height="18" rx="2" fill="none" stroke="white" strokeWidth="2" />
                        <path d="m7 11 5 5 5-5" stroke="white" strokeWidth="2" fill="none" />
                    </g>
                )}
            </g>

            {/* Title */}
            <text
                x={width / 2}
                y={height - 30}
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="500"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
            >
                {title.length > 25 ? `${title.substring(0, 25)}...` : title}
            </text>

            {/* Type label */}
            <text
                x={width / 2}
                y={height - 10}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.8)"
                fontSize="10"
                fontWeight="400"
            >
                {type === 'event' ? 'EVENT' : 'FILM'}
            </text>
        </svg>
    );
}

// Create data URL for the SVG
export function createPlaceholderDataUrl(
    type: 'event' | 'movie',
    title: string,
    width: number = 300,
    height: number = 200
): string {
    const svgString = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${type === 'event' ? '#667eea' : '#f093fb'}" />
          <stop offset="100%" stop-color="${type === 'event' ? '#764ba2' : '#f5576c'}" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#gradient-${type})" />
      
      <g transform="translate(${width / 2}, ${height / 2 - 20})">
        <circle r="30" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.3)" stroke-width="2"/>
        ${type === 'event' ? `
          <g transform="translate(-12, -12)" fill="white">
            <rect x="3" y="2" width="18" height="20" rx="2" fill="none" stroke="white" stroke-width="2"/>
            <path d="M8 2v4M16 2v4M3 10h18" stroke="white" stroke-width="2" fill="none"/>
          </g>
        ` : `
          <g transform="translate(-12, -12)" fill="white">
            <rect x="2" y="3" width="20" height="18" rx="2" fill="none" stroke="white" stroke-width="2"/>
            <path d="m7 11 5 5 5-5" stroke="white" stroke-width="2" fill="none"/>
          </g>
        `}
      </g>
      
      <text x="${width / 2}" y="${height - 30}" text-anchor="middle" fill="white" font-size="14" font-weight="500" style="text-shadow: 0 1px 2px rgba(0,0,0,0.3)">
        ${title.length > 25 ? `${title.substring(0, 25)}...` : title}
      </text>
      
      <text x="${width / 2}" y="${height - 10}" text-anchor="middle" fill="rgba(255, 255, 255, 0.8)" font-size="10" font-weight="400">
        ${type === 'event' ? 'EVENT' : 'FILM'}
      </text>
    </svg>
  `;

    return `data:image/svg+xml;base64,${btoa(svgString)}`;
}
