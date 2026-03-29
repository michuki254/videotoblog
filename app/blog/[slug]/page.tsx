import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import { CalendarIcon, ClockIcon, TagIcon, ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline'
import { getBlogPost, getAllBlogPosts } from '@/lib/blogData'
import ReactMarkdown from 'react-markdown'

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription,
    keywords: post.seo.keywords.join(', '),
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      type: 'article',
      publishedTime: post.publishedDate,
      authors: [post.author.name],
      images: [
        {
          url: post.featuredImage,
          width: 1200,
          height: 600,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      images: [post.featuredImage],
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getAllBlogPosts()
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3)

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.featuredImage,
    datePublished: post.publishedDate,
    dateModified: post.updatedDate || post.publishedDate,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'VideotoBlog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://videotoblog.ai/logo.png',
      },
    },
    description: post.excerpt,
    keywords: post.seo.keywords.join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gray-50">
        <Navigation />

        {/* Back to Blog */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/blog"
              className="inline-flex items-center text-[#FF385C] hover:text-[#E0314F] font-semibold transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Badge */}
          <div className="mb-6">
            <span className="bg-[#FF385C] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#484848] mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-[#767676]">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <span>
                {new Date(post.publishedDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              <span>{post.readTime}</span>
            </div>
            <button className="flex items-center gap-2 text-[#FF385C] hover:text-[#E0314F] transition-colors">
              <ShareIcon className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Featured Image */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>

          {/* Author Info */}
          <div className="bg-gradient-to-r from-[#FAFAFA] to-white rounded-2xl p-6 mb-12 shadow-lg border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-[#FF385C] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {post.author.name[0]}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#484848] mb-1">
                  {post.author.name}
                </h3>
                <p className="text-sm text-[#767676] mb-2">{post.author.role}</p>
                <p className="text-sm text-[#484848]">{post.author.bio}</p>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <ReactMarkdown
                className="markdown-content"
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-[#484848] mt-8 mb-4 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-[#484848] mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-[#484848] mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-[#484848] mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 text-[#484848] space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 text-[#484848] space-y-2">
                      {children}
                    </ol>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-[#484848]">{children}</strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[#FF385C] pl-4 italic my-4 text-[#767676]">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <TagIcon className="h-5 w-5 text-[#767676]" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-[#FAFAFA] text-[#484848] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#FF385C] hover:text-white transition-colors cursor-pointer shadow-md"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-[#FF385C] rounded-2xl p-8 md:p-12 text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Content?
            </h2>
            <p className="text-white/90 mb-8 text-lg max-w-2xl mx-auto">
              Start converting your YouTube videos into SEO-optimized blog posts in minutes.
              Join thousands of creators who are already maximizing their content's potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-white text-[#FF385C] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg inline-block"
              >
                Get Started Free
              </Link>
              <Link
                href="/pricing"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors shadow-lg inline-block"
              >
                View Pricing
              </Link>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-[#484848] mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-[#484848] mb-2 line-clamp-2 group-hover:text-[#FF385C] transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-[#767676] line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}
