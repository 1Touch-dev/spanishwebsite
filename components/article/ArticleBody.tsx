import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

export function ArticleBody({ content }: { content: string }) {
  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <MarkdownRenderer content={content} />
    </div>
  );
}
