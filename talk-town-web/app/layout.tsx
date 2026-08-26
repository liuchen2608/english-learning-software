import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://talk-town-english.caokhoiq2.chatgpt.site'),
  title: 'Talk Town · 旅行英语任务训练',
  description: '通过 AI 场景问答，在出发前掌握真正用得上的旅行英语。',
  openGraph: {
    title: 'Talk Town · 旅行英语任务训练',
    description: '出发前，练会真正用得上的英语。',
    type: 'website',
    locale: 'zh_CN',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Talk Town 旅行英语任务训练' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Talk Town · 旅行英语任务训练',
    description: '出发前，练会真正用得上的英语。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
