import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const credentials = {
    googleAds: {
      developerToken: !!process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      clientId: !!process.env.GOOGLE_ADS_CLIENT_ID,
      clientSecret: !!process.env.GOOGLE_ADS_CLIENT_SECRET,
      refreshToken: !!process.env.GOOGLE_ADS_REFRESH_TOKEN,
    },
    facebook: {
      appId: !!process.env.FACEBOOK_APP_ID,
      appSecret: !!process.env.FACEBOOK_APP_SECRET,
      accessToken: !!process.env.FACEBOOK_ACCESS_TOKEN,
    },
    googleAnalytics: {
      clientEmail: !!process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
      privateKey: !!process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
    }
  };

  const allConfigured = Object.values(credentials).every(platform => 
    Object.values(platform).every(Boolean)
  );

  return NextResponse.json({
    success: true,
    allConfigured,
    credentials,
    message: allConfigured 
      ? 'Todas as credenciais estão configuradas' 
      : 'Algumas credenciais estão faltando'
  });
}