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

    // Get client settings
    const settings = {
      profile: {
        name: clientData.name || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        company: clientData.name || '',
        website: clientData.website || '',
        address: clientData.address || '',
        description: clientData.description || ''
      },
      notifications: clientData.settings?.notifications || {
        emailReports: true,
        emailAlerts: true,
        weeklyDigest: true,
        campaignUpdates: true,
        budgetAlerts: true,
        performanceAlerts: false
      },
      privacy: clientData.settings?.privacy || {
        dataRetention: '12months',
        allowAnalytics: true,
        shareData: false,
        marketingEmails: true
      },
      integrations: {
        googleAds: {
          connected: clientData.googleAds?.connected || false,
          lastSync: clientData.googleAds?.lastSync || null
        },
        facebookAds: {
          connected: clientData.facebookAds?.connected || false,
          lastSync: clientData.facebookAds?.lastSync || null
        },
        googleAnalytics: {
          connected: clientData.googleAnalytics?.connected || false,
          lastSync: clientData.googleAnalytics?.lastSync || null
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { client } = await params;
    const settings = await request.json();
    
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

    // Update client settings in database
    // For now, just return success
    // TODO: Implement actual database update
    /*
    await Client.findByIdAndUpdate(clientData._id, {
      $set: {
        name: settings.profile.name,
        email: settings.profile.email,
        phone: settings.profile.phone,
        website: settings.profile.website,
        address: settings.profile.address,
        description: settings.profile.description,
        'settings.notifications': settings.notifications,
        'settings.privacy': settings.privacy,
        updatedAt: new Date()
      }
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Configurações salvas com sucesso',
      data: settings
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}