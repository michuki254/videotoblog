# Admin Dashboard Setup Guide

## Overview

The admin dashboard provides comprehensive management capabilities for your SaaS application, including:

- **User Management**: View, search, filter, and manage all users
- **Subscription Management**: Monitor and manage all subscriptions
- **Analytics**: View key metrics and insights (coming soon)
- **Content Management**: Manage blog posts and content (coming soon)
- **System Settings**: Configure application settings (coming soon)

## Features

### ✅ Implemented Features

1. **Admin Authentication & Authorization**
   - Role-based access control (USER, ADMIN, SUPER_ADMIN)
   - Secure admin route protection
   - Admin access verification

2. **Dashboard Overview**
   - User statistics (total, active, growth rate)
   - Subscription metrics (active subscriptions, plan distribution)
   - Revenue estimates
   - Usage statistics (videos converted, storage used)
   - Recent activity feed

3. **User Management**
   - View all users with pagination
   - Search users by name/email
   - Filter by role and status
   - Edit user roles and status
   - View user subscription details

4. **Subscription Management**
   - View all subscriptions with pagination
   - Search by customer email
   - Filter by plan and status
   - View usage and limits
   - Monitor subscription periods

### 🚧 Coming Soon Features

- Advanced Analytics with charts
- Content Management system
- Bulk operations
- Email notifications
- System configuration
- API management

## Setup Instructions

### 1. Database Setup

The admin system uses the existing MongoDB database with additional User model fields:

```javascript
// User model includes:
{
  clerkId: String,
  email: String,
  firstName: String,
  lastName: String,
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN', // New field
  isActive: Boolean, // New field
  totalVideosConverted: Number, // New field
  totalStorageUsed: Number, // New field
  // ... other fields
}
```

### 2. Create Your First Admin User

#### Option 1: Using the Setup Script

1. Run the setup script with a user's email:
```bash
node scripts/setup-admin.js your-email@example.com
```

#### Option 2: Manual Database Update

1. Connect to your MongoDB database
2. Find your user document by email
3. Update the role field:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

### 3. Access the Admin Dashboard

1. Sign in to your application with the admin user account
2. Navigate to `/admin` or use the "Admin Panel" link in the sidebar
3. You should see the admin dashboard with full access

## API Endpoints

### Admin Authentication
- `GET /api/admin/check-access` - Verify admin access

### Dashboard Statistics
- `GET /api/admin/stats` - Get dashboard statistics

### User Management
- `GET /api/admin/users` - Get users with pagination and filters
- `PUT /api/admin/users` - Update user role/status

### Subscription Management
- `GET /api/admin/subscriptions` - Get subscriptions with pagination and filters
- `PUT /api/admin/subscriptions` - Update subscription details
- `DELETE /api/admin/subscriptions` - Delete subscription

## Security Features

1. **Role-Based Access Control**
   - Only users with ADMIN or SUPER_ADMIN roles can access admin routes
   - Middleware protection on all admin API endpoints

2. **Route Protection**
   - Admin layout checks permissions before rendering
   - Automatic redirect to user dashboard for unauthorized users

3. **Data Isolation**
   - Admin users can only perform allowed operations
   - Sensitive data is properly filtered in responses

## User Roles

### USER (Default)
- Access to regular user dashboard
- Can manage their own content and subscription

### ADMIN
- Access to admin dashboard
- Can manage users and subscriptions
- Can view analytics and system stats

### SUPER_ADMIN
- All ADMIN permissions
- Can manage other admin users
- Access to system configuration (coming soon)

## Customization

### Adding New Admin Features

1. Create new API routes in `/app/api/admin/`
2. Add new pages in `/app/admin/`
3. Update the AdminSidebar navigation
4. Implement proper permission checks

### Styling

The admin dashboard uses a red/orange color scheme to differentiate from the user dashboard:
- User Dashboard: Blue/Purple theme
- Admin Dashboard: Red/Orange theme

## Troubleshooting

### Common Issues

1. **"Access Denied" Error**
   - Ensure your user has ADMIN or SUPER_ADMIN role
   - Check database connection
   - Verify the user exists in the database

2. **Admin Panel Link Not Showing**
   - The link only appears for admin users
   - Check user role in database
   - Clear browser cache and refresh

3. **API Errors**
   - Check MongoDB connection
   - Verify environment variables
   - Check server logs for detailed errors

### Debug Commands

```bash
# Check user roles in database
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log(users.map(u => ({ email: u.email, role: u.role })));
  process.exit(0);
});
"
```

## Development

### Running in Development

1. Ensure MongoDB is running
2. Set up environment variables
3. Run the development server:
```bash
npm run dev
```

### Testing Admin Features

1. Create test users with different roles
2. Test permission boundaries
3. Verify data isolation
4. Test pagination and filtering

## Production Deployment

1. Ensure all environment variables are set
2. Run database migrations if needed
3. Set up proper admin users
4. Test admin access after deployment
5. Monitor admin activity logs

## Support

For issues or questions about the admin dashboard:
1. Check this documentation
2. Review server logs
3. Test with a fresh admin user
4. Verify database connectivity

---

**Note**: The admin dashboard is a powerful tool. Always ensure proper access controls and regular security audits in production environments. 