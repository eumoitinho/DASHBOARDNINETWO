import { NextRequest, NextResponse } from 'next/server';
import { prisma, getAllClients } from '@/lib/database';
import type { APIResponse } from '@/types/dashboard';

/**
 * GET /api/admin/dashboard/stats
 * Get agency dashboard statistics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    
    // Get all clients
    const clients = await getAllClients();
    
    // Calculate statistics
    const totalClients = clients.length;
    const activeClients = clients.filter(client => client.status === 'active').length;
    const totalRevenue = clients.reduce((sum, client) => sum + (client.monthlyBudget || 0), 0);
    
    // Calculate average conversion rate (mock for now)
    const avgConversionRate = 3.2; // This would come from actual analytics data
    
    // Calculate total spend (mock for now)
    const totalSpend = totalRevenue * 0.3; // Assuming 30% of revenue is spent on ads
    
    // Calculate total conversions (mock for now)
    const totalConversions = Math.round(totalSpend * (avgConversionRate / 100));
    
    const stats = {
      totalClients,
      activeClients,
      totalRevenue,
      avgConversionRate,
      totalSpend,
      totalConversions
    };

    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: stats,
      message: 'Estatísticas carregadas com sucesso',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'FETCH_STATS_ERROR',
      message: error.message || 'Erro ao buscar estatísticas',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 