import { NextResponse } from 'next/server';
import { findClientBySlug, updateClient } from '@/lib/database';
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

    // Get custom charts from database
    // For now, return empty array - charts will be stored locally
    const customCharts = clientData.customCharts || [];

    return NextResponse.json({
      success: true,
      data: customCharts
    });

  } catch (error) {
    console.error('Error fetching custom charts:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

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
    const chartConfig = await request.json();
    
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

    // Add timestamp and ID
    const newChart = {
      ...chartConfig,
      id: chartConfig.id || `chart_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save chart to database using Prisma
    const currentCharts = clientData.customCharts || [];
    let updatedCharts;
    
    if (chartConfig.id && currentCharts.find(c => c.id === chartConfig.id)) {
      // Update existing chart
      updatedCharts = currentCharts.map(chart => 
        chart.id === chartConfig.id ? newChart : chart
      );
    } else {
      // Add new chart
      updatedCharts = [...currentCharts, newChart];
    }
    
    await updateClient(clientData.id, {
      customCharts: updatedCharts
    });
    
    return NextResponse.json({
      success: true,
      data: newChart,
      message: 'Gráfico salvo com sucesso'
    });

  } catch (error) {
    console.error('Error saving custom chart:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}