import { NextResponse } from 'next/server';
import { findClientBySlug } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { client, chartId } = await params;
    
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

    // Delete chart from database
    const Client = require('@/lib/database').default?.models?.Client || require('mongoose').model('Client');
    
    const result = await Client.updateOne(
      { slug: client },
      { 
        $pull: { customCharts: { id: chartId } },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Gráfico não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Gráfico excluído com sucesso'
    });

  } catch (error) {
    console.error('Error deleting custom chart:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}