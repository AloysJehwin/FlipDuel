import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#1a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DC143C',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          border: '2px solid #DC143C',
          borderRadius: '4px',
        }}
      >
        F
      </div>
    ),
    {
      ...size,
    }
  )
}
