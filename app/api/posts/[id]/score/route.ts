import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '../../../../../lib/mongodb';
import BlogPost from '../../../../../models/BlogPost';

// Helper function to calculate Flesch-Kincaid Grade Level
function calculateFleschKincaidGradeLevel(text: string): number {
  // Remove markdown and get plain text
  const plainText = text
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
    .replace(/!\[.*?\]\(.+?\)/g, '') // Remove images
    .replace(/`(.+?)`/g, '$1') // Remove code
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  // Count sentences (ending with ., !, or ?)
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;

  // Count words
  const words = plainText.split(/\s+/).filter(w => w.trim().length > 0);
  const wordCount = words.length;

  // Count syllables (approximation)
  let syllableCount = 0;
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length === 0) return;
    
    // Count vowel groups
    const vowelGroups = cleanWord.match(/[aeiouy]+/g);
    syllableCount += vowelGroups ? vowelGroups.length : 1;
    
    // Subtract silent e
    if (cleanWord.endsWith('e') && cleanWord.length > 1) {
      syllableCount--;
    }
    
    // Ensure at least 1 syllable per word
    if (syllableCount === 0) syllableCount = 1;
  });

  if (sentenceCount === 0 || wordCount === 0) return 0;

  // Flesch-Kincaid Grade Level formula
  const gradeLevel = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
  return Math.max(0, Math.round(gradeLevel * 10) / 10);
}

// Helper function to analyze content structure
function analyzeContentStructure(content: string) {
  const plainText = content
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
    .replace(/!\[.*?\]\(.+?\)/g, '') // Remove images
    .replace(/`(.+?)`/g, '$1') // Remove code
    .replace(/\n+/g, ' ')
    .trim();

  const words = plainText.split(/\s+/).filter(w => w.trim().length > 0);
  const wordCount = words.length;

  // Count paragraphs (double line breaks in original content)
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;

  // Count sections (headers)
  const sections = content.match(/#{1,6}\s/g);
  const sectionCount = sections ? sections.length : 0;

  // Count sentences
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;

  // Count images
  const images = content.match(/!\[([^\]]*)\]\(([^)]+)\)/g);
  const imageCount = images ? images.length : 0;

  // Count links
  const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
  const linkCount = links ? links.length : 0;

  // Calculate averages
  const avgWordsPerParagraph = paragraphCount > 0 ? wordCount / paragraphCount : 0;
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  // Check thresholds (25% over recommended limits)
  const longParagraphs = paragraphs.filter(p => {
    const pWords = p.split(/\s+/).filter(w => w.trim().length > 0).length;
    return pWords > 125; // 100 words + 25%
  }).length;

  const longSentences = sentences.filter(s => {
    const sWords = s.split(/\s+/).filter(w => w.trim().length > 0).length;
    return sWords > 25; // 20 words + 25%
  }).length;

  const longParagraphsPercent = paragraphCount > 0 ? (longParagraphs / paragraphCount) * 100 : 0;
  const longSentencesPercent = sentenceCount > 0 ? (longSentences / sentenceCount) * 100 : 0;

  return {
    wordCount,
    paragraphCount,
    sectionCount,
    sentenceCount,
    imageCount,
    linkCount,
    avgWordsPerParagraph: Math.round(avgWordsPerParagraph * 10) / 10,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    longParagraphsPercent: Math.round(longParagraphsPercent * 10) / 10,
    longSentencesPercent: Math.round(longSentencesPercent * 10) / 10,
  };
}

