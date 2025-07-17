import mongoose from 'mongoose'

const SettingsSchema = new mongoose.Schema({
  // General Settings
  general: {
    appName: {
      type: String,
      default: 'VideoToBlog'
    },
    appDescription: {
      type: String,
      default: 'Convert YouTube videos to SEO-optimized blog posts'
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    maintenanceMessage: {
      type: String,
      default: 'We are currently performing maintenance. Please check back later.'
    },
    supportEmail: {
      type: String,
      default: 'support@videotoblog.com'
    },
    logoUrl: {
      type: String,
      default: '/logo.png'
    }
  },

  // AI Configuration
  ai: {
    defaultModel: {
      type: String,
      enum: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-2'],
      default: 'gpt-4'
    },
    maxTokens: {
      type: Number,
      default: 4000
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    enableScreenshots: {
      type: Boolean,
      default: true
    },
    screenshotInterval: {
      type: Number,
      default: 30, // seconds
    },
    enableContentAnalysis: {
      type: Boolean,
      default: true
    }
  },

  // LemonSqueezy Configuration
  lemonSqueezy: {
    storeId: {
      type: String,
      default: ''
    },
    apiKey: {
      type: String,
      default: ''
    },
    webhookSecret: {
      type: String,
      default: ''
    },
    testMode: {
      type: Boolean,
      default: false
    },
    // Plan limits (synced from LemonSqueezy)
    planLimits: {
      free: {
        videosPerMonth: { type: Number, default: 2 },
        storageGB: { type: Number, default: 1 },
        maxVideoLength: { type: Number, default: 10 }
      },
      basic: {
        videosPerMonth: { type: Number, default: 20 },
        storageGB: { type: Number, default: 10 },
        maxVideoLength: { type: Number, default: 30 }
      },
      pro: {
        videosPerMonth: { type: Number, default: 100 },
        storageGB: { type: Number, default: 50 },
        maxVideoLength: { type: Number, default: 60 }
      },
      enterprise: {
        videosPerMonth: { type: Number, default: -1 },
        storageGB: { type: Number, default: -1 },
        maxVideoLength: { type: Number, default: -1 }
      }
    }
  },

  // Email Settings
  email: {
    provider: {
      type: String,
      enum: ['sendgrid', 'mailgun', 'ses', 'sendx', 'mailchimp', 'postmark', 'smtp', 'resend'],
      default: 'sendgrid'
    },
    fromEmail: {
      type: String,
      default: 'noreply@videotoblog.com'
    },
    fromName: {
      type: String,
      default: 'VideoToBlog'
    },
    sendWelcomeEmail: {
      type: Boolean,
      default: true
    },
    sendConversionNotification: {
      type: Boolean,
      default: true
    },
    // Provider-specific configurations
    sendgrid: {
      apiKey: { type: String, default: '' }
    },
    mailgun: {
      apiKey: { type: String, default: '' },
      domain: { type: String, default: '' },
      region: { type: String, enum: ['us', 'eu'], default: 'us' }
    },
    ses: {
      accessKeyId: { type: String, default: '' },
      secretAccessKey: { type: String, default: '' },
      region: { type: String, default: 'us-east-1' }
    },
    sendx: {
      apiKey: { type: String, default: '' },
      teamId: { type: String, default: '' }
    },
    mailchimp: {
      apiKey: { type: String, default: '' },
      server: { type: String, default: '' } // e.g., us1, us2, etc.
    },
    postmark: {
      serverToken: { type: String, default: '' }
    },
    resend: {
      apiKey: { type: String, default: '' }
    },
    smtp: {
      host: { type: String, default: '' },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false }, // true for 465, false for other ports
      auth: {
        user: { type: String, default: '' },
        pass: { type: String, default: '' }
      }
    }
  },

  // API Rate Limits
  rateLimits: {
    conversionsPerHour: {
      type: Number,
      default: 10
    },
    apiCallsPerMinute: {
      type: Number,
      default: 60
    },
    maxConcurrentConversions: {
      type: Number,
      default: 3
    }
  },

  // Security Settings
  security: {
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    allowedDomains: [{
      type: String
    }],
    ipWhitelist: [{
      type: String
    }],
    enableRateLimiting: {
      type: Boolean,
      default: true
    },
    enableCaptcha: {
      type: Boolean,
      default: false
    }
  },

  // Integration Settings
  integrations: {
    wordpress: {
      enabled: { type: Boolean, default: true },
      requireApiKey: { type: Boolean, default: true }
    },
    medium: {
      enabled: { type: Boolean, default: true },
      requireApiKey: { type: Boolean, default: true }
    },
    pinterest: {
      enabled: { type: Boolean, default: true },
      requireApiKey: { type: Boolean, default: true }
    },
    youtube: {
      apiKey: { type: String, default: '' },
      quotaLimit: { type: Number, default: 10000 }
    }
  },

  // Analytics & Monitoring
  analytics: {
    enableTracking: {
      type: Boolean,
      default: true
    },
    googleAnalyticsId: {
      type: String,
      default: ''
    },
    enableErrorReporting: {
      type: Boolean,
      default: true
    },
    sentryDsn: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
})

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({})
  }
  
  // Migration: Add lemonSqueezy field if it doesn't exist
  if (!settings.lemonSqueezy) {
    settings.lemonSqueezy = {
      storeId: '',
      apiKey: '',
      webhookSecret: '',
      testMode: false,
      planLimits: {
        free: { videosPerMonth: 2, storageGB: 1, maxVideoLength: 10 },
        basic: { videosPerMonth: 20, storageGB: 10, maxVideoLength: 30 },
        pro: { videosPerMonth: 100, storageGB: 50, maxVideoLength: 60 },
        enterprise: { videosPerMonth: -1, storageGB: -1, maxVideoLength: -1 }
      }
    }
    await settings.save()
  }
  
  return settings
}

