import { NextResponse } from 'next/server';
import { findClientBySlug } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { client } = await params;
    const { metrics, period, groupBy, filters } = await request.json();
    
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

    // Generate preview data - same as chart data but smaller sample
    const previewData = await generatePreviewData(clientData, metrics, period, groupBy, filters);

    return NextResponse.json({
      success: true,
      data: previewData
    });

  } catch (error) {
    console.error('Error generating preview data:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function generatePreviewData(clientData, metrics, period, groupBy, filters) {
  // TODO: Fetch real preview data from database
  // This should return a smaller subset of the same data as generateChartData
  
  throw new Error(`Chart preview data generation not yet implemented for real database data. 
    This function should return a limited sample of real data for the metrics: ${metrics.join(', ')}`);
}