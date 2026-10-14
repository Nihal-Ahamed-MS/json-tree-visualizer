import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: 80,
                    background: '#0a0a0a',
                    color: '#fafafa',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ fontSize: 36, color: '#22d3ee', marginBottom: 24 }}>{'{ } → tree'}</div>
                <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>{SITE.name}</div>
                <div style={{ fontSize: 34, color: '#a1a1aa', marginTop: 24, maxWidth: 950 }}>
                    Visualize large JSON as an interactive, zoomable tree graph. Free, fast and private.
                </div>
                <div style={{ fontSize: 26, color: '#71717a', marginTop: 48 }}>jsontree.justadev.in</div>
            </div>
        ),
        size,
    );
}
