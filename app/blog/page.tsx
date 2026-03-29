'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { ClockIcon, CalendarIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { getAllBlogPosts } from '@/lib/blogData'

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const blogPosts = getAllBlogPosts()

  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category)))]

  const filteredPosts = selectedCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-[#FF385C] pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              VideotoBlog Insights
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Expert strategies, case studies, and tutorials on video content repurposing,
              AI-powered creation, and SEO optimization.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-white text-[#FF385C] shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-16">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative h-64 md:h-full">
                <img
                  src={filteredPosts[0].featuredImage}
                  alt={filteredPosts[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#FF385C] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg">
                    Featured Post
                  </span>
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-[#00A699]/10 text-[#00A699] px-3 py-1 rounded-lg text-sm font-semibold">
                    {filteredPosts[0].category}
                  </span>
                  <span className="text-[#767676] text-sm flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(filteredPosts[0].publishedDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-[#484848] mb-4">
                  {filteredPosts[0].title}
                </h2>
                <p className="text-[#767676] mb-6 text-lg">
                  {filteredPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF385C] rounded-full flex items-center justify-center text-white font-semibold">
                      {filteredPosts[0].author.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#484848]">{filteredPosts[0].author.name}</p>
                      <p className="text-xs text-[#767676]">{filteredPosts[0].author.role}</p>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${filteredPosts[0].slug}`}
                    className="bg-[#FF385C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E0314F] transition-colors shadow-lg flex items-center gap-2"
                  >
                    Read Article
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.slice(1).map((post) => (
            <article key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur-sm text-[#484848] px-3 py-1 rounded-lg text-xs font-semibold shadow-md">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3 text-sm text-[#767676]">
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(post.publishedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#484848] mb-3 line-clamp-2 group-hover:text-[#FF385C] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[#767676] mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#00A699] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {post.author.name[0]}
                    </div>
                    <span className="text-sm font-semibold text-[#484848]">{post.author.name}</span>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-[#FF385C] font-semibold text-sm hover:underline flex items-center gap-1"
                  >
                    Read More
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 bg-[#FF385C] rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Never Miss an Update
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Get the latest insights on video content creation, AI tools, and SEO strategies
              delivered straight to your inbox every week.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="bg-white text-[#FF385C] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Subscribe
              </button>
            </form>
            <p className="text-white/70 text-sm mt-4">
              Join 10,000+ content creators. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
