import { NextResponse } from 'next/server';
import { findClientBySlug } from '@/lib/database';
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

    const { client, reportId } = await params;
    
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

    // Get specific report from database
    // For now, return mock report data
    const reportData = getMockReportData(reportId);

    if (!reportData) {
      return NextResponse.json(
        { success: false, message: 'Relatório não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function getMockReportData(reportId) {
  // Mock reports database
  const reports = {
    'report-monthly-001': {
      id: 'report-monthly-001',
      name: 'Relatório Mensal - Março 2024',
      type: 'monthly',
      period: { start: '2024-03-01', end: '2024-03-31' },
      status: 'ready',
      createdAt: '2024-04-01T00:00:00Z',
      summary: {
        totalInvestment: 8950.75,
        totalLeads: 42,
        totalConversions: 18,
        averageCPC: 12.45,
        averageCTR: 1.82,
        roas: 2.1
      },
      sections: [
        {
          title: 'Resumo Executivo',
          type: 'summary',
          data: {
            totalInvestment: 8950.75,
            totalLeads: 42,
            costPerLead: 213.11,
            conversionRate: 42.86,
            roas: 2.1
          }
        },
        {
          title: 'Performance por Plataforma',
          type: 'platforms',
          data: [
            {
              platform: 'Google Ads',
              investment: 5370.45,
              leads: 23,
              cpc: 13.70,
              ctr: 2.0
            },
            {
              platform: 'Facebook Ads',
              investment: 3580.30,
              leads: 19,
              cpc: 11.20,
              ctr: 1.6
            }
          ]
        },
        {
          title: 'Campanhas Top Performance',
          type: 'top_campaigns',
          data: [
            {
              name: 'Campanha de Busca Principal',
              investment: 3133.26,
              leads: 17,
              roas: 2.5
            },
            {
              name: 'Facebook Feed Segmentado',
              investment: 2237.19,
              leads: 13,
              roas: 1.9
            }
          ]
        }
      ]
    },
    'report-weekly-001': {
      id: 'report-weekly-001',
      name: 'Relatório Semanal - Semana 14',
      type: 'weekly',
      period: { start: '2024-04-01', end: '2024-04-07' },
      status: 'ready',
      createdAt: '2024-04-08T00:00:00Z',
      summary: {
        totalInvestment: 2240.30,
        totalLeads: 12,
        totalConversions: 5,
        averageCPC: 14.80,
        averageCTR: 1.65,
        roas: 1.8
      },
      sections: [
        {
          title: 'Resumo Executivo',
          type: 'summary',
          data: {
            totalInvestment: 2240.30,
            totalLeads: 12,
            costPerLead: 186.69,
            conversionRate: 41.67,
            roas: 1.8
          }
        },
        {
          title: 'Performance por Plataforma',
          type: 'platforms',
          data: [
            {
              platform: 'Google Ads',
              investment: 1344.18,
              leads: 7,
              cpc: 16.28,
              ctr: 1.8
            },
            {
              platform: 'Facebook Ads',
              investment: 896.12,
              leads: 5,
              cpc: 13.32,
              ctr: 1.5
            }
          ]
        },
        {
          title: 'Campanhas Top Performance',
          type: 'top_campaigns',
          data: [
            {
              name: 'Campanha de Busca Principal',
              investment: 784.11,
              leads: 4,
              roas: 2.2
            },
            {
              name: 'Facebook Feed Segmentado',
              investment: 560.07,
              leads: 3,
              roas: 1.6
            }
          ]
        }
      ]
    },
    'report-campaign-001': {
      id: 'report-campaign-001',
      name: 'Relatório de Campanha - Lançamento Produto',
      type: 'campaign',
      period: { start: '2024-03-15', end: '2024-04-15' },
      status: 'ready',
      createdAt: '2024-04-16T00:00:00Z',
      summary: {
        totalInvestment: 5680.90,
        totalLeads: 28,
        totalConversions: 14,
        averageCPC: 11.20,
        averageCTR: 2.10,
        roas: 2.4
      },
      sections: [
        {
          title: 'Resumo Executivo',
          type: 'summary',
          data: {
            totalInvestment: 5680.90,
            totalLeads: 28,
            costPerLead: 202.89,
            conversionRate: 50.0,
            roas: 2.4
          }
        },
        {
          title: 'Performance por Plataforma',
          type: 'platforms',
          data: [
            {
              platform: 'Google Ads',
              investment: 3408.54,
              leads: 16,
              cpc: 12.32,
              ctr: 2.3
            },
            {
              platform: 'Facebook Ads',
              investment: 2272.36,
              leads: 12,
              cpc: 10.08,
              ctr: 1.9
            }
          ]
        },
        {
          title: 'Campanhas Top Performance',
          type: 'top_campaigns',
          data: [
            {
              name: 'Lançamento - Busca',
              investment: 1988.32,
              leads: 11,
              roas: 2.8
            },
            {
              name: 'Lançamento - Social',
              investment: 1420.24,
              leads: 8,
              roas: 2.1
            }
          ]
        }
      ]
    }
  };

  return reports[reportId] || null;
}