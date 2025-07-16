import { NextResponse } from 'next/server';
import { findClientBySlug, getClientCampaigns } from '@/lib/database';
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
    const platform = searchParams.get('platform') || 'all';
    const status = searchParams.get('status') || 'all';
    
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

    // Get campaigns for client
    let campaigns = await getClientCampaigns(clientData._id.toString(), platform !== 'all' ? platform : undefined);

    // Filter by status if specified
    if (status !== 'all') {
      campaigns = campaigns.filter(campaign => campaign.status === status);
    }

    // Filter by period
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    campaigns = campaigns.filter(campaign => {
      const campaignDate = campaign.updatedAt || campaign.createdAt;
      return new Date(campaignDate) >= startDate;
    });

    // Transform campaigns for frontend
    const transformedCampaigns = campaigns.map(campaign => ({
      campaignId: campaign.campaignId || campaign._id.toString(),
      campaignName: campaign.campaignName,
      platform: campaign.platform,
      status: campaign.status,
      budget: campaign.budget || 0,
      dailyBudget: campaign.dailyBudget || 0,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      metrics: campaign.metrics?.[campaign.metrics.length - 1] || {
        impressions: 0,
        clicks: 0,
        cost: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        conversionRate: 0,
        roas: 0,
      },
      lastUpdated: campaign.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: transformedCampaigns,
      totalCount: transformedCampaigns.length,
      filters: {
        period,
        platform,
        status
      }
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}