// Helper function to analyze keyphrase density
function analyzeKeyphraseDensity(content: string, title: string, metaDescription: string = '') {
  const plainText = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .toLowerCase();

  const words = plainText.split(/\s+/).filter(w => w.trim().length > 0);
  const totalWords = words.length;

  // Extract potential keyphrases from title (2-3 word combinations)
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const keyphrases: string[] = [];

  // Generate 2-word and 3-word combinations from title
  for (let i = 0; i < titleWords.length - 1; i++) {
    keyphrases.push(`${titleWords[i]} ${titleWords[i + 1]}`);
    if (i < titleWords.length - 2) {
      keyphrases.push(`${titleWords[i]} ${titleWords[i + 1]} ${titleWords[i + 2]}`);
    }
  }

  // Find the most frequent keyphrase
  let bestKeyphrase = '';
  let maxFrequency = 0;
  let bestDensity = 0;

  keyphrases.forEach(phrase => {
    const matches = plainText.match(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
    const frequency = matches ? matches.length : 0;
    const density = totalWords > 0 ? (frequency / totalWords) * 100 : 0;

    if (frequency > maxFrequency) {
      maxFrequency = frequency;
      bestKeyphrase = phrase;
      bestDensity = density;
    }
  });

  // Check presence in title, introduction, and meta description
  const introduction = plainText.substring(0, 300); // First 300 characters as introduction
  const inTitle = title.toLowerCase().includes(bestKeyphrase);
  const inIntroduction = introduction.includes(bestKeyphrase);
  const inMetaDescription = metaDescription.toLowerCase().includes(bestKeyphrase);

  return {
    keyphrase: bestKeyphrase,
    frequency: maxFrequency,
    density: Math.round(bestDensity * 100) / 100,
    inTitle,
    inIntroduction,
    inMetaDescription,
  };
}

// Helper function to calculate overall score
function calculateOverallScore(
  gradeLevel: number,
  structure: any,
  keyphrase: any
): { score: number; breakdown: any } {
  let totalScore = 0;
  const breakdown: any = {};

  // 1. Readability (10 points) - Target 7th-8th grade (7-8)
  if (gradeLevel >= 7 && gradeLevel <= 8) {
    breakdown.readability = 10;
  } else if (gradeLevel >= 6 && gradeLevel <= 9) {
    breakdown.readability = 8;
  } else if (gradeLevel >= 5 && gradeLevel <= 10) {
    breakdown.readability = 6;
  } else {
    breakdown.readability = 3;
  }

  // 2. Word Count (10 points) - Target >300 words
  if (structure.wordCount >= 300) {
    breakdown.wordCount = 10;
  } else if (structure.wordCount >= 200) {
    breakdown.wordCount = 7;
  } else if (structure.wordCount >= 100) {
    breakdown.wordCount = 4;
  } else {
    breakdown.wordCount = 1;
  }

  // 3. Paragraph Length (10 points) - <25% over threshold
  if (structure.longParagraphsPercent <= 15) {
    breakdown.paragraphLength = 10;
  } else if (structure.longParagraphsPercent <= 25) {
    breakdown.paragraphLength = 7;
  } else if (structure.longParagraphsPercent <= 40) {
    breakdown.paragraphLength = 4;
  } else {
    breakdown.paragraphLength = 1;
  }

  // 4. Sentence Length (10 points) - <25% over threshold
  if (structure.longSentencesPercent <= 15) {
    breakdown.sentenceLength = 10;
  } else if (structure.longSentencesPercent <= 25) {
    breakdown.sentenceLength = 7;
  } else if (structure.longSentencesPercent <= 40) {
    breakdown.sentenceLength = 4;
  } else {
    breakdown.sentenceLength = 1;
  }

  // 5. Section Count (10 points) - Good structure
  if (structure.sectionCount >= 5) {
    breakdown.sectionCount = 10;
  } else if (structure.sectionCount >= 3) {
    breakdown.sectionCount = 8;
  } else if (structure.sectionCount >= 1) {
    breakdown.sectionCount = 5;
  } else {
    breakdown.sectionCount = 2;
  }

  // 6. Image Count (10 points) - >0 images
  if (structure.imageCount >= 3) {
    breakdown.imageCount = 10;
  } else if (structure.imageCount >= 1) {
    breakdown.imageCount = 7;
  } else {
    breakdown.imageCount = 0;
  }

  // 7. Link Count (10 points) - >0 links
  if (structure.linkCount >= 3) {
    breakdown.linkCount = 10;
  } else if (structure.linkCount >= 1) {
    breakdown.linkCount = 7;
  } else {
    breakdown.linkCount = 0;
  }

  // 8. Keyphrase Density (10 points) - 1-5%
  if (keyphrase.density >= 1 && keyphrase.density <= 3) {
    breakdown.keyphraseDensity = 10;
  } else if (keyphrase.density >= 0.5 && keyphrase.density <= 5) {
    breakdown.keyphraseDensity = 7;
  } else if (keyphrase.density > 0) {
    breakdown.keyphraseDensity = 4;
  } else {
    breakdown.keyphraseDensity = 0;
  }

  // 9. Keyphrase Placement (10 points) - In title, intro, meta
  let placementScore = 0;
  if (keyphrase.inTitle) placementScore += 4;
  if (keyphrase.inIntroduction) placementScore += 3;
  if (keyphrase.inMetaDescription) placementScore += 3;
  breakdown.keyphrasePlacement = placementScore;

  // 10. Content Completeness (10 points) - Overall content quality
  let completenessScore = 0;
  if (structure.wordCount >= 500) completenessScore += 3;
  if (structure.sectionCount >= 3) completenessScore += 2;
  if (structure.imageCount >= 1) completenessScore += 2;
  if (structure.linkCount >= 1) completenessScore += 2;
  if (keyphrase.frequency >= 3) completenessScore += 1;
  breakdown.contentCompleteness = Math.min(completenessScore, 10);

  // Calculate total score
  totalScore = (Object.values(breakdown) as number[]).reduce((sum: number, score: number) => sum + score, 0);

  return {
    score: Math.min(totalScore, 100),
    breakdown
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access this endpoint.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get the blog post
    const blogPost = await BlogPost.findOne({
      _id: id,
      clerkId: userId,
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: 'Post not found or you do not have permission to access it' },
        { status: 404 }
      );
    }

    // Perform analysis
    const gradeLevel = calculateFleschKincaidGradeLevel(blogPost.content);
    const structure = analyzeContentStructure(blogPost.content);
    const keyphrase = analyzeKeyphraseDensity(
      blogPost.content, 
      blogPost.title,
      '' // Meta description would come from metadata if available
    );

    const scoring = calculateOverallScore(gradeLevel, structure, keyphrase);

    // Return comprehensive analysis
    return NextResponse.json({
      success: true,
      analysis: {
        readability: {
          gradeLevel,
          recommendation: gradeLevel >= 7 && gradeLevel <= 8 ? 'Excellent' : 
                          gradeLevel >= 6 && gradeLevel <= 9 ? 'Good' :
                          gradeLevel >= 5 && gradeLevel <= 10 ? 'Fair' : 'Needs Improvement',
          target: '7th-8th grade'
        },
        structure,
        keyphrase,
        scoring
      }
    });

  } catch (error: unknown) {
    console.error('❌ Blog Scoring Error:', error);
    
    return NextResponse.json({
      error: 'Failed to analyze blog post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 