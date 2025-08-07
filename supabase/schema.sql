-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_type AS ENUM ('lawyer', 'admin');
CREATE TYPE document_status AS ENUM ('draft', 'processing', 'completed', 'failed');
CREATE TYPE case_status AS ENUM ('active', 'closed', 'pending', 'dismissed');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'expired');
CREATE TYPE template_status AS ENUM ('active', 'inactive', 'draft');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    bar_council_id VARCHAR(50),
    specialization VARCHAR(100),
    experience VARCHAR(20),
    user_type user_type DEFAULT 'lawyer',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    placeholders JSONB DEFAULT '[]',
    required_documents JSONB DEFAULT '[]',
    language VARCHAR(20) DEFAULT 'english',
    status template_status DEFAULT 'active',
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases table
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    case_number VARCHAR(100),
    case_type VARCHAR(100),
    court VARCHAR(255),
    judge_name VARCHAR(255),
    judge_id VARCHAR(100),
    client_name VARCHAR(255),
    opposing_party VARCHAR(255),
    case_value DECIMAL(15,2),
    facts TEXT,
    stage VARCHAR(100),
    status case_status DEFAULT 'active',
    next_hearing TIMESTAMP WITH TIME ZONE,
    filed_date DATE,
    ecourt_case_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    case_id UUID REFERENCES cases(id),
    template_id UUID REFERENCES templates(id),
    template_name VARCHAR(255),
    original_files JSONB DEFAULT '[]',
    extracted_data JSONB DEFAULT '{}',
    generated_content TEXT,
    file_url TEXT,
    file_type VARCHAR(20),
    status document_status DEFAULT 'draft',
    language VARCHAR(20) DEFAULT 'english',
    signature_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Judge analysis table
CREATE TABLE judge_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judge_id VARCHAR(100) UNIQUE NOT NULL,
    judge_name VARCHAR(255) NOT NULL,
    court VARCHAR(255),
    total_cases INTEGER DEFAULT 0,
    favorable_rate DECIMAL(5,2) DEFAULT 0,
    avg_hearing_time INTEGER DEFAULT 0,
    tendencies JSONB DEFAULT '{}',
    insights JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI predictions table
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL, -- 'win_probability', 'argument_analysis', etc.
    input_data JSONB NOT NULL,
    prediction_result JSONB NOT NULL,
    confidence_score DECIMAL(5,2),
    factors JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL, -- 'monthly', 'yearly'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status subscription_status DEFAULT 'active',
    razorpay_subscription_id VARCHAR(255),
    razorpay_customer_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage analytics table
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50), -- 'document', 'template', 'case', etc.
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_status ON templates(status);
CREATE INDEX idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX idx_usage_analytics_created_at ON usage_analytics(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE templates 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.template_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to increment template usage when document is created
CREATE TRIGGER increment_template_usage_trigger 
    AFTER INSERT ON documents 
    FOR EACH ROW 
    WHEN (NEW.template_id IS NOT NULL)
    EXECUTE FUNCTION increment_template_usage();

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND user_type = 'admin'
    )
);

-- Templates policies
CREATE POLICY "Everyone can view active templates" ON templates FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage templates" ON templates FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND user_type = 'admin'
    )
);

-- Cases policies
CREATE POLICY "Users can view their own cases" ON cases FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage their own cases" ON cases FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Admins can view all cases" ON cases FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND user_type = 'admin'
    )
);

-- Documents policies
CREATE POLICY "Users can view their own documents" ON documents FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage their own documents" ON documents FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Admins can view all documents" ON documents FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND user_type = 'admin'
    )
);

-- Judge analysis policies
CREATE POLICY "Everyone can view judge analysis" ON judge_analysis FOR SELECT TO authenticated;
CREATE POLICY "Admins can manage judge analysis" ON judge_analysis FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND user_type = 'admin'
    )
);

-- AI predictions policies
CREATE POLICY "Users can view their own predictions" ON ai_predictions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create their own predictions" ON ai_predictions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Admins can view all predictions" ON ai_predictions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND user_type = 'admin'
    )
);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage their own subscriptions" ON subscriptions FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND user_type = 'admin'
    )
);

-- Usage analytics policies
CREATE POLICY "Users can view their own analytics" ON usage_analytics FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "System can insert analytics" ON usage_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all analytics" ON usage_analytics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND user_type = 'admin'
    )
);

-- System settings policies
CREATE POLICY "Admins can manage system settings" ON system_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND user_type = 'admin'
    )
);

-- Insert default admin user (password: admin123)
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    password_hash, 
    user_type, 
    is_active, 
    email_verified
) VALUES (
    'Admin',
    'User',
    'admin@advocateaipro.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJL9.KeF2', -- admin123
    'admin',
    true,
    true
);

-- Insert default templates
INSERT INTO templates (name, description, category, content, placeholders, required_documents, created_by) VALUES
(
    'Sale Deed',
    'Property sale agreement document',
    'Property',
    'SALE DEED

This Sale Deed is executed on {{date}} between {{seller_name}}, son/daughter of {{seller_father_name}}, residing at {{seller_address}} (hereinafter called "VENDOR") of the ONE PART and {{buyer_name}}, son/daughter of {{buyer_father_name}}, residing at {{buyer_address}} (hereinafter called "PURCHASER") of the OTHER PART.

WHEREAS the Vendor is the absolute owner of the property described in the Schedule hereunder and is competent to sell the same.

AND WHEREAS the Purchaser has agreed to purchase the said property for a consideration of Rs. {{sale_amount}} (Rupees {{sale_amount_words}}).

NOW THIS DEED WITNESSETH that in consideration of the sum of Rs. {{sale_amount}} paid by the Purchaser to the Vendor, the Vendor hereby grants, conveys, transfers and assigns unto the Purchaser ALL THAT piece and parcel of land measuring {{property_area}} situated at {{property_address}} and more particularly described in the Schedule hereunder.

SCHEDULE OF PROPERTY:
{{property_description}}

IN WITNESS WHEREOF the parties have executed this deed on the day and year first above written.

VENDOR: {{seller_name}}
PURCHASER: {{buyer_name}}

WITNESSES:
1. {{witness1_name}}
2. {{witness2_name}}',
    '["{{date}}", "{{seller_name}}", "{{seller_father_name}}", "{{seller_address}}", "{{buyer_name}}", "{{buyer_father_name}}", "{{buyer_address}}", "{{sale_amount}}", "{{sale_amount_words}}", "{{property_area}}", "{{property_address}}", "{{property_description}}", "{{witness1_name}}", "{{witness2_name}}"]',
    '["Aadhaar Card", "PAN Card", "Property Papers", "NOC Certificate"]',
    (SELECT id FROM users WHERE email = 'admin@advocateaipro.com')
),
(
    'Rent Agreement',
    'Rental property agreement',
    'Property',
    'RENT AGREEMENT

This Rent Agreement is made on {{date}} between {{landlord_name}}, son/daughter of {{landlord_father_name}}, residing at {{landlord_address}} (hereinafter called "LANDLORD") and {{tenant_name}}, son/daughter of {{tenant_father_name}}, residing at {{tenant_address}} (hereinafter called "TENANT").

WHEREAS the Landlord is the lawful owner of the premises situated at {{property_address}} and desires to let out the same.

AND WHEREAS the Tenant desires to take the said premises on rent.

NOW IT IS HEREBY AGREED between the parties as follows:

1. The Landlord lets out the premises to the Tenant for a period of {{duration}} months commencing from {{start_date}}.

2. The monthly rent shall be Rs. {{rent_amount}} (Rupees {{rent_amount_words}}) payable in advance by {{payment_date}} of each month.

3. The Tenant shall pay a security deposit of Rs. {{security_deposit}} which shall be refunded at the time of vacating the premises.

4. The Tenant shall use the premises only for {{usage_purpose}} purposes.

5. The agreement can be terminated by either party by giving {{notice_period}} days written notice.

IN WITNESS WHEREOF both parties have signed this agreement.

LANDLORD: {{landlord_name}}
TENANT: {{tenant_name}}

WITNESSES:
1. {{witness1_name}}
2. {{witness2_name}}',
    '["{{date}}", "{{landlord_name}}", "{{landlord_father_name}}", "{{landlord_address}}", "{{tenant_name}}", "{{tenant_father_name}}", "{{tenant_address}}", "{{property_address}}", "{{duration}}", "{{start_date}}", "{{rent_amount}}", "{{rent_amount_words}}", "{{payment_date}}", "{{security_deposit}}", "{{usage_purpose}}", "{{notice_period}}", "{{witness1_name}}", "{{witness2_name}}"]',
    '["Aadhaar Card", "Property Papers", "Income Proof"]',
    (SELECT id FROM users WHERE email = 'admin@advocateaipro.com')
);

-- Insert system settings
INSERT INTO system_settings (key, value, description) VALUES
('ocr_service', '{"provider": "tesseract", "api_key": "", "enabled": true}', 'OCR service configuration'),
('ai_service', '{"provider": "openai", "model": "gpt-4", "enabled": true}', 'AI service configuration'),
('ecourt_api', '{"base_url": "", "api_key": "", "enabled": false}', 'eCourt API configuration'),
('payment_gateway', '{"provider": "razorpay", "key_id": "", "key_secret": "", "enabled": false}', 'Payment gateway configuration'),
('email_service', '{"provider": "smtp", "host": "", "port": 587, "enabled": false}', 'Email service configuration');
