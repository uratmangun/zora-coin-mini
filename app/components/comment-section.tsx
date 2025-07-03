"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Textarea } from "@/app/components/ui/textarea"

import { comments as allComments } from "@/data/comments"

export function CommentSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState(allComments.filter(c => c.postId === postId));
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const newCommentData = {
        id: Date.now(),
        postId,
        author: "You",
        authorImage: "/placeholder.svg",
        date: new Date().toISOString().split('T')[0],
        text: newComment,
      };
      setComments([newCommentData, ...comments]);
      setNewComment("");
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold">Comments</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full"
        />
        <Button type="submit" className="mt-2">Submit</Button>
      </form>
      <div className="mt-8 space-y-6">
        {comments.map((comment) => (
          <div key={comment.id}>
            <div>
              <div className="flex items-center justify-between">
                <p className="font-medium">{comment.author}</p>
                <p className="text-sm text-muted-foreground">{comment.date}</p>
              </div>
              <p className="mt-1 text-muted-foreground">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
