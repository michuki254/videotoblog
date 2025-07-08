'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'
import Link from 'next/link'
import { 
  PlayIcon, 
  DocumentTextIcon, 
  CameraIcon, 
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  GlobeAltIcon,
  CogIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'

const steps = [
  {
    id: 1,
    title: 'Input Your Content',
    description: 'Paste a YouTube URL, upload a video file, or provide a transcript to get started.',
    icon: CloudArrowUpIcon,
    details: [
      'YouTube URLs (any video length)',
      'Direct video uploads (MP4, MOV, AVI, WMV)', 
      'Vimeo and other platform links',
      'Audio files (MP3, WAV)',
      'Text transcripts (if you already have them)',
      'Batch upload multiple videos'
    ],
    techDetails: 'Our system automatically detects video metadata, duration, and quality to optimize processing.',
    time: '< 30 seconds'
  },
  {
    id: 2,
    title: 'AI Audio Processing',
    description: 'Advanced AI extracts and transcribes audio with industry-leading accuracy.',
    icon: SparklesIcon,
    details: [
      'High-accuracy speech-to-text conversion',
      'Multi-language support (50+ languages)',
      'Speaker identification and separation',
      'Background noise filtering',
      'Technical term recognition',
      'Timestamp synchronization'
    ],
    techDetails: 'Using OpenAI Whisper and custom models trained on diverse content types.',
    time: '2-5 minutes'
  },
  {
    id: 3,
    title: 'Smart Screenshot Capture',
    description: 'AI identifies key moments and captures high-quality screenshots automatically.',
    icon: CameraIcon,
    details: [
      'Scene change detection',
      'Text and diagram recognition',
      'Slide transition identification',
      'Key moment analysis',
      'High-resolution capture (up to 4K)',
      'Custom timestamp options'
    ],
    techDetails: 'Computer vision algorithms analyze visual content to select the most relevant frames.',
    time: '1-3 minutes'
  },
  {
    id: 4,
    title: 'Content Analysis & Structure',
    description: 'AI analyzes content to identify key topics, themes, and logical structure.',
    icon: CogIcon,
    details: [
      'Topic identification and clustering',
      'Key point extraction',
      'Logical flow analysis',
      'Heading hierarchy creation',
      'Content categorization',
      'Context understanding'
    ],
    techDetails: 'GPT-4 and custom NLP models process content for meaning and structure.',
    time: '1-2 minutes'
  },
  {
    id: 5,
    title: 'Blog Post Generation',
    description: 'Transform analyzed content into engaging, well-structured blog posts.',
    icon: DocumentTextIcon,
    details: [
      'SEO-optimized headlines and subheadings',
      'Natural paragraph flow and transitions',
      'Meta descriptions and tags',
      'Keyword optimization',
      'Reading level adjustment',
      'Custom tone and style matching'
    ],
    techDetails: 'Advanced language models create human-quality content with your preferred style.',
    time: '2-4 minutes'
  },
  {
    id: 6,
    title: 'Export & Publish',
    description: 'Download in multiple formats or publish directly to your favorite platforms.',
    icon: GlobeAltIcon,
    details: [
      'Markdown, HTML, and DOCX exports',
      'WordPress-ready formatting',
      'Medium and Ghost integration',
      'Custom template application',
      'Image optimization and embedding',
      'Social media snippets'
    ],
    techDetails: 'Clean, semantic markup optimized for web publishing and SEO.',
    time: '< 1 minute'
  }
]

const features = [
  {
    title: 'Lightning Fast Processing',
    description: 'Convert 60-minute videos in under 10 minutes with our optimized AI pipeline.',
    icon: ClockIcon,
    stats: '5-10x faster than manual conversion'
  },
  {
    title: 'Industry-Leading Accuracy',
    description: 'Our AI achieves 95%+ accuracy in content conversion and understanding.',
    icon: CheckCircleIcon,
    stats: '95%+ accuracy rate'
  },
  {
    title: 'Multi-Language Support',
    description: 'Process content in 50+ languages with native-level understanding.',
    icon: GlobeAltIcon,
    stats: '50+ languages supported'
  },
  {
    title: 'Smart Automation',
    description: 'Minimal human intervention required - AI handles the heavy lifting.',
    icon: SparklesIcon,
    stats: '90% automated process'
  }
]

const useCases = [
  {
    title: 'YouTube Content Creators',
    description: 'Repurpose your videos into SEO-optimized blog posts to increase reach and engagement.',
    example: 'Turn your "10 Productivity Tips" video into a comprehensive blog post with screenshots and actionable advice.',
    results: ['40% increase in organic traffic', '2x content output', 'Better SEO rankings']
  },
  {
    title: 'Educators & Trainers',
    description: 'Convert lectures and training videos into detailed study guides and course materials.',
    example: 'Transform a 2-hour programming tutorial into a step-by-step written guide with code examples.',
    results: ['Enhanced learning materials', 'Improved accessibility', 'Searchable content library']
  },
  {
    title: 'Business & Marketing',
    description: 'Turn webinars, product demos, and presentations into marketing content.',
    example: 'Convert your product demo video into a detailed feature breakdown blog post with screenshots.',
    results: ['Better lead generation', 'Content marketing scale', 'Improved SEO presence']
  },
  {
    title: 'Podcasters',
    description: 'Transform audio content into readable blog posts to reach wider audiences.',
    example: 'Convert your interview podcast into an engaging article with key quotes and insights.',
    results: ['Broader audience reach', 'Better discoverability', 'Content repurposing efficiency']
  }
]

const qualityMetrics = [
  { metric: 'Transcription Accuracy', value: '95%+', description: 'Industry-leading speech recognition' },
  { metric: 'Content Coherence', value: '93%', description: 'Logical flow and structure preservation' },
  { metric: 'SEO Optimization', value: '98%', description: 'Search engine ready content' },
  { metric: 'Processing Speed', value: '5-10x', description: 'Faster than manual conversion' },
  { metric: 'Language Support', value: '50+', description: 'Global language coverage' },
  { metric: 'Customer Satisfaction', value: '4.8/5', description: 'Based on user feedback' }
]

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(1)
  const [activeUseCase, setActiveUseCase] = useState(0)

  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="default" />
      
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mx-auto max-w-4xl text-center mb-20">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              How It <span className="text-indigo-600">Works</span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600">
              Discover the magic behind our AI-powered video-to-blog conversion process. 
              From upload to publish in just 6 simple steps.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/convert"
                className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Try It Now
              </Link>
              <Link href="#process" className="text-lg font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Process Overview */}
          <section id="process" className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                The Complete Process
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Our 6-step AI pipeline transforms any video into professional blog content
              </p>
            </div>

            {/* Steps Navigation */}
            <div className="mb-12">
              <nav className="flex justify-center">
                <ol className="flex items-center space-x-4 md:space-x-8">
                  {steps.map((step, index) => (
                    <li key={step.id} className="flex items-center">
                      <button
                        onClick={() => setActiveStep(step.id)}
                        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                          activeStep === step.id
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : activeStep > step.id
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 text-gray-500 hover:border-indigo-300'
                        }`}
                      >
                        {activeStep > step.id ? (
                          <CheckCircleIcon className="h-6 w-6" />
                        ) : (
                          <span className="text-sm font-semibold">{step.id}</span>
                        )}
                      </button>
                      {index < steps.length - 1 && (
                        <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-4 md:ml-8" />
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            {/* Active Step Details */}
            {steps.map((step) => (
              <div
                key={step.id}
                className={`${activeStep === step.id ? 'block' : 'hidden'}`}
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 lg:p-12">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <div className="flex items-center mb-6">
                        <div className="bg-indigo-100 rounded-xl p-3 mr-4">
                          <step.icon className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Step {step.id}: {step.title}
                          </h3>
                          <div className="flex items-center mt-2">
                            <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-600">{step.time}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-lg text-gray-700 mb-6">{step.description}</p>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                        <ul className="space-y-2">
                          {step.details.map((detail, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                              <span className="text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Technical Details:</h4>
                        <p className="text-sm text-gray-600">{step.techDetails}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8">
                      <div className="text-center">
                        <step.icon className="h-24 w-24 text-indigo-600 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Processing Time
                        </h4>
                        <div className="text-3xl font-bold text-indigo-600 mb-4">
                          {step.time}
                        </div>
                        <p className="text-sm text-gray-600">
                          Average processing time for this step
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Key Features */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Why Our Process Works
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Advanced AI technology delivering exceptional results
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-3">{feature.description}</p>
                  <div className="text-sm font-semibold text-indigo-600">{feature.stats}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Perfect For Every Use Case
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                See how different professionals use our video-to-blog conversion
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="space-y-4">
                  {useCases.map((useCase, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveUseCase(index)}
                      className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                        activeUseCase === index
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {useCase.title}
                      </h3>
                      <p className="text-gray-600">{useCase.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {useCases[activeUseCase].title}
                  </h3>
                  <div className="bg-white rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Example:</h4>
                    <p className="text-gray-700 italic">"{useCases[activeUseCase].example}"</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Expected Results:</h4>
                    <ul className="space-y-2">
                      {useCases[activeUseCase].results.map((result, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                          <span className="text-gray-700">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quality Metrics */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Proven Quality & Performance
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Real metrics from thousands of conversions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {qualityMetrics.map((metric, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {metric.value}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {metric.metric}
                  </h3>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl">
            <div className="px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to Experience the Magic?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
                  See how our AI transforms your videos into professional blog content in minutes, not hours.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link
                    href="/convert"
                    className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Start Free Conversion
                  </Link>
                  <Link href="/pricing" className="text-sm font-semibold leading-6 text-white">
                    View Pricing <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 