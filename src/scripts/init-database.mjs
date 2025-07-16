/**
 * Database Initialization Script for NINETWODASH
 * Creates initial admin user, media analyst and client data from CSV
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// Database connection
async function connectToDatabase() {
  try {
    const mongoUri = 'mongodb://root:FDefhgOxFQFDN3MBLAIalOgb6Z6dsImulqQOMYcXQl22xxU4YZ6ZM5MdjwQp65hA@162.240.99.119:5187/?directConnection=true';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

// Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client', 'media_analyst'], default: 'client' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  avatar: String,
  isActive: { type: Boolean, default: true },
  permissions: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  monthlyBudget: { type: Number, required: true },
  avatar: String,
  tags: [String],
  portalSettings: {
    logoUrl: String,
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#8B5CF6' },
    allowedSections: [{ type: String, enum: ['dashboard', 'campanhas', 'analytics', 'relatorios', 'configuracoes'] }],
  },
  googleAds: {
    connected: { type: Boolean, default: false },
    customerId: String,
    lastSync: Date,
  },
  facebookAds: {
    connected: { type: Boolean, default: false },
    accountId: String,
    lastSync: Date,
  },
  googleAnalytics: {
    connected: { type: Boolean, default: false },
    propertyId: String,
    lastSync: Date,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);

// Dados do CSV - Novos clientes
const CLIENTS_DATA = [
  {
    name: 'Dr. Percio',
    email: 'drpercio@dashboard.ninetwo.com.br',
    slug: 'dr-percio',
    monthlyBudget: 3700,
    tags: ['Verde', 'Saúde', 'Médico'],
    portalSettings: {
      primaryColor: '#0891B2',
      secondaryColor: '#0E7490',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Motin Films',
    email: 'motinfilms@dashboard.ninetwo.com.br',
    slug: 'motin-films',
    monthlyBudget: 5000,
    tags: ['Verde', 'Mídia', 'Filmes'],
    portalSettings: {
      primaryColor: '#DC2626',
      secondaryColor: '#B91C1C',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'CwTrends Suplementos',
    email: 'cwtrendssuplementos@dashboard.ninetwo.com.br',
    slug: 'cwtrends-suplementos',
    monthlyBudget: 18000,
    tags: ['Verde', 'Suplementos', 'Fitness'],
    portalSettings: {
      primaryColor: '#7C3AED',
      secondaryColor: '#6D28D9',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'LJ Santos',
    email: 'ljsantos@dashboard.ninetwo.com.br',
    slug: 'lj-santos',
    monthlyBudget: 7500,
    tags: ['Verde', 'Serviços', 'Consultoria'],
    portalSettings: {
      primaryColor: '#16A34A',
      secondaryColor: '#15803D',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Naport',
    email: 'naport@dashboard.ninetwo.com.br',
    slug: 'naport',
    monthlyBudget: 50000,
    tags: ['Verde', 'Logística', 'Porto'],
    portalSettings: {
      primaryColor: '#0891B2',
      secondaryColor: '#0E7490',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Global Best Parts',
    email: 'globalbestparts@dashboard.ninetwo.com.br',
    slug: 'global-best-parts',
    monthlyBudget: 3000,
    tags: ['Verde', 'Automotivo', 'Peças'],
    portalSettings: {
      primaryColor: '#EA580C',
      secondaryColor: '#C2410C',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Dr. Victor Mauro',
    email: 'drvictormauro@dashboard.ninetwo.com.br',
    slug: 'dr-victor-mauro',
    monthlyBudget: 5000,
    tags: ['Verde', 'Saúde', 'Médico'],
    portalSettings: {
      primaryColor: '#DC2626',
      secondaryColor: '#B91C1C',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'ABC Fitness',
    email: 'abcfitness@dashboard.ninetwo.com.br',
    slug: 'abc-fitness',
    monthlyBudget: 43000,
    tags: ['Amarela', 'Fitness', 'Academia'],
    portalSettings: {
      primaryColor: '#059669',
      secondaryColor: '#047857',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'M2Z Creative',
    email: 'm2zcreative@dashboard.ninetwo.com.br',
    slug: 'm2z-creative',
    monthlyBudget: 4000,
    tags: ['Verde', 'Criativo', 'Design'],
    portalSettings: {
      primaryColor: '#7C3AED',
      secondaryColor: '#6D28D9',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Roberto Navarro',
    email: 'robertonavarro@dashboard.ninetwo.com.br',
    slug: 'roberto-navarro',
    monthlyBudget: 50000,
    tags: ['Vermelha', 'Consultoria', 'Negócios'],
    portalSettings: {
      primaryColor: '#DC2626',
      secondaryColor: '#B91C1C',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Skin Care Esthetic & Beauty',
    email: 'skincare@dashboard.ninetwo.com.br',
    slug: 'skin-care-esthetic-beauty',
    monthlyBudget: 3000,
    tags: ['Vermelha', 'Beleza', 'Estética'],
    portalSettings: {
      primaryColor: '#DB2777',
      secondaryColor: '#BE185D',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Live Academias',
    email: 'liveacademias@dashboard.ninetwo.com.br',
    slug: 'live-academias',
    monthlyBudget: 20000,
    tags: ['Verde', 'Fitness', 'Academia'],
    portalSettings: {
      primaryColor: '#059669',
      secondaryColor: '#047857',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Instituto Avance',
    email: 'institutoavance@dashboard.ninetwo.com.br',
    slug: 'instituto-avance',
    monthlyBudget: 3000,
    tags: ['Amarela', 'Educação', 'Instituto'],
    portalSettings: {
      primaryColor: '#F59E0B',
      secondaryColor: '#D97706',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Amitech',
    email: 'amitech@dashboard.ninetwo.com.br',
    slug: 'amitech',
    monthlyBudget: 2000,
    tags: ['Vermelha', 'Tecnologia', 'Soluções'],
    portalSettings: {
      primaryColor: '#2563EB',
      secondaryColor: '#1D4ED8',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Pesados Web',
    email: 'pesadosweb@dashboard.ninetwo.com.br',
    slug: 'pesados-web',
    monthlyBudget: 10000,
    tags: ['Verde', 'Web', 'Desenvolvimento'],
    portalSettings: {
      primaryColor: '#DB2777',
      secondaryColor: '#BE185D',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Vtelco',
    email: 'vtelco@dashboard.ninetwo.com.br',
    slug: 'vtelco',
    monthlyBudget: 3000,
    tags: ['Verde', 'Telecom', 'Redes'],
    portalSettings: {
      primaryColor: '#7C3AED',
      secondaryColor: '#6D28D9',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  }
];

async function initializeDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados NINETWODASH...\n');

  try {
    await connectToDatabase();

    // Limpar TODOS os dados existentes
    console.log('🧹 Limpando TODOS os dados existentes...');
    await User.deleteMany({});
    await Client.deleteMany({});
    console.log('✅ Dados limpos com sucesso');

    // Criar usuário admin
    console.log('\n👤 Criando usuário administrador...');
    const adminPassword = await bcryptjs.hash('admin123', 12);
    const admin = await User.create({
      email: 'admin@ninetwodash.com',
      password: adminPassword,
      name: 'Administrador NINETWODASH',
      role: 'admin',
      permissions: ['all'],
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff'
    });
    console.log('✅ Admin criado:', admin.email);

    // Criar analista de mídia
    console.log('\n👨‍💼 Criando analista de mídia...');
    const analystPassword = await bcryptjs.hash('analista123', 12);
    const analyst = await User.create({
      email: 'joao.guilherme@ninetwodash.com',
      password: analystPassword,
      name: 'João Guilherme',
      role: 'media_analyst',
      permissions: ['all'], // Todas as permissões do admin
      avatar: 'https://ui-avatars.com/api/?name=João+Guilherme&background=059669&color=fff'
    });
    console.log('✅ Analista de mídia criado:', analyst.email);

    // Criar todos os clientes
    console.log('\n🏢 Criando clientes...');
    const createdClients = [];

    for (const clientData of CLIENTS_DATA) {
      const client = await Client.create(clientData);
      createdClients.push(client);
      
      // Criar usuário para o cliente
      const clientPassword = await bcryptjs.hash('cliente123', 12);
      const clientUser = await User.create({
        email: clientData.email,
        password: clientPassword,
        name: `Portal ${clientData.name}`,
        role: 'client',
        clientId: client._id,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(clientData.name)}&background=7C3AED&color=fff`
      });

      console.log(`✅ Cliente criado: ${client.name} (${client.slug})`);
      console.log(`   📧 Login: ${clientUser.email} | Senha: cliente123`);
      console.log(`   🏷️ Tags: ${clientData.tags.join(', ')}`);
      console.log(`   💰 Orçamento: R$ ${clientData.monthlyBudget.toLocaleString('pt-BR')}`);
    }

    console.log(`\n🎉 Banco de dados inicializado com sucesso!`);
    console.log(`📊 Total de clientes: ${createdClients.length}`);
    console.log(`👥 Total de usuários: ${createdClients.length + 2}`); // +2 para admin e analista
    
    console.log('\n🔐 Credenciais de acesso:');
    console.log('📋 ADMIN:');
    console.log('   📧 Email: admin@ninetwodash.com');
    console.log('   🔑 Senha: admin123');
    
    console.log('\n📋 ANALISTA DE MÍDIA:');
    console.log('   📧 Email: joao.guilherme@ninetwodash.com');
    console.log('   🔑 Senha: analista123');
    console.log('   👤 Nome: João Guilherme');
    console.log('   🔐 Permissões: Todas (igual ao admin)');
    
    console.log('\n📋 CLIENTES (todos usam a mesma senha):');
    console.log('   🔑 Senha padrão: cliente123');
    console.log('   📧 Exemplos:');
    console.log('     • drpercio@dashboard.ninetwo.com.br');
    console.log('     • motinfilms@dashboard.ninetwo.com.br');
    console.log('     • cwtrendssuplementos@dashboard.ninetwo.com.br');
    console.log('     • [... todos os outros emails dos clientes]');

    console.log('\n🏷️ Tags por Bandeira:');
    console.log('   🟢 Verde: Clientes ativos e bem posicionados');
    console.log('   🟡 Amarela: Clientes que precisam de atenção');
    console.log('   🔴 Vermelha: Clientes que precisam de intervenção');

  } catch (error) {
    console.error('❌ Erro durante inicialização:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão com MongoDB fechada');
  }
}

// Executar inicialização
initializeDatabase();