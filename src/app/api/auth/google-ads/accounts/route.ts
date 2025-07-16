import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

/**
 * GET /api/auth/google-ads/accounts?clientSlug=client-name
 * Lista as contas Google Ads disponíveis para o cliente autorizado
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

    if (!client || !client.googleAdsConnected || !client.googleAdsCredentials) {
      return NextResponse.json({
        error: 'CLIENT_NOT_AUTHORIZED',
        message: 'Cliente não está autorizado no Google Ads'
      }, { status: 401 });
    }

    // Recuperar tokens salvos
    const credentials = JSON.parse(client.googleAdsCredentials);
    
    if (!credentials.refresh_token) {
      return NextResponse.json({
        error: 'NO_REFRESH_TOKEN',
        message: 'Token de atualização não encontrado'
      }, { status: 401 });
    }

    // Obter access token do refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        refresh_token: credentials.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to refresh access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Obter contas acessíveis usando Google Ads REST API
    const accountsResponse = await fetch('https://googleads.googleapis.com/v16/customers:listAccessibleCustomers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
    });

    if (!accountsResponse.ok) {
      throw new Error('Failed to fetch accessible customers');
    }

    const accountsData = await accountsResponse.json();
    const customerAccounts = accountsData.resourceNames?.map((name: string) => 
      name.replace('customers/', '')
    ) || [];
    
    // Obter detalhes de cada conta
    const accountsDetails = [];
    for (const accountId of customerAccounts) {
      try {
        // Usar Google Ads REST API para obter detalhes da conta
        const query = `
          SELECT 
            customer.id,
            customer.descriptive_name,
            customer.currency_code,
            customer.time_zone,
            customer.test_account
          FROM customer
          WHERE customer.id = ${accountId}
        `;

        const queryResponse = await fetch(`https://googleads.googleapis.com/v16/customers/${accountId}/googleAds:searchStream`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (queryResponse.ok) {
          const queryData = await queryResponse.json();
          if (queryData.results && queryData.results.length > 0) {
            const account = queryData.results[0].customer;
            accountsDetails.push({
              id: account.id,
              name: account.descriptive_name,
              currency: account.currency_code,
              timeZone: account.time_zone,
              isTestAccount: account.test_account
            });
          }
        } else {
          // Fallback para conta básica
          accountsDetails.push({
            id: accountId,
            name: `Conta ${accountId}`,
            currency: 'BRL',
            timeZone: 'America/Sao_Paulo',
            isTestAccount: false
          });
        }
      } catch (accountError) {
        console.warn(`Erro ao obter detalhes da conta ${accountId}:`, accountError);
        // Adicionar conta básica mesmo se não conseguir obter detalhes
        accountsDetails.push({
          id: accountId,
          name: `Conta ${accountId}`,
          currency: 'BRL',
          timeZone: 'America/Sao_Paulo',
          isTestAccount: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: accountsDetails,
      message: `${accountsDetails.length} contas encontradas`
    });

  } catch (error: any) {
    console.error('Erro ao listar contas Google Ads:', error);
    
    // Se o token expirou, limpar a conexão
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      const clientSlug = new URL(request.url).searchParams.get('clientSlug');
      if (clientSlug) {
        await prisma.client.update({
          where: { slug: clientSlug },
          data: {
            googleAdsConnected: false,
            googleAdsCredentials: null
          }
        });
      }
    }
    
    return NextResponse.json({
      error: 'FETCH_ACCOUNTS_ERROR',
      message: error.message || 'Erro ao buscar contas Google Ads'
    }, { status: 500 });
  }
}