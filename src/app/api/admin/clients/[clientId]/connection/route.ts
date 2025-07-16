import { NextRequest, NextResponse } from 'next/server';
import { prisma, findClientBySlug } from '@/lib/database';

export async function POST(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  try {
    const resolvedParams = await params;
    const { clientId } = resolvedParams;
    const { platform, connected, lastSync, connectionData } = await request.json();

    if (!platform) {
      return NextResponse.json(
        { success: false, message: 'Platform é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar cliente por slug
    const client = await findClientBySlug(clientId);
    
    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Preparar dados para atualização baseado na plataforma
    const updateData: any = {};
    
    if (platform === 'googleAnalytics') {
      updateData.googleAnalyticsConnected = connected;
      if (lastSync) updateData.googleAnalyticsLastSync = new Date(lastSync);
    } else if (platform === 'googleAds') {
      updateData.googleAdsConnected = connected;
      if (lastSync) updateData.googleAdsLastSync = new Date(lastSync);
    } else if (platform === 'facebookAds') {
      updateData.facebookAdsConnected = connected;
      if (lastSync) updateData.facebookAdsLastSync = new Date(lastSync);
    }
    
    // Atualizar cliente no banco
    const updatedClient = await prisma.client.update({
      where: { id: client.id },
      data: updateData
    });

    console.log(`✅ Conexão ${platform} salva para cliente ${clientId}:`, {
      connected,
      lastSync,
      connectionData
    });

    return NextResponse.json({
      success: true,
      message: `Status de conexão ${platform} atualizado com sucesso`,
      data: {
        clientId,
        platform,
        connected,
        lastSync,
        connectionData
      }
    });

  } catch (error) {
    console.error('Erro ao salvar conexão:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}