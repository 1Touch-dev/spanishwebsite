'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Extracts YouTube Video ID from various URL formats
 */
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Extracts Tweet ID from Twitter/X URL
 */
function getTweetId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/.*\/status\/(\d+)/);
  return match ? match[1] : null;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1 className="mt-8 mb-4 font-display text-3xl font-extrabold text-brand-navy" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mt-8 mb-3 font-display text-2xl font-extrabold text-brand-navy" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="mt-6 mb-2 font-display text-xl font-bold text-brand-navy" {...props} />
          ),
          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="my-4 text-base leading-relaxed text-slate-700" {...props} />
          ),
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="my-4 ml-6 list-disc space-y-1 text-slate-700" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-4 ml-6 list-decimal space-y-1 text-slate-700" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="my-6 border-l-4 border-brand-red bg-brand-surface p-4 italic text-brand-navy"
              {...props}
            />
          ),
          // Links & Embeds
          a: ({ node, href, children, ...props }) => {
            if (!href) return <span {...props}>{children}</span>;

            // Check for YouTube
            const ytId = getYouTubeId(href);
            if (ytId) {
              return (
                <div className="my-6 aspect-video w-full overflow-hidden rounded-xl shadow-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              );
            }

            // Check for Twitter/X
            const tweetId = getTweetId(href);
            if (tweetId) {
              return (
                <div className="my-6 flex justify-center">
                  <div className="w-full max-w-[550px]">
                    <TwitterTweetEmbed tweetId={tweetId} />
                  </div>
                </div>
              );
            }

            // Normal Link
            const isExternal = href.startsWith('http');
            return (
              <a
                href={href}
                className="text-brand-red font-medium underline underline-offset-2 hover:text-brand-red/80"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          // Images
          img: ({ node, ...props }) => (
            <img
              className="my-8 h-auto w-full rounded-xl object-cover shadow-md"
              {...props}
              alt={props.alt || 'Article image'}
            />
          ),
          // Code
          code: ({ className, children, ...props }) => {
            const isBlock = /language-(\w+)/.exec(className || '');
            return isBlock ? (
              <code className={cn('block font-mono', className)} {...props}>
                {children}
              </code>
            ) : (
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-brand-red" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-6 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-white">
              {children}
            </pre>
          ),
          // Strong/Bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-brand-navy" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
