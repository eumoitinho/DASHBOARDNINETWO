import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
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

    const { slug } = await params;
    
    // Find client by slug using Prisma
    const client = await prisma.client.findUnique({
      where: { slug },
      include: {
        users: true,
        customCharts: true,
      }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Check if user has access to this client
    if (session.user.role !== 'admin' && session.user.clientSlug !== slug) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado a este cliente' },
        { status: 403 }
      );
    }

    // Return client data (excluding sensitive information)
    const clientData = {
      id: client.id,
      slug: client.slug,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      avatar: client.avatar,
      monthlyBudget: client.monthlyBudget,
      status: client.status,
      tags: client.tags || [],
      portalSettings: {
        primaryColor: client.primaryColor,
        secondaryColor: client.secondaryColor,
        allowedSections: client.allowedSections,
        logoUrl: client.logoUrl,
        customDomain: client.customDomain,
      },
      googleAds: {
        connected: client.googleAdsConnected || false,
        customerId: client.googleAdsCustomerId,
        managerId: client.googleAdsManagerId,
        lastSync: client.googleAdsLastSync,
      },
      facebookAds: {
        connected: client.facebookAdsConnected || false,
        adAccountId: client.facebookAdsAccountId,
        pixelId: client.facebookPixelId,
        lastSync: client.facebookAdsLastSync,
      },
      googleAnalytics: {
        connected: client.googleAnalyticsConnected || false,
        propertyId: client.googleAnalyticsPropertyId,
        lastSync: client.googleAnalyticsLastSync,
      },
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: clientData,
    });

  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}