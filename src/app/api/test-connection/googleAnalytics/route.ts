import { NextRequest, NextResponse } from 'next/server';
import { GoogleAnalyticsClient } from '@/lib/google-analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('GA4 Test Request Body:', body);
    
    // Usuario só informa o Property ID
    const propertyId = body.propertyId || body.credentials?.propertyId;
    
    // Credenciais vêm do .env (suas credenciais de API)
    const serviceAccountKey = process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY;
    const clientEmail = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_ANALYTICS_PRIVATE_KEY;

    if (!propertyId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Property ID é obrigatório',
          details: 'Informe o Property ID do Google Analytics 4'
        },
        { status: 400 }
      );
    }

    // Verificar se as credenciais estão configuradas no .env
    if (!clientEmail || !privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Credenciais do Google Analytics não configuradas',
        details: 'Configure GOOGLE_ANALYTICS_CLIENT_EMAIL e GOOGLE_ANALYTICS_PRIVATE_KEY no .env.local'
      }, { status: 500 });
    }

    // Tentar conexão real com Google Analytics 4
    try {
      const gaClient = new GoogleAnalyticsClient({
        propertyId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      });

      const isConnected = await gaClient.testConnection();
      if (!isConnected) {
        throw new Error('Falha ao conectar com Google Analytics 4');
      }

      const metrics = await gaClient.getMetrics('7daysAgo', 'today');

      return NextResponse.json({
        success: true,
        message: 'Conexão com Google Analytics 4 estabelecida com sucesso',
        data: {
          propertyId,
          sessions: metrics.sessions,
          users: metrics.users,
          pageviews: metrics.pageviews
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      let errorMessage = error.message;
      let solution = '';

      if (error.message?.includes('Google Analytics Data API has not been used')) {
        solution = 'Habilite a Google Analytics Data API no Google Cloud Console';
      } else if (error.message?.includes('PERMISSION_DENIED')) {
        solution = 'Verifique as permissões do Service Account';
      } else if (error.message?.includes('INVALID_ARGUMENT')) {
        solution = 'Verifique se o Property ID está correto';
      }

      return NextResponse.json({
        success: false,
        error: 'Erro ao conectar com Google Analytics 4',
        details: errorMessage,
        solution: solution || 'Verifique as credenciais no .env.local'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro ao testar conexão Google Analytics:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Falha na conexão com Google Analytics 4',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Use POST para testar conexão Google Analytics 4',
      requiredFields: ['propertyId'],
      authOptions: [
        'serviceAccountKey (JSON completo)',
        'clientEmail + privateKey'
      ]
    },
    { status: 405 }
  );
}