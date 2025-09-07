# Email Service Setup Guide (Mailgun)

This guide will help you set up Mailgun for sending welcome emails and other notifications in CinemaPlot.

## Prerequisites

1. A Mailgun account (sign up at [mailgun.com](https://www.mailgun.com))
2. A domain name for sending emails
3. Access to your domain's DNS settings

## Step 1: Create a Mailgun Account

1. Go to [mailgun.com](https://www.mailgun.com) and sign up for an account
2. Verify your email address
3. Choose a plan (they offer a free tier with 5,000 emails/month for the first 3 months)

## Step 2: Add and Verify Your Domain

### Option A: Use Mailgun's Sandbox Domain (For Testing)

- Mailgun provides a sandbox domain for testing
- Limited to 300 emails total and only to authorized recipients
- Good for development and testing

### Option B: Add Your Own Domain (For Production)

1. In your Mailgun dashboard, go to "Sending" > "Domains"
2. Click "Add New Domain"
3. Enter your domain (e.g., `mg.yourdomain.com` or `mail.yourdomain.com`)
4. Select your region (US or EU)
5. Click "Add Domain"

## Step 3: Configure DNS Records

After adding your domain, Mailgun will provide DNS records that you need to add:

### Required DNS Records:

1. **TXT Record** (for domain verification)

   ```
   Name: mg.yourdomain.com
   Value: v=spf1 include:mailgun.org ~all
   ```

2. **TXT Record** (for DKIM)

   ```
   Name: k1._domainkey.mg.yourdomain.com
   Value: [Mailgun will provide this value]
   ```

3. **CNAME Record** (for tracking)

   ```
   Name: email.mg.yourdomain.com
   Value: mailgun.org
   ```

4. **MX Records** (for receiving)

   ```
   Name: mg.yourdomain.com
   Priority: 10
   Value: mxa.mailgun.org

   Name: mg.yourdomain.com
   Priority: 10
   Value: mxb.mailgun.org
   ```

### DNS Configuration Examples:

#### Cloudflare:

1. Log into Cloudflare
2. Select your domain
3. Go to "DNS" section
4. Add each record as specified above

#### Namecheap:

1. Log into Namecheap
2. Go to "Domain List" > "Manage"
3. Select "Advanced DNS"
4. Add the records

#### GoDaddy:

1. Log into GoDaddy
2. Go to "My Products" > "DNS"
3. Add the records in the DNS management section

## Step 4: Wait for DNS Propagation

- DNS changes can take up to 48 hours to fully propagate
- Most changes are effective within 1-2 hours
- Check verification status in your Mailgun dashboard

## Step 5: Get Your API Credentials

1. In your Mailgun dashboard, go to "Settings" > "API Keys"
2. Copy your "Private API key"
3. Note your domain name

## Step 6: Configure Environment Variables

Add these variables to your `.env` file:

```bash
# Mailgun Configuration
MAILGUN_API_KEY=your_private_api_key_here
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL=noreply@mg.yourdomain.com
```

### Example Configuration:

```bash
# For testing with sandbox domain
MAILGUN_API_KEY=key-1234567890abcdef1234567890abcdef
MAILGUN_DOMAIN=sandbox1234567890abcdef.mailgun.org
MAILGUN_FROM_EMAIL=noreply@sandbox1234567890abcdef.mailgun.org

# For production with custom domain
MAILGUN_API_KEY=key-1234567890abcdef1234567890abcdef
MAILGUN_DOMAIN=mg.cinemaplot.com
MAILGUN_FROM_EMAIL=noreply@mg.cinemaplot.com
```

## Step 7: Authorized Recipients (For Sandbox/Testing)

If using the sandbox domain for testing:

1. Go to "Sending" > "Overview"
2. Click on your sandbox domain
3. Go to "Authorized Recipients"
4. Add email addresses that should receive test emails

## Step 8: Test Your Configuration

1. Start your development server: `npm run dev`
2. Sign up for a new account or trigger a welcome email
3. Check the server logs for success/error messages
4. Check your email inbox for the welcome email

## Troubleshooting

### Common Issues:

1. **Domain not verified**

   - Check DNS records are correctly added
   - Wait for DNS propagation (up to 48 hours)
   - Use DNS lookup tools to verify records

2. **API key invalid**

   - Make sure you're using the Private API key, not Public
   - Check for extra spaces or characters in the key

3. **Emails not sending**

   - Check server logs for error messages
   - Verify environment variables are loaded correctly
   - Make sure domain is verified in Mailgun

4. **Emails going to spam**
   - Configure DKIM and SPF records properly
   - Add a DMARC record for better deliverability
   - Warm up your domain by sending emails gradually

### DNS Record Verification:

Check your DNS records using online tools:

- [DNSChecker.org](https://dnschecker.org)
- [MXToolbox.com](https://mxtoolbox.com)
- Command line: `dig TXT mg.yourdomain.com`

### Email Deliverability Tips:

1. **Use a subdomain** (e.g., `mg.yourdomain.com`) instead of your main domain
2. **Configure all DNS records** (SPF, DKIM, DMARC)
3. **Start with low volume** and gradually increase
4. **Monitor bounce rates** and remove invalid emails
5. **Use proper email formatting** (both HTML and plain text)

## Monitoring and Analytics

Mailgun provides detailed analytics:

1. **Dashboard Overview**: Total sent, delivered, bounced, complained
2. **Logs**: Real-time email sending logs
3. **Suppressions**: Manage bounced, unsubscribed, and complained emails
4. **Webhooks**: Real-time notifications for email events

## Production Considerations

1. **Domain Reputation**: Use a dedicated subdomain for emails
2. **Volume Limits**: Monitor your sending limits and upgrade plans as needed
3. **Compliance**: Ensure GDPR/CAN-SPAM compliance
4. **Security**: Keep API keys secure and rotate them regularly
5. **Backup**: Consider having a backup email service provider

## Cost Optimization

1. **Free Tier**: 5,000 emails/month for first 3 months, then 1,000/month
2. **Pay-as-you-go**: $0.80 per 1,000 emails
3. **Monthly Plans**: Starting at $35/month for 50,000 emails
4. **Dedicated IPs**: Available for higher-volume senders

## Email Templates

The system includes pre-built email templates for:

- ✅ Welcome emails for new users
- ✅ Collaboration invitations
- ✅ Password reset emails (ready to implement)

All templates are responsive and include both HTML and plain text versions.

## Support

If you encounter issues:

1. Check Mailgun's documentation: [documentation.mailgun.com](https://documentation.mailgun.com)
2. Review server logs for specific error messages
3. Test DNS records using online tools
4. Contact Mailgun support if domain verification issues persist

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive configuration
- Regularly rotate API keys
- Monitor email sending patterns for unusual activity
- Set up webhook signatures for secure webhook handling
