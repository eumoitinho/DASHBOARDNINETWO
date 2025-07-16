import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { testAllConnections } from '@/lib/client-credentials';
import type { APIResponse } from '@/types/dashboard';

/**
 * POST /api/admin/clients/[id]/test-connections
 * Test all API connections for a client (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Acesso negado. Apenas administradores podem testar conexões.',
        timestamp: new Date().toISOString(),
      }, { status: 403 });
    }

    const { clientId } = await params;
    
    console.log(`Testando conexões para cliente: ${clientId}`);
    
    // Test all connections
    const connectionResults = await testAllConnections(clientId);
    
    const allConnected = Object.values(connectionResults).every(Boolean);
    const connectedCount = Object.values(connectionResults).filter(Boolean).length;
    const totalCount = Object.keys(connectionResults).length;

    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: {
        results: connectionResults,
        summary: {
          allConnected,
          connectedCount,
          totalCount,
          successRate: (connectedCount / totalCount) * 100,
        }
      },
      message: allConnected 
        ? 'Todas as conexões foram testadas com sucesso' 
        : `${connectedCount} de ${totalCount} conexões estão funcionando`,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao testar conexões:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'CONNECTION_TEST_ERROR',
      message: error.message || 'Erro ao testar conexões das APIs',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}