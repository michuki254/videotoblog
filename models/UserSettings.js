import mongoose from 'mongoose';

const UserSettingsSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  wordpress: {
    url: {
      type: String,
      default: ''
    },
    username: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      default: ''
    },
    lastTested: {
      type: Date,
      default: null
    },
    connectionStatus: {
      type: String,
      enum: ['connected', 'failed', 'not-tested'],
      default: 'not-tested'
    }
  },
  medium: {
    accessToken: {
      type: String,
      default: ''
    },
    authorId: {
      type: String,
      default: ''
    },
    publicationId: {
      type: String,
      default: ''
    },
    lastTested: {
      type: Date,
      default: null
    },
    connectionStatus: {
      type: String,
      enum: ['success', 'error', 'idle'],
      default: 'idle'
    }
  },
  blogger: {
    apiKey: {
      type: String,
      default: ''
    },
    blogId: {
      type: String,
      default: ''
    },
    blogName: {
      type: String,
      default: ''
    },
    blogUrl: {
      type: String,
      default: ''
    },
    lastTested: {
      type: Date,
      default: null
    },
    connectionStatus: {
      type: String,
      enum: ['success', 'error', 'idle'],
      default: 'idle'
    }
  },
  ghost: {
    url: {
      type: String,
      default: ''
    },
    adminApiKey: {
      type: String,
      default: ''
    },
    apiUrl: {
      type: String,
      default: ''
    },
    blogName: {
      type: String,
      default: ''
    },
    lastTested: {
      type: Date,
      default: null
    },
    connectionStatus: {
      type: String,
      enum: ['success', 'error', 'idle'],
      default: 'idle'
    }
  },
  webflow: {
    siteId: {
      type: String,
      default: ''
    },
    apiToken: {
      type: String,
      default: ''
    },
    collectionId: {
      type: String,
      default: ''
    },
    siteName: {
      type: String,
      default: ''
    },
    collectionName: {
      type: String,
      default: ''
    },
    lastTested: {
      type: Date,
      default: null
    },
    connectionStatus: {
      type: String,
      enum: ['success', 'error', 'idle'],
      default: 'idle'
    }
  },
  pinterest: {
    accessToken: {
      type: String,
      default: ''
    },
    refreshToken: {
      type: String,
      default: ''
    },
    tokenExpiresAt: {
      type: Date,
      default: null
    },
    businessAccountId: {
      type: String,
      default: ''
    },
    username: {
      type: String,
      default: ''
    },
    lastTested: {
      type: Date,
      default: null
    },
    connectionStatus: {
      type: String,
      enum: ['success', 'error', 'idle'],
      default: 'idle'
    },
    defaultBoard: {
      id: {
        type: String,
        default: ''
      },
      name: {
        type: String,
        default: ''
      }
    },
    aiImageSettings: {
      enabled: {
        type: Boolean,
        default: true
      },
      style: {
        type: String,
        enum: ['realistic', 'artistic', 'minimalist', 'vibrant', 'custom'],
        default: 'realistic'
      },
      aspectRatio: {
        type: String,
        enum: ['1:1', '2:3', '9:16'],
        default: '2:3'
      },
      customPrompt: {
        type: String,
        default: ''
      }
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  integrations: {
    medium: {
      enabled: {
        type: Boolean,
        default: false
      },
      config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    },
    ghost: {
      enabled: {
        type: Boolean,
        default: false
      },
      config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    }
  }
}, {
  timestamps: true
});

// Ensure we don't create duplicate models
const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);

export default UserSettings; 