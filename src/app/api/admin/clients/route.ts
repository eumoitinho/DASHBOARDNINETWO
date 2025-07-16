import { NextRequest, NextResponse } from 'next/server';
import { prisma, getAllClients, createClient } from '@/lib/database';
import type { APIResponse } from '@/types/dashboard';

/**
 * GET /api/admin/clients
 * List all clients from database
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : null;
    
    // Get all clients using Prisma
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
        status: true,
        monthlyBudget: true,
        avatar: true,
        tags: true,
        googleAdsConnected: true,
        googleAdsLastSync: true,
        facebookAdsConnected: true,
        facebookAdsLastSync: true,
        googleAnalyticsConnected: true,
        googleAnalyticsLastSync: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit || undefined
    });

    return NextResponse.json<APIResponse<any[]>>({
      success: true,
      data: clients,
      message: `${clients.length} clientes encontrados`,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'FETCH_CLIENTS_ERROR',
      message: error.message || 'Erro ao buscar clientes',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/clients
 * Create a new client
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.slug || !body.monthlyBudget) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Nome, email, slug e orçamento mensal são obrigatórios',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Check if client with same slug already exists
    const existingClient = await prisma.client.findUnique({ 
      where: { slug: body.slug } 
    });
    if (existingClient) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'SLUG_ALREADY_EXISTS',
        message: 'Já existe um cliente com este slug',
        timestamp: new Date().toISOString(),
      }, { status: 409 });
    }

    // Create new client using Prisma
    const newClient = await prisma.client.create({
      data: {
        name: body.name,
        email: body.email,
        slug: body.slug,
        status: body.status || 'active',
        monthlyBudget: body.monthlyBudget,
        avatar: body.avatar,
        tags: body.tags || [],
        phone: body.phone,
        company: body.company,
        website: body.website,
        notes: body.notes,
        primaryColor: body.portalSettings?.primaryColor || '#3B82F6',
        secondaryColor: body.portalSettings?.secondaryColor || '#8B5CF6',
        allowedSections: body.portalSettings?.allowedSections || ['dashboard', 'campanhas', 'analytics', 'relatorios'],
        googleAdsConnected: body.googleAds?.connected || false,
        googleAdsCustomerId: body.googleAds?.customerId,
        googleAdsManagerId: body.googleAds?.managerId,
        facebookAdsConnected: body.facebookAds?.connected || false,
        facebookAdsAccountId: body.facebookAds?.adAccountId,
        facebookPixelId: body.facebookAds?.pixelId,
        googleAnalyticsConnected: body.googleAnalytics?.connected || false,
        googleAnalyticsPropertyId: body.googleAnalytics?.propertyId,
      }
    });

    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: newClient,
      message: 'Cliente criado com sucesso',
      timestamp: new Date().toISOString(),
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar cliente:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'CREATE_CLIENT_ERROR',
      message: error.message || 'Erro ao criar cliente',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 