import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: 'linear-gradient(135deg, #1a0a0a 0%, #2d1515 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DC143C',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          textShadow: '4px 4px 0 #FF1744, -2px -2px 0 #B71C1C',
          border: '8px solid #DC143C',
          borderRadius: '24px',
        }}
      >
        FD
      </div>
    ),
    {
      ...size,
    }
  )
}
