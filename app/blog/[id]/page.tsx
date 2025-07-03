'use client'
import { posts } from "@/data/posts";
import Image from "next/image";
import { useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";
import { CommentSection } from "@/app/components/comment-section";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
export default function Page() {
  const params = useParams<{ id: string }>();
  const post = posts.find((post) => post.id.toString() === params.id);

  const { setFrameReady, isFrameReady } = useMiniKit();

  // The setFrameReady() function is called when your mini-app is ready to be shown
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:py-20">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to all posts
      </Link>
      <article className="prose prose-gray mx-auto dark:prose-invert">
        <div className="space-y-4 not-prose">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            {post.title}
          </h1>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={post.authorImage} />
              <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author}</p>
              <p className="text-sm text-muted-foreground">{post.date}</p>
            </div>
          </div>
        </div>
        <Image
          src={post.image}
          alt={post.title}
          width={1200}
          height={675}
          className="my-8 rounded-lg"
        />
        <p>{post.description}</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
          Suspendisse lectus tortor, dignissim sit amet, adipiscing nec,
          ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula
          massa, varius a, semper congue, euismod non, mi. Proin porttitor,
          orci nec nonummy molestie, enim est eleifend mi, non fermentum diam
          nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae,
          consequat in, pretium a, enim. Pellentesque congue. Ut in risus
          volutpat libero pharetra tempor. Cras vestibulum bibendum augue.
          Praesent egestas leo in pede. Praesent blandit odio eu enim.
          Pellentesque sed dui ut augue blandit sodales. Vestibulum ante
          ipsum primis in faucibus orci luctus et ultrices posuere cubilia
          Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum.
          Maecenas adipiscing ante non diam. Proin magna.
        </p>
        <CommentSection postId={post.id} />
      </article>
    </div>
  );
}