SettingsSchema.statics.updateSettings = async function(updates: any) {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create(updates)
  } else {
    Object.assign(settings, updates)
    await settings.save()
  }
  return settings
}

export interface ISettings extends mongoose.Document {
  general: {
    appName: string
    appDescription: string
    maintenanceMode: boolean
    maintenanceMessage: string
    supportEmail: string
    logoUrl: string
  }
  ai: {
    defaultModel: string
    maxTokens: number
    temperature: number
    enableScreenshots: boolean
    screenshotInterval: number
    enableContentAnalysis: boolean
  }
  lemonSqueezy: {
    storeId: string
    apiKey: string
    webhookSecret: string
    testMode: boolean
    planLimits: {
      [key: string]: {
        videosPerMonth: number
        storageGB: number
        maxVideoLength: number
      }
    }
  }
  email: {
    provider: string
    fromEmail: string
    fromName: string
    sendWelcomeEmail: boolean
    sendConversionNotification: boolean
    sendgrid?: { apiKey: string }
    mailgun?: { apiKey: string; domain: string; region: string }
    ses?: { accessKeyId: string; secretAccessKey: string; region: string }
    sendx?: { apiKey: string; teamId: string }
    mailchimp?: { apiKey: string; server: string }
    postmark?: { serverToken: string }
    resend?: { apiKey: string }
    smtp?: { 
      host: string
      port: number
      secure: boolean
      auth: { user: string; pass: string }
    }
  }
  rateLimits: {
    conversionsPerHour: number
    apiCallsPerMinute: number
    maxConcurrentConversions: number
  }
  security: {
    requireEmailVerification: boolean
    allowedDomains: string[]
    ipWhitelist: string[]
    enableRateLimiting: boolean
    enableCaptcha: boolean
  }
  integrations: {
    wordpress: { enabled: boolean; requireApiKey: boolean }
    medium: { enabled: boolean; requireApiKey: boolean }
    pinterest: { enabled: boolean; requireApiKey: boolean }
    youtube: { apiKey: string; quotaLimit: number }
  }
  analytics: {
    enableTracking: boolean
    googleAnalyticsId: string
    enableErrorReporting: boolean
    sentryDsn: string
  }
}

export interface ISettingsModel extends mongoose.Model<ISettings> {
  getSettings(): Promise<ISettings>
  updateSettings(updates: any): Promise<ISettings>
}

const Settings = (mongoose.models.Settings as ISettingsModel) || 
  mongoose.model<ISettings, ISettingsModel>('Settings', SettingsSchema)

export default Settings