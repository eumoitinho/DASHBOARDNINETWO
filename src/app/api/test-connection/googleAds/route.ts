import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Google Ads Test Request Body:', body);
    
    // Usuario só informa o Customer ID
    const customerId = body.customerId || body.credentials?.customerId;
    
    // Credenciais vêm do .env (suas credenciais de API)
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

    if (!customerId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Customer ID é obrigatório',
          details: 'Informe o Customer ID do Google Ads'
        },
        { status: 400 }
      );
    }

    // Verificar se as credenciais estão configuradas no .env
    if (!developerToken || !clientId || !clientSecret || !refreshToken) {
      return NextResponse.json({
        success: false,
        error: 'Credenciais do Google Ads não configuradas',
        details: 'Configure GOOGLE_ADS_* no .env.local'
      }, { status: 500 });
    }

    // Tentar conexão real com Google Ads usando REST API
    try {
      // Obter access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to refresh access token');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Testar conexão fazendo uma query simples
      const queryResponse = await fetch(`https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:searchStream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            SELECT 
              campaign.id,
              campaign.name,
              campaign.status
            FROM campaign 
            LIMIT 1
          `
        }),
      });

      if (!queryResponse.ok) {
        const errorData = await queryResponse.json().catch(() => ({}));
        throw new Error(`Google Ads API error: ${queryResponse.status} - ${JSON.stringify(errorData)}`);
      }

      const queryData = await queryResponse.json();
      const campaigns = queryData.results || [];

      return NextResponse.json({
        success: true,
        message: 'Conexão com Google Ads estabelecida com sucesso',
        data: {
          customerId,
          campaignCount: campaigns.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: 'Erro ao conectar com Google Ads',
        details: error.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro ao testar conexão Google Ads:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Falha na conexão com Google Ads',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Use POST para testar conexão Google Ads',
      requiredFields: ['developerToken', 'clientId', 'clientSecret', 'refreshToken'],
      optionalFields: ['customerId']
    },
    { status: 405 }
  );
}