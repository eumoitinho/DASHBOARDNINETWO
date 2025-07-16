import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/database';

// OAuth2 setup for Google Analytics
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_ADS_CLIENT_ID, // Reutilizando as credenciais OAuth do Google Ads
  process.env.GOOGLE_ADS_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/google-analytics/callback`
);

/**
 * GET /api/auth/google-analytics?clientSlug=client-name
 * Inicia o fluxo OAuth para Google Analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientSlug = searchParams.get('clientSlug');

    if (!clientSlug) {
      return NextResponse.json({
        error: 'CLIENT_SLUG_REQUIRED',
        message: 'Client slug é obrigatório'
      }, { status: 400 });
    }

    // Verificar se o cliente existe
    const client = await prisma.client.findUnique({
      where: { slug: clientSlug }
    });

    if (!client) {
      return NextResponse.json({
        error: 'CLIENT_NOT_FOUND',
        message: 'Cliente não encontrado'
      }, { status: 404 });
    }

    // Gerar URL de autorização
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/analytics.manage.users.readonly'
      ],
      state: clientSlug, // Passar o client slug no state para recuperar no callback
      prompt: 'consent' // Força a tela de consentimento para garantir refresh token
    });

    return NextResponse.json({
      success: true,
      authUrl,
      message: 'Redirecione o usuário para a URL de autorização'
    });

  } catch (error: any) {
    console.error('Erro ao iniciar OAuth Google Analytics:', error);
    
    return NextResponse.json({
      error: 'OAUTH_INIT_ERROR',
      message: error.message || 'Erro ao iniciar autorização'
    }, { status: 500 });
  }
}