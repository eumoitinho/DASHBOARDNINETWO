import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/database';

/**
 * GET /api/auth/google-analytics/properties?clientSlug=client-name
 * Lista as propriedades Google Analytics disponíveis para o cliente autorizado
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

    // Buscar cliente e suas credenciais
    const client = await prisma.client.findUnique({
      where: { slug: clientSlug }
    });

    if (!client || !client.googleAnalyticsConnected || !client.googleAnalyticsCredentials) {
      return NextResponse.json({
        error: 'CLIENT_NOT_AUTHORIZED',
        message: 'Cliente não está autorizado no Google Analytics'
      }, { status: 401 });
    }

    // Recuperar tokens salvos
    const credentials = JSON.parse(client.googleAnalyticsCredentials);
    
    // Configurar OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_ADS_CLIENT_ID,
      process.env.GOOGLE_ADS_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/google-analytics/callback`
    );

    oauth2Client.setCredentials(credentials);

    // Obter propriedades
    const analytics = google.analyticsadmin({ version: 'v1beta', auth: oauth2Client });
    const propertiesResponse = await analytics.properties.list();
    
    const properties = (propertiesResponse.data.properties || []).map(property => ({
      name: property.name,
      displayName: property.displayName,
      propertyId: property.name?.split('/')[1], // Extrair ID da propriedade
      industryCategory: property.industryCategory,
      timeZone: property.timeZone,
      currencyCode: property.currencyCode,
      createTime: property.createTime,
      updateTime: property.updateTime
    }));

    return NextResponse.json({
      success: true,
      data: properties,
      message: `${properties.length} propriedades encontradas`
    });

  } catch (error: any) {
    console.error('Erro ao listar propriedades GA4:', error);
    
    // Se o token expirou, limpar a conexão
    if (error.code === 401) {
      const clientSlug = new URL(request.url).searchParams.get('clientSlug');
      if (clientSlug) {
        await prisma.client.update({
          where: { slug: clientSlug },
          data: {
            googleAnalyticsConnected: false,
            googleAnalyticsCredentials: null
          }
        });
      }
    }
    
    return NextResponse.json({
      error: 'FETCH_PROPERTIES_ERROR',
      message: error.message || 'Erro ao buscar propriedades'
    }, { status: 500 });
  }
}