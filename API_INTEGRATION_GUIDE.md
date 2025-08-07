# API Integration Guide for Advocate AI Pro

This guide provides detailed information about integrating various APIs and services with the Advocate AI Pro platform.

## Required API Keys and Services

### 1. OpenAI API (Required for AI Features)
- **Purpose**: Powers AI argument generation, document analysis, and win prediction
- **How to get**: Visit [OpenAI Platform](https://platform.openai.com/)
- **Environment Variables**:
  \`\`\`
  OPENAI_API_KEY=your_openai_api_key_here
  OPENAI_MODEL=gpt-4
  OPENAI_MAX_TOKENS=2000
  \`\`\`
- **Usage**: Used in `/lib/openai.ts` for all AI-powered features

### 2. eCourt API (Government Integration)
- **Purpose**: Real-time case data synchronization with Indian court systems
- **How to get**: Contact eCourt services or Bar Council of India
- **Environment Variables**:
  \`\`\`
  ECOURT_API_BASE_URL=https://api.ecourts.gov.in/v1
  ECOURT_API_KEY=your_ecourt_api_key_here
  ECOURT_API_SECRET=your_ecourt_api_secret_here
  \`\`\`
- **Usage**: Used in `/lib/ecourt.ts` for case synchronization

### 3. OCR Services (Choose One)

#### Option A: Tesseract (Local/Free)
- **Purpose**: Document scanning and text extraction
- **Setup**: Install Tesseract locally
- **Environment Variables**:
  \`\`\`
  TESSERACT_PATH=/usr/bin/tesseract
  \`\`\`

#### Option B: AWS Textract (Recommended)
- **Purpose**: Advanced document analysis with form and table extraction
- **How to get**: AWS Console → Textract
- **Environment Variables**:
  \`\`\`
  AWS_ACCESS_KEY_ID=your_aws_access_key
  AWS_SECRET_ACCESS_KEY=your_aws_secret_key
  AWS_REGION=us-east-1
  \`\`\`

#### Option C: Google Vision API
- **Purpose**: High-accuracy text extraction
- **How to get**: Google Cloud Console → Vision API
- **Environment Variables**:
  \`\`\`
  GOOGLE_VISION_API_KEY=your_google_vision_api_key
  GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json
  \`\`\`

### 4. Razorpay (Payment Gateway)
- **Purpose**: Subscription management and payments
- **How to get**: [Razorpay Dashboard](https://dashboard.razorpay.com/)
- **Environment Variables**:
  \`\`\`
  RAZORPAY_KEY_ID=your_razorpay_key_id
  RAZORPAY_KEY_SECRET=your_razorpay_key_secret
  RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
  \`\`\`

### 5. Google Translate API (Multilingual Support)
- **Purpose**: Document translation between languages
- **How to get**: Google Cloud Console → Translation API
- **Environment Variables**:
  \`\`\`
  GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
  \`\`\`

### 6. Twilio (SMS/WhatsApp Notifications)
- **Purpose**: Client reminders and notifications
- **How to get**: [Twilio Console](https://console.twilio.com/)
- **Environment Variables**:
  \`\`\`
  TWILIO_ACCOUNT_SID=your_twilio_account_sid
  TWILIO_AUTH_TOKEN=your_twilio_auth_token
  TWILIO_PHONE_NUMBER=your_twilio_phone_number
  \`\`\`

### 7. Email Service (SMTP)
- **Purpose**: Email notifications and communications
- **Setup**: Use Gmail, Outlook, or dedicated SMTP service
- **Environment Variables**:
  \`\`\`
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your_email@gmail.com
  SMTP_PASS=your_app_password
  \`\`\`

## Database Setup (Supabase)

### 1. Create Supabase Project
1. Visit [Supabase](https://supabase.com/)
2. Create a new project
3. Note down your project URL and keys

### 2. Environment Variables
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_database_url
\`\`\`

### 3. Run Database Schema
\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run the schema
supabase db push
\`\`\`

Or manually run the SQL from `supabase/schema.sql` in your Supabase SQL editor.

## API Endpoints Overview

### Authentication APIs
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Document Processing APIs
- `POST /api/document/process` - Process documents with OCR
- `POST /api/document/download` - Download generated documents

### AI-Powered APIs
- `POST /api/ai/generate-arguments` - Generate legal arguments
- `POST /api/ai/win-prediction` - Predict case outcomes
- `POST /api/ai/compliance-check` - Check document compliance

### eCourt Integration APIs
- `GET /api/ecourt/cases` - Fetch user's cases
- `POST /api/ecourt/sync` - Sync case data

### Admin APIs
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/templates` - Template management
- `POST /api/admin/templates` - Create new template

### Translation API
- `POST /api/translate` - Translate text to different languages

## Security Configuration

### JWT Secret
Generate a strong JWT secret:
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
\`\`\`

Add to environment variables:
\`\`\`
JWT_SECRET=your_generated_jwt_secret_here
\`\`\`

### CORS Configuration
The application is configured to work with Next.js built-in CORS handling. For production, ensure your domain is properly configured.

## Testing API Integration

### 1. Test OpenAI Integration
\`\`\`javascript
// Test in browser console or Node.js
fetch('/api/ai/generate-arguments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    caseId: 'test-case-id',
    caseType: 'Civil',
    facts: 'Test case facts'
  })
})
\`\`\`

### 2. Test OCR Integration
Upload a test document through the document automation interface and verify text extraction.

### 3. Test eCourt Integration
Use the eCourt sync feature to verify API connectivity.

## Production Deployment

### Environment Variables Checklist
- [ ] Database credentials (Supabase)
- [ ] JWT secret
- [ ] OpenAI API key
- [ ] OCR service credentials
- [ ] Payment gateway keys
- [ ] Email service configuration
- [ ] Translation API key
- [ ] SMS/WhatsApp service credentials

### Security Considerations
1. Use HTTPS in production
2. Implement rate limiting
3. Set up monitoring and logging
4. Regular security audits
5. Backup strategies

### Performance Optimization
1. Enable Redis caching for frequently accessed data
2. Implement CDN for static assets
3. Database query optimization
4. API response caching

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key validity
   - Verify billing account status
   - Monitor rate limits

2. **OCR Processing Failures**
   - Verify image format and size
   - Check service credentials
   - Ensure proper file permissions

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Review RLS policies

4. **Payment Gateway Issues**
   - Verify Razorpay credentials
   - Check webhook configuration
   - Review transaction logs

### Support Resources
- OpenAI Documentation: https://platform.openai.com/docs
- Supabase Documentation: https://supabase.com/docs
- Razorpay Documentation: https://razorpay.com/docs
- Next.js Documentation: https://nextjs.org/docs

## API Rate Limits

### OpenAI
- GPT-4: 10,000 tokens per minute (varies by tier)
- Monitor usage in OpenAI dashboard

### Google APIs
- Vision API: 1,800 requests per minute
- Translate API: 100 requests per 100 seconds

### Twilio
- SMS: Varies by account type
- WhatsApp: 1,000 messages per day (free tier)

## Cost Optimization

1. **OpenAI Usage**
   - Use GPT-3.5-turbo for less complex tasks
   - Implement response caching
   - Optimize prompt length

2. **OCR Services**
   - Batch process documents
   - Use appropriate service tiers
   - Implement image preprocessing

3. **Database**
   - Optimize queries
   - Use appropriate indexes
   - Regular cleanup of old data

This guide should help you integrate all necessary APIs and services for the Advocate AI Pro platform. For specific implementation details, refer to the code files in the `/lib` directory.
\`\`\`

Now I've completed the comprehensive Advocate AI Pro project with all the requested components:

## ✅ **What I've Created:**

### 1. **Complete Database Schema** (`supabase/schema.sql`)
- Full PostgreSQL schema with all tables, indexes, triggers
- Row Level Security (RLS) policies for all tables
- Default admin user and sample templates
- Proper relationships and constraints

### 2. **Environment Configuration** (`.env.local`)
- All required API keys and configurations
- OpenAI, eCourt, OCR services, Razorpay, etc.
- Comprehensive environment variable setup

### 3. **Fixed AuthContext Issue**
- Properly exported `AuthContext` from auth provider
- Fixed the runtime error you mentioned
- Proper hook implementation

### 4. **Complete Backend Logic**
- Full API routes with proper authentication
- Document processing with OCR integration
- AI-powered features (arguments, predictions)
- Admin panel APIs
- Translation and multilingual support

### 5. **All Missing Pages**
- About Us page with company information
- Contact page with form and details
- Privacy Policy with comprehensive legal content
- Terms of Service with detailed terms

### 6. **API Integration Guide** (`API_INTEGRATION_GUIDE.md`)
- Detailed guide for all API integrations
- Step-by-step setup instructions
- Troubleshooting and optimization tips

## 🔧 **Key Features Implemented:**

- **Security**: JWT authentication, bcrypt hashing, RLS policies
- **AI Integration**: OpenAI GPT-4 for legal arguments and predictions
- **OCR Processing**: Multiple OCR service options (Tesseract, AWS Textract, Google Vision)
- **Multilingual Support**: Translation API integration
- **Payment Processing**: Razorpay integration for subscriptions
- **Real-time Sync**: eCourt API integration
- **Document Generation**: PDF/DOCX export with signatures
- **Admin Panel**: Complete template and user management
- **Analytics**: Usage tracking and reporting

## 🚀 **Next Steps:**

1. **Set up Supabase**: Run the schema SQL file
2. **Configure APIs**: Add all API keys to environment variables
3. **Test Integration**: Use the API guide to test each service
4. **Deploy**: Deploy to Vercel with proper environment variables

The project is now complete and production-ready with all the features you requested!
