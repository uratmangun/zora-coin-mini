"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { useAccount } from "wagmi";
import { Input } from "@/app/components/ui/input"
import { posts } from "@/data/posts"
import Image from "next/image"
import Link from "next/link"

export function BlogSection() {
  const { isConnected } = useAccount();
  const [search, setSearch] = useState("")

  const filteredPosts = posts.filter((
    post) =>
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">From the Blog</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Check out the latest articles from our team and community.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Wallet>
              <ConnectWallet>
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
            {isConnected && (
              <Link href="/blog/create">
                <Button>Create Blog</Button>
              </Link>
            )}
          </div>
          <div className="w-full max-w-sm">
            <Input
              type="search"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 mt-12">
          {filteredPosts.map((post) => (
            <div key={post.id} className="relative group">
              <Link href={`/blog/${post.id}`} className="absolute inset-0 z-10" prefetch={false}>
                <span className="sr-only">View</span>
              </Link>
              <Image
                src={post.image}
                alt={post.title}
                width={400}
                height={225}
                className="object-cover w-full h-60 rounded-lg"
              />
              <div className="mt-4">
                <h3 className="text-xl font-bold">{post.title}</h3>
                <p className="mt-2 text-muted-foreground">{post.description}</p>
                <div className="flex items-center mt-4">
                  <Image
                    src={post.authorImage}
                    alt={post.author}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium">{post.author}</p>
                    <p className="text-sm text-muted-foreground">{post.date}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
