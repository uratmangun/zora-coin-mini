'use client'

'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export default function CreateBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the form submission, e.g., send to an API
    console.log({ title, description, content });
    // For now, we'll just redirect to the homepage
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:py-20">
       <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to all posts
      </Link>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">Create a New Blog Post</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground">Title</label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground">Description</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-foreground">Content (Markdown)</label>
                <Textarea
                  id="content"
                  rows={15}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 block w-full font-mono"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Preview</label>
              <div className="mt-1 p-4 border rounded-md bg-muted min-h-[400px]">
                <article className="prose prose-gray dark:prose-invert max-w-none">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
                </article>
              </div>
            </div>
          </div>
          <Button type="submit" className="mt-8">Create Post</Button>
        </form>
      </div>
    </div>
  );
}
