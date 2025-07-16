import { NextRequest, NextResponse } from 'next/server';
import { prisma, getAllClients, updateClient } from '@/lib/database';
import type { APIResponse } from '@/types/dashboard';

/**
 * PUT /api/admin/tags/[id]
 * Update a specific tag
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!body.name || !body.name.trim()) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'MISSING_TAG_NAME',
        message: 'Nome da tag é obrigatório',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Update tag in all clients that use it
    const tagToUpdate = id.replace('tag-', '');
    const clients = await getAllClients();
    
    // Filter clients that have the tag
    const clientsWithTag = clients.filter(client => 
      client.tags && client.tags.includes(tagToUpdate)
    );
    
    for (const client of clientsWithTag) {
      const updatedTags = client.tags.map(tag => 
        tag === tagToUpdate ? body.name.trim() : tag
      );
      
      await updateClient(client.id, { tags: updatedTags });
    }

    const updatedTag = {
      id: id,
      name: body.name.trim(),
      color: body.color || 'primary',
      count: clientsWithTag.length
    };

    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: updatedTag,
      message: 'Tag atualizada com sucesso',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao atualizar tag:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'UPDATE_TAG_ERROR',
      message: error.message || 'Erro ao atualizar tag',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/tags/[id]
 * Delete a specific tag
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    
    // Remove tag from all clients that use it
    const tagToRemove = id.replace('tag-', '');
    const clients = await getAllClients();
    
    // Filter clients that have the tag
    const clientsWithTag = clients.filter(client => 
      client.tags && client.tags.includes(tagToRemove)
    );
    
    for (const client of clientsWithTag) {
      const updatedTags = client.tags.filter(tag => tag !== tagToRemove);
      
      await updateClient(client.id, { tags: updatedTags });
    }

    return NextResponse.json<APIResponse<null>>({
      success: true,
      message: 'Tag removida com sucesso',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao remover tag:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'DELETE_TAG_ERROR',
      message: error.message || 'Erro ao remover tag',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 