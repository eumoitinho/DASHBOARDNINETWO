"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import LoadingSpinner from './LoadingSpinner';
import Notification from './Notification';

const ClientTagsManager = () => {
  const [tags, setTags] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar clientes
      const clientsResponse = await fetch('/api/admin/clients');
      const clientsData = await clientsResponse.json();

      if (clientsResponse.ok) {
        setClients(clientsData.data || []);
        
        // Extrair tags únicas dos clientes
        const allTags = [];
        (clientsData.data || []).forEach(client => {
          if (client.tags && Array.isArray(client.tags)) {
            client.tags.forEach(tagName => {
              const existingTag = allTags.find(t => t.name === tagName);
              if (existingTag) {
                existingTag.count++;
              } else {
                allTags.push({
                  id: `tag-${tagName}`,
                  name: tagName,
                  color: getRandomColor(),
                  count: 1
                });
              }
            });
          }
        });
        
        setTags(allTags);
      } else {
        throw new Error(clientsData.message || 'Erro ao carregar clientes');
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados de tags');
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = ['primary', 'success', 'warning', 'info', 'secondary', 'danger'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getColorClass = (color) => {
    const colorClasses = {
      primary: 'bg-primary-subtle text-primary-main',
      success: 'bg-success-subtle text-success-main',
      warning: 'bg-warning-subtle text-warning-main',
      info: 'bg-info-subtle text-info-main',
      secondary: 'bg-secondary-subtle text-secondary-main',
      danger: 'bg-danger-subtle text-danger-main'
    };
    return colorClasses[color] || colorClasses.primary;
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTag.trim(),
          color: getRandomColor()
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTags([...tags, result.data]);
        setNewTag('');
        setNotification({
          type: 'success',
          title: 'Tag Adicionada!',
          message: `Tag "${newTag.trim()}" foi criada com sucesso!`
        });
      } else {
        throw new Error(result.message || 'Erro ao criar tag');
      }
    } catch (error) {
      console.error('Erro ao adicionar tag:', error);
      setNotification({
        type: 'error',
        title: 'Erro!',
        message: error.message || 'Erro ao adicionar tag'
      });
    }
  };

  const handleEditTag = (tag) => {
    setEditingTag(tag);
  };

  const handleSaveEdit = async () => {
    if (!editingTag.name.trim()) return;

    try {
      const response = await fetch(`/api/admin/tags/${editingTag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTag),
      });

      const result = await response.json();

      if (response.ok) {
        setTags(tags.map(tag => 
          tag.id === editingTag.id ? editingTag : tag
        ));
        setEditingTag(null);
        setNotification({
          type: 'success',
          title: 'Tag Atualizada!',
          message: 'Tag foi atualizada com sucesso!'
        });
      } else {
        throw new Error(result.message || 'Erro ao atualizar tag');
      }
    } catch (error) {
      console.error('Erro ao atualizar tag:', error);
      setNotification({
        type: 'error',
        title: 'Erro!',
        message: error.message || 'Erro ao atualizar tag'
      });
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tag?')) return;

    try {
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setTags(tags.filter(tag => tag.id !== tagId));
        setNotification({
          type: 'success',
          title: 'Tag Excluída!',
          message: 'Tag foi excluída com sucesso!'
        });
      } else {
        throw new Error(result.message || 'Erro ao excluir tag');
      }
    } catch (error) {
      console.error('Erro ao excluir tag:', error);
      setNotification({
        type: 'error',
        title: 'Erro!',
        message: error.message || 'Erro ao excluir tag'
      });
    }
  };

  const handleAssignTag = async (clientId, tagName) => {
    try {
      const client = clients.find(c => c._id === clientId);
      if (!client) return;

      const newTags = client.tags?.includes(tagName) 
        ? client.tags.filter(tag => tag !== tagName)
        : [...(client.tags || []), tagName];

      const response = await fetch(`/api/admin/clients/${client.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...client,
          tags: newTags
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Atualizar lista de clientes
        setClients(clients.map(c => 
          c._id === clientId ? { ...c, tags: newTags } : c
        ));

        // Atualizar contagem das tags
        setTags(tags.map(tag => ({
          ...tag,
          count: clients.filter(client => 
            client.tags?.includes(tag.name)
          ).length
        })));

        setNotification({
          type: 'success',
          title: 'Tag Atribuída!',
          message: `Tag "${tagName}" foi ${newTags.includes(tagName) ? 'adicionada' : 'removida'} com sucesso!`
        });
      } else {
        throw new Error(result.message || 'Erro ao atribuir tag');
      }
    } catch (error) {
      console.error('Erro ao atribuir tag:', error);
      setNotification({
        type: 'error',
        title: 'Erro!',
        message: error.message || 'Erro ao atribuir tag'
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Carregando gerenciador de tags..." />;
  }

  if (error) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <Icon icon="solar:close-circle-bold" className="text-danger text-4xl mb-3" />
              <h5>Erro ao carregar tags</h5>
              <p className="text-muted">{error}</p>
              <button 
                className="btn btn-primary" 
                onClick={fetchData}
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {notification && (
        <div className="col-12 mb-3">
          <Notification
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {/* Gerenciar Tags */}
      <div className="col-md-4 mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">Gerenciar Tags</h6>
          </div>
          <div className="card-body">
            {/* Adicionar Nova Tag */}
            <div className="mb-3">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nova tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Icon icon="solar:add-circle-bold" />
                </button>
              </div>
            </div>

            {/* Lista de Tags */}
            <div className="mb-3">
              <h6 className="mb-2">Tags Existentes</h6>
              {tags.length === 0 ? (
                <div className="text-center py-3">
                  <Icon icon="solar:tag-price-bold" className="text-muted text-2xl mb-2" />
                  <p className="text-muted mb-0">Nenhuma tag criada</p>
                </div>
              ) : (
                tags.map((tag) => (
                  <div key={tag.id} className="d-flex align-items-center justify-content-between mb-2 p-2 border rounded">
                    <div className="d-flex align-items-center">
                      <span className={`badge ${getColorClass(tag.color)} me-2`}>
                        {tag.name}
                      </span>
                      <small className="text-muted">({tag.count} clientes)</small>
                    </div>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEditTag(tag)}
                        title="Editar"
                      >
                        <Icon icon="solar:pen-bold" />
                      </button>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleDeleteTag(tag.id)}
                        title="Excluir"
                      >
                        <Icon icon="solar:trash-bin-trash-bold" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal de Edição */}
            {editingTag && (
              <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Editar Tag</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setEditingTag(null)}
                      />
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Nome da Tag</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editingTag.name}
                          onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Cor</label>
                        <select
                          className="form-select"
                          value={editingTag.color}
                          onChange={(e) => setEditingTag({...editingTag, color: e.target.value})}
                        >
                          <option value="primary">Primária</option>
                          <option value="success">Sucesso</option>
                          <option value="warning">Aviso</option>
                          <option value="info">Informação</option>
                          <option value="secondary">Secundária</option>
                          <option value="danger">Perigo</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => setEditingTag(null)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSaveEdit}
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="col-md-8 mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">Clientes e Tags</h6>
          </div>
          <div className="card-body">
            {clients.length === 0 ? (
              <div className="text-center py-4">
                <Icon icon="solar:users-group-rounded-bold" className="text-muted text-4xl mb-3" />
                <h6>Nenhum cliente encontrado</h6>
                <p className="text-muted">Adicione clientes para gerenciar tags</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Status</th>
                      <th>Tags</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {client.avatar ? (
                              <img
                                src={client.avatar}
                                alt={client.name}
                                className="rounded-circle me-3"
                                width="40"
                                height="40"
                              />
                            ) : (
                              <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white me-3" 
                                   style={{width: '40px', height: '40px'}}>
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h6 className="mb-0">{client.name}</h6>
                              <small className="text-muted">{client.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${client.status === 'active' ? 'bg-success-subtle text-success-main' : 'bg-warning-subtle text-warning-main'}`}>
                            {client.status === 'active' ? 'Ativo' : 'Pendente'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {client.tags?.map((tagName, index) => {
                              const tag = tags.find(t => t.name === tagName);
                              return (
                                <span key={index} className={`badge ${tag ? getColorClass(tag.color) : 'bg-secondary-subtle text-secondary-main'}`}>
                                  {tagName}
                                </span>
                              );
                            })}
                            {(!client.tags || client.tags.length === 0) && (
                              <span className="text-muted">Sem tags</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-outline-primary dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              <Icon icon="solar:tag-price-bold" />
                            </button>
                            <ul className="dropdown-menu">
                              {tags.map((tag) => (
                                <li key={tag.id}>
                                  <button
                                    className={`dropdown-item ${client.tags?.includes(tag.name) ? 'active' : ''}`}
                                    onClick={() => handleAssignTag(client._id, tag.name)}
                                  >
                                    <Icon icon="solar:tag-price-bold" className="me-2" />
                                    {tag.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTagsManager; 