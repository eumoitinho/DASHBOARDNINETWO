import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    title: 'Facebook Long-lived Access Token Generator',
    instructions: [
      '1. Acesse https://developers.facebook.com/tools/explorer/',
      '2. Selecione sua aplicação no dropdown',
      '3. Clique em "Generate Access Token"',
      '4. Selecione as permissões necessárias: ads_management, ads_read, read_insights',
      '5. Copie o Short-lived Access Token gerado',
      '6. Use este endpoint para converter em Long-lived Token'
    ],
    usage: 'POST /api/admin/facebook-token-helper com { "shortToken": "your_short_token" }',
    requiredEnvVars: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET']
  });
}

export async function POST(request: NextRequest) {
  try {
    const { shortToken } = await request.json();
    
    if (!shortToken) {
      return NextResponse.json({
        success: false,
        error: 'Short-lived token é obrigatório',
        details: 'Forneça o token obtido do Facebook Graph API Explorer'
      }, { status: 400 });
    }

    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      return NextResponse.json({
        success: false,
        error: 'Credenciais não configuradas',
        details: 'Configure FACEBOOK_APP_ID e FACEBOOK_APP_SECRET no .env'
      }, { status: 500 });
    }

    // Converter short-lived token em long-lived token
    const exchangeUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`;
    
    const response = await fetch(exchangeUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        error: 'Falha ao trocar token',
        details: errorData.error?.message || 'Erro na troca do token',
        suggestion: 'Verifique se o short-lived token está válido e se as credenciais da app estão corretas'
      }, { status: 400 });
    }

    const tokenData = await response.json();
    
    // Obter informações do usuário com o novo token
    const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${tokenData.access_token}`);
    const userData = await userResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Long-lived token gerado com sucesso!',
      data: {
        longLivedToken: tokenData.access_token,
        expiresIn: tokenData.expires_in || 'Never expires',
        tokenType: tokenData.token_type || 'bearer',
        user: {
          id: userData.id,
          name: userData.name
        }
      },
      instructions: [
        '1. Copie o longLivedToken acima',
        '2. Atualize FACEBOOK_ACCESS_TOKEN no .env com este valor',
        '3. Reinicie o servidor de desenvolvimento',
        '4. Teste a conexão novamente'
      ]
    });

  } catch (error) {
    console.error('Error generating Facebook token:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}