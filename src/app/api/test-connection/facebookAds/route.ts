import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Meta Test Request Body:', body);
    
    // Usuario só informa o Ad Account ID
    const adAccountId = body.adAccountId || body.credentials?.adAccountId;
    
    // Credenciais vêm do .env (suas credenciais de API)
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!adAccountId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ad Account ID é obrigatório',
          details: 'Informe o Ad Account ID do Meta'
        },
        { status: 400 }
      );
    }

    // Verificar se as credenciais estão configuradas no .env
    if (!appId || !appSecret || !accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Credenciais do Meta não configuradas',
        details: 'Configure FACEBOOK_APP_ID, FACEBOOK_APP_SECRET e FACEBOOK_ACCESS_TOKEN no .env.local',
        missingCredentials: {
          appId: !appId,
          appSecret: !appSecret,
          accessToken: !accessToken
        }
      }, { status: 500 });
    }

    // Verificar formato do access token
    if (accessToken.length < 50) {
      return NextResponse.json({
        success: false,
        error: 'Facebook Access Token inválido',
        details: 'O token deve ser um Long-lived Access Token válido. Verifique se o token foi gerado corretamente.'
      }, { status: 500 });
    }

    // Tentar conexão real com Meta
    try {
      // Testar conexão com Meta Marketing API
      const testUrl = `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`;
      
      console.log('Testing Facebook API connection...');
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        console.error('Facebook API Error:', errorData);
        
        return NextResponse.json({
          success: false,
          error: `Facebook API Error (${response.status})`,
          details: errorData.error?.message || errorData.message || 'Falha na autenticação',
          statusCode: response.status,
          suggestion: response.status === 401 ? 'Verifique se o Access Token está válido e não expirou' : 'Verifique as credenciais da API'
        }, { status: 500 });
      }

      const userData = await response.json();
      console.log('Facebook user data:', userData);

      // Testar acesso às campanhas da conta específica
      const campaignsUrl = `https://graph.facebook.com/v18.0/act_${adAccountId}/campaigns?fields=id,name,status&limit=1&access_token=${accessToken}`;
      console.log(`Testing campaigns access for account: ${adAccountId}`);
      const campaignsResponse = await fetch(campaignsUrl);
      
      let campaignData = null;
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        campaignData = {
          success: true,
          campaignCount: campaignsData.data?.length || 0,
          campaigns: campaignsData.data || []
        };
        console.log('Campaigns data:', campaignData);
      } else {
        const errorData = await campaignsResponse.json().catch(() => ({ error: { message: 'Unknown error' } }));
        console.error('Campaigns error:', errorData);
        campaignData = {
          success: false,
          error: `Erro ${campaignsResponse.status}: ${errorData.error?.message || 'Não foi possível acessar campanhas'}`,
          suggestion: campaignsResponse.status === 403 ? 'Verifique se o Ad Account ID está correto e se você tem permissão para acessá-lo' : 'Verifique o Ad Account ID'
        };
      }

      return NextResponse.json({
        success: true,
        message: 'Conexão com Meta estabelecida com sucesso',
        data: {
          adAccountId,
          user: {
            id: userData.id,
            name: userData.name || 'N/A'
          },
          campaignTest: campaignData,
          apiVersion: 'v18.0'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Facebook connection error:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao conectar com Meta',
        details: error.message,
        suggestion: 'Verifique se o Access Token é válido e não expirou. Para gerar um novo token, acesse: https://developers.facebook.com/tools/explorer/'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro ao testar conexão Meta:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Falha na conexão com Meta',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Use POST para testar conexão Meta',
      requiredFields: ['appId', 'appSecret', 'accessToken'],
      optionalFields: ['adAccountId']
    },
    { status: 405 }
  );
}