import { NextResponse } from 'next/server';
import { findClientBySlug } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { client } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    // Connect to database
    
    // Find client by slug
    const clientData = await findClientBySlug(client);
    if (!clientData) {
      return NextResponse.json(
        { success: false, message: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Check if user has access to this client
    if (session.user.role !== 'admin' && session.user.clientSlug !== client) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado a este cliente' },
        { status: 403 }
      );
    }

    // Check if Google Analytics is connected
    if (!clientData.googleAnalytics?.connected) {
      return NextResponse.json({
        success: false,
        message: 'Google Analytics não está conectado para este cliente.'
      }, { status: 400 });
    }

    // Fetch real Google Analytics data
    try {
      const analyticsData = await fetchGoogleAnalyticsData(clientData, period);
      return NextResponse.json({
        success: true,
        data: analyticsData,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching Google Analytics data:', error);
      return NextResponse.json({
        success: false,
        message: 'Erro ao buscar dados do Google Analytics.',
        error: error.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function fetchGoogleAnalyticsData(clientData, period) {
  // TODO: Implement real Google Analytics 4 Data API integration
  // This function should connect to Google Analytics 4 Data API using client credentials
  // stored in clientData.googleAnalytics.encryptedCredentials
  
  throw new Error('Google Analytics API integration not yet implemented. Please configure the real API connector.');
}