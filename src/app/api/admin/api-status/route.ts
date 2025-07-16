import { NextResponse } from 'next/server';

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apis: {
      googleAds: {
        configured: false,
        credentials: {},
        status: 'NOT_CONFIGURED'
      },
      facebookAds: {
        configured: false,
        credentials: {},
        status: 'NOT_CONFIGURED'
      },
      googleAnalytics: {
        configured: false,
        credentials: {},
        status: 'NOT_CONFIGURED'
      }
    },
    database: {
      configured: !!process.env.DATABASE_URL,
      url: process.env.DATABASE_URL ? 'CONFIGURED' : 'NOT_CONFIGURED'
    },
    security: {
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      encryptionKey: !!process.env.ENCRYPTION_KEY,
      apiKey: !!process.env.API_KEY
    }
  };

  // Check Google Ads API
  const googleAdsCreds = {
    developerToken: !!process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    clientId: !!process.env.GOOGLE_ADS_CLIENT_ID,
    clientSecret: !!process.env.GOOGLE_ADS_CLIENT_SECRET,
    refreshToken: !!process.env.GOOGLE_ADS_REFRESH_TOKEN
  };
  
  status.apis.googleAds.credentials = googleAdsCreds;
  status.apis.googleAds.configured = Object.values(googleAdsCreds).every(Boolean);
  status.apis.googleAds.status = status.apis.googleAds.configured ? 'CONFIGURED' : 'MISSING_CREDENTIALS';

  // Check Facebook Ads API
  const facebookCreds = {
    appId: !!process.env.FACEBOOK_APP_ID,
    appSecret: !!process.env.FACEBOOK_APP_SECRET,
    accessToken: !!process.env.FACEBOOK_ACCESS_TOKEN,
    accessTokenValid: process.env.FACEBOOK_ACCESS_TOKEN ? process.env.FACEBOOK_ACCESS_TOKEN.length > 50 : false
  };
  
  status.apis.facebookAds.credentials = facebookCreds;
  status.apis.facebookAds.configured = facebookCreds.appId && facebookCreds.appSecret && facebookCreds.accessTokenValid;
  status.apis.facebookAds.status = status.apis.facebookAds.configured ? 'CONFIGURED' : 
    !facebookCreds.accessTokenValid ? 'INVALID_ACCESS_TOKEN' : 'MISSING_CREDENTIALS';

  // Check Google Analytics API
  const gaCreds = {
    clientEmail: !!process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
    privateKey: !!process.env.GOOGLE_ANALYTICS_PRIVATE_KEY
  };
  
  status.apis.googleAnalytics.credentials = gaCreds;
  status.apis.googleAnalytics.configured = Object.values(gaCreds).every(Boolean);
  status.apis.googleAnalytics.status = status.apis.googleAnalytics.configured ? 'CONFIGURED' : 'MISSING_CREDENTIALS';

  return NextResponse.json(status);
}

export async function POST() {
  return NextResponse.json({
    message: 'Use GET para verificar status das APIs',
    endpoints: {
      status: 'GET /api/admin/api-status',
      testGoogle: 'POST /api/test-connection/googleAds',
      testFacebook: 'POST /api/test-connection/facebookAds',
      testAnalytics: 'POST /api/test-connection/googleAnalytics',
      facebookTokenHelper: 'GET|POST /api/admin/facebook-token-helper'
    }
  });
}