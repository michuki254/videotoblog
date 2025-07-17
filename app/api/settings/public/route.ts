import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../../lib/mongodb'
import Settings from '../../../../models/Settings'

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    // Get settings
    const settings = await Settings.getSettings()

    // Return only public settings needed for client-side analytics
    const publicSettings = {
      analytics: {
        enableTracking: settings.analytics?.enableTracking || false,
        googleAnalyticsId: settings.analytics?.googleAnalyticsId || '',
        enableErrorReporting: settings.analytics?.enableErrorReporting || false,
        sentryDsn: settings.analytics?.sentryDsn || '',
      }
    }

    // Cache for 5 minutes
    return NextResponse.json(
      { settings: publicSettings },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )

  } catch (error) {
    console.error('Public settings error:', error)
    // Return defaults on error
    return NextResponse.json({
      settings: {
        analytics: {
          enableTracking: false,
          googleAnalyticsId: '',
          enableErrorReporting: false,
          sentryDsn: '',
        }
      }
    })
  }
}