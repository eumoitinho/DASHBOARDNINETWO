import { NextRequest, NextResponse } from 'next/server';
import { prisma, getAllClients } from '@/lib/database';
import type { APIResponse } from '@/types/dashboard';

/**
 * GET /api/admin/tags
 * Get all tags
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    
    // Get all clients to extract unique tags
    const clients = await getAllClients();
    
    // Extract unique tags from clients
    const tagMap = new Map();
    
    clients.forEach(client => {
      if (client.tags && Array.isArray(client.tags)) {
        client.tags.forEach(tagName => {
          if (tagMap.has(tagName)) {
            tagMap.get(tagName).count++;
          } else {
            tagMap.set(tagName, {
              id: `tag-${tagName}`,
              name: tagName,
              color: getRandomColor(),
              count: 1
            });
          }
        });
      }
    });
    
    const tags = Array.from(tagMap.values());

    return NextResponse.json<APIResponse<any[]>>({
      success: true,
      data: tags,
      message: 'Tags carregadas com sucesso',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao buscar tags:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'FETCH_TAGS_ERROR',
      message: error.message || 'Erro ao buscar tags',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/tags
 * Create a new tag
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    if (!body.name || !body.name.trim()) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'MISSING_TAG_NAME',
        message: 'Nome da tag é obrigatório',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    const tag = {
      id: `tag-${body.name.trim()}`,
      name: body.name.trim(),
      color: body.color || getRandomColor(),
      count: 0
    };

    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: tag,
      message: 'Tag criada com sucesso',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao criar tag:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'CREATE_TAG_ERROR',
      message: error.message || 'Erro ao criar tag',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

function getRandomColor() {
  const colors = ['primary', 'success', 'warning', 'info', 'secondary', 'danger'];
  return colors[Math.floor(Math.random() * colors.length)];
} 