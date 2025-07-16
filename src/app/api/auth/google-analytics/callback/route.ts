import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/database';

// OAuth2 setup para Google Analytics
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_ADS_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/google-analytics/callback`
);

/**
 * GET /api/auth/google-analytics/callback
 * Callback do OAuth para Google Analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Client slug
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/edit-client/${state}?error=oauth_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/edit-client/${state}?error=invalid_callback`
      );
    }

    // Trocar código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Obter informações das propriedades GA4 do usuário
    const analytics = google.analyticsadmin({ version: 'v1beta', auth: oauth2Client });
    
    let properties = [];
    try {
      const propertiesResponse = await analytics.properties.list();
      properties = propertiesResponse.data.properties || [];
    } catch (propError) {
      console.warn('Não foi possível listar propriedades:', propError);
    }

    // Salvar tokens no banco de dados (criptografados)
    const client = await prisma.client.update({
      where: { slug: state },
      data: {
        googleAnalyticsConnected: true,
        googleAnalyticsLastSync: new Date(),
        googleAnalyticsCredentials: JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_type: tokens.token_type,
          expiry_date: tokens.expiry_date,
          scope: tokens.scope
        })
      }
    });

    console.log('✅ Google Analytics conectado para cliente:', state);
    console.log('📊 Propriedades encontradas:', properties.length);

    // Redirecionar de volta para a página de edição do cliente
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/edit-client/${state}?success=google_analytics_connected&properties=${properties.length}`
    );

  } catch (error: any) {
    console.error('Erro no callback OAuth Google Analytics:', error);
    
    const state = new URL(request.url).searchParams.get('state');
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/edit-client/${state}?error=oauth_callback_failed`
    );
  }
}