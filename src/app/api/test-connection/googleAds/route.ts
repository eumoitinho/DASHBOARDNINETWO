import { NextRequest, NextResponse } from 'next/server';
import { GoogleAdsApi } from 'google-ads-api';

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

    // Tentar conexão real com Google Ads
    try {
      const client = new GoogleAdsApi({
        client_id: clientId,
        client_secret: clientSecret,
        developer_token: developerToken,
      });

      const customer = client.Customer({
        customer_id: customerId,
        refresh_token: refreshToken,
      });

      const campaigns = await customer.query(`
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status
        FROM campaign 
        LIMIT 1
      `);

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