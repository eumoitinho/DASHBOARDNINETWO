import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  saveGoogleAdsCredentials,
  saveFacebookAdsCredentials,
  saveGoogleAnalyticsCredentials,
  testAllConnections,
  getClientAPIStatus,
  removeClientCredentials,
} from '@/lib/client-credentials';
import type { APIResponse } from '@/types/dashboard';

/**
 * GET /api/admin/clients/[id]/credentials
 * Get client API credentials status (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Acesso negado. Apenas administradores podem acessar credenciais.',
        timestamp: new Date().toISOString(),
      }, { status: 403 });
    }

    const { clientId } = await params;
    const apiStatus = await getClientAPIStatus(clientId);

    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: apiStatus,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao obter status das credenciais:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'API_STATUS_ERROR',
      message: error.message || 'Erro ao obter status das APIs',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/clients/[id]/credentials
 * Save client API credentials (admin only)
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
        message: 'Acesso negado. Apenas administradores podem gerenciar credenciais.',
        timestamp: new Date().toISOString(),
      }, { status: 403 });
    }

    const { clientId } = await params;
    const body = await request.json();
    const { platform, credentials } = body;

    if (!platform || !credentials) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'INVALID_DATA',
        message: 'Plataforma e credenciais são obrigatórias',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    let success = false;

    switch (platform) {
      case 'googleAds':
        success = await saveGoogleAdsCredentials(clientId, credentials);
        break;
      case 'facebookAds':
        success = await saveFacebookAdsCredentials(clientId, credentials);
        break;
      case 'googleAnalytics':
        success = await saveGoogleAnalyticsCredentials(clientId, credentials);
        break;
      default:
        return NextResponse.json<APIResponse<null>>({
          success: false,
          error: 'INVALID_PLATFORM',
          message: 'Plataforma inválida. Use: googleAds, facebookAds ou googleAnalytics',
          timestamp: new Date().toISOString(),
        }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'SAVE_FAILED',
        message: 'Falha ao salvar credenciais',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    return NextResponse.json<APIResponse<{ saved: boolean }>>({
      success: true,
      data: { saved: true },
      message: 'Credenciais salvas com sucesso',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao salvar credenciais:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'SAVE_CREDENTIALS_ERROR',
      message: error.message || 'Erro ao salvar credenciais',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/clients/[id]/credentials
 * Remove client API credentials (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Acesso negado. Apenas administradores podem remover credenciais.',
        timestamp: new Date().toISOString(),
      }, { status: 403 });
    }

    const { clientId } = await params;
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') as 'googleAds' | 'facebookAds' | 'googleAnalytics' | undefined;

    const success = await removeClientCredentials(clientId, platform);

    if (!success) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'REMOVE_FAILED',
        message: 'Falha ao remover credenciais',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    return NextResponse.json<APIResponse<{ removed: boolean }>>({
      success: true,
      data: { removed: true },
      message: platform ? `Credenciais ${platform} removidas` : 'Todas as credenciais removidas',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao remover credenciais:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'REMOVE_CREDENTIALS_ERROR',
      message: error.message || 'Erro ao remover credenciais',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}