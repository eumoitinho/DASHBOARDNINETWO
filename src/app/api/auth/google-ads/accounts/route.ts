import { NextRequest, NextResponse } from 'next/server';
import { GoogleAdsApi } from 'google-ads-api';
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

    // Configurar Google Ads API
    const googleAds = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });

    // Obter contas acessíveis usando um customer temporário
    // Para listAccessibleCustomers(), podemos usar qualquer customer_id válido
    const tempCustomer = googleAds.Customer({
      customer_id: '1234567890', // ID temporário para listAccessibleCustomers
      refresh_token: credentials.refresh_token,
    });

    const customerAccounts = await tempCustomer.listAccessibleCustomers();
    
    // Obter detalhes de cada conta
    const accountsDetails = [];
    for (const accountId of customerAccounts) {
      try {
        const customerClient = googleAds.Customer({
          customer_id: accountId,
          refresh_token: credentials.refresh_token,
        });

        const accountInfo = await customerClient.query(`
          SELECT 
            customer.id,
            customer.descriptive_name,
            customer.currency_code,
            customer.time_zone,
            customer.test_account
          FROM customer
          WHERE customer.id = ${accountId}
        `);

        if (accountInfo.length > 0) {
          const account = accountInfo[0].customer;
          accountsDetails.push({
            id: account.id,
            name: account.descriptive_name,
            currency: account.currency_code,
            timeZone: account.time_zone,
            isTestAccount: account.test_account
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