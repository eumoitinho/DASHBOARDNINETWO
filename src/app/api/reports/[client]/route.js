import { NextResponse } from 'next/server';
import { findClientBySlug, prisma } from '@/lib/database';
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

    // Get reports from database using Prisma
    const reports = await prisma.report.findMany({
      where: {
        clientId: clientData.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: reports,
      totalCount: reports.length
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { client } = await params;
    const { type, period } = await request.json();
    
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

    // Generate new report
    const newReport = await generateReport(clientData, type, period);

    return NextResponse.json({
      success: true,
      data: newReport,
      message: 'Relatório gerado com sucesso'
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function generateReport(clientData, type, period) {
  const reportId = `report-${type}-${Date.now()}`;
  const now = new Date();
  const startDate = new Date(now);
  
  // Calculate period dates
  if (period.days) {
    startDate.setDate(now.getDate() - period.days);
  }

  const report = {
    id: reportId,
    name: `Relatório ${getReportTypeName(type)} - ${now.toLocaleDateString('pt-BR')}`,
    type: type,
    period: { 
      start: startDate.toISOString().split('T')[0], 
      end: now.toISOString().split('T')[0] 
    },
    status: 'ready',
    createdAt: now.toISOString(),
    summary: {
      totalInvestment: Math.random() * 10000 + 5000,
      totalLeads: Math.floor(Math.random() * 50 + 20),
      totalConversions: Math.floor(Math.random() * 20 + 5),
      averageCPC: Math.random() * 20 + 10,
      averageCTR: Math.random() * 3 + 0.5,
      roas: Math.random() * 2 + 1
    }
  };

  // Save report to database using Prisma
  await prisma.report.create({
    data: {
      clientId: clientData.id,
      name: report.name,
      type: report.type,
      period: report.period,
      status: report.status,
      summary: report.summary
    }
  });

  return report;
}

function getReportTypeName(type) {
  const types = {
    weekly: 'Semanal',
    monthly: 'Mensal',
    campaign: 'de Campanha',
    custom: 'Personalizado'
  };
  return types[type] || 'Personalizado';
}

