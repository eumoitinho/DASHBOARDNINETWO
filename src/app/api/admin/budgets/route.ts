import { NextRequest, NextResponse } from 'next/server';
import { prisma, getAllClients } from '@/lib/database';
import type { APIResponse } from '@/types/dashboard';

/**
 * GET /api/admin/budgets
 * Get budgets with optional period filter
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'current';
    
    
    // Get all clients to create budget data
    const clients = await getAllClients();
    
    // Create budget data based on clients
    const budgets = clients.map(client => {
      const currentPeriod = period === 'current' ? '2024-01' : 
                           period === 'previous' ? '2023-12' : '2024-02';
      
      const budget = client.monthlyBudget || 0;
      const spent = Math.round(budget * 0.7); // Simulate 70% spent
      const remaining = budget - spent;
      
      return {
        _id: `budget-${client.id}`,
        clientId: client.id,
        clientSlug: client.slug,
        clientName: client.name,
        period: currentPeriod,
        budget: budget,
        spent: spent,
        remaining: remaining,
        status: client.status === 'active' ? 'active' : 'pending',
        channels: client.googleAdsConnected ? ['Google Ads'] : [],
        notes: `Orçamento para ${client.name}`,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      };
    });

    return NextResponse.json<APIResponse<any[]>>({
      success: true,
      data: budgets,
      message: 'Orçamentos carregados com sucesso',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao buscar orçamentos:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'FETCH_BUDGETS_ERROR',
      message: error.message || 'Erro ao buscar orçamentos',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/budgets
 * Create a new budget
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    
    // Validate required fields
    if (!body.clientId || !body.period || !body.budget) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Campos obrigatórios não fornecidos',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: body.clientId }
    });
    if (!client) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'CLIENT_NOT_FOUND',
        message: 'Cliente não encontrado',
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    // Create budget object
    const budget = {
      _id: `budget-${body.clientId}-${body.period}`,
      clientId: body.clientId,
      clientSlug: client.slug,
      clientName: client.name,
      period: body.period,
      budget: parseFloat(body.budget),
      spent: 0,
      remaining: parseFloat(body.budget),
      status: 'active',
      channels: body.channels || [],
      notes: body.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: budget,
      message: 'Orçamento criado com sucesso',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao criar orçamento:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'CREATE_BUDGET_ERROR',
      message: error.message || 'Erro ao criar orçamento',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 