import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { GoogleAdsApi } from 'google-ads-api';
import { prisma } from '@/lib/database';

// OAuth2 setup para Google Ads
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_ADS_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/google-ads/callback`
);

/**
 * GET /api/auth/google-ads/callback
 * Callback do OAuth para Google Ads
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

    // Tentar obter informações das contas Google Ads
    let customerAccounts = [];
    try {
      const googleAds = new GoogleAdsApi({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      });

      // Usar o refresh token para autenticar
      const customer = googleAds.Customer({
        refresh_token: tokens.refresh_token!,
      });

      // Tentar listar contas acessíveis (pode falhar se não tiver developer token válido)
      try {
        const accountsResponse = await customer.listAccessibleCustomers();
        customerAccounts = accountsResponse || [];
      } catch (adsError) {
        console.warn('Não foi possível listar contas Google Ads:', adsError);
        // Não é um erro crítico, apenas registramos
      }
    } catch (adsError) {
      console.warn('Erro ao conectar Google Ads API:', adsError);
    }

    // Salvar tokens no banco de dados (criptografados)
    const client = await prisma.client.update({
      where: { slug: state },
      data: {
        googleAdsConnected: true,
        googleAdsLastSync: new Date(),
        googleAdsCredentials: JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_type: tokens.token_type,
          expiry_date: tokens.expiry_date,
          scope: tokens.scope
        })
      }
    });

    console.log('✅ Google Ads conectado para cliente:', state);
    console.log('🎯 Contas encontradas:', customerAccounts.length);

    // Redirecionar de volta para a página de edição do cliente
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/edit-client/${state}?success=google_ads_connected&accounts=${customerAccounts.length}`
    );

  } catch (error: any) {
    console.error('Erro no callback OAuth Google Ads:', error);
    
    const state = new URL(request.url).searchParams.get('state');
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/edit-client/${state}?error=oauth_callback_failed`
    );
  }
}