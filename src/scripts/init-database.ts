/**
 * Database Initialization Script for NINETWODASH
 * Creates initial admin user and sample client data
 */

import { User, Client } from '../lib/mongodb';
import { hashPassword } from '../lib/auth';
import { testEncryption, generateEncryptionKey } from '../lib/encryption';

// Sample clients data based on the original list
const SAMPLE_CLIENTS = [
  {
    name: 'Catalisti Holding',
    email: 'contato@catalisti.com.br',
    slug: 'catalisti-holding',
    monthlyBudget: 25000,
    tags: ['premium', 'holding'],
    portalSettings: {
      logoUrl: '/assets/images/clients/catalisti-logo.png',
      primaryColor: '#2563EB',
      secondaryColor: '#7C3AED',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'ABC EVO',
    email: 'contato@abcevo.com.br',
    slug: 'abc-evo',
    monthlyBudget: 15000,
    tags: ['tech', 'startup'],
    portalSettings: {
      primaryColor: '#059669',
      secondaryColor: '#7C2D12',
      allowedSections: ['dashboard', 'campanhas', 'analytics'],
    }
  },
  {
    name: 'Dr. Victor Mauro',
    email: 'contato@drvictor.com.br',
    slug: 'dr-victor-mauro',
    monthlyBudget: 8000,
    tags: ['healthcare', 'medical'],
    portalSettings: {
      primaryColor: '#DC2626',
      secondaryColor: '#B91C1C',
      allowedSections: ['dashboard', 'relatorios'],
    }
  },
  {
    name: 'Dr. Percio',
    email: 'contato@drpercio.com.br',
    slug: 'dr-percio',
    monthlyBudget: 7500,
    tags: ['healthcare', 'medical'],
    portalSettings: {
      primaryColor: '#7C3AED',
      secondaryColor: '#5B21B6',
      allowedSections: ['dashboard', 'campanhas'],
    }
  },
  {
    name: 'CWTrends',
    email: 'contato@cwtrends.com.br',
    slug: 'cwtrends',
    monthlyBudget: 12000,
    tags: ['digital', 'trends'],
    portalSettings: {
      primaryColor: '#EA580C',
      secondaryColor: '#C2410C',
      allowedSections: ['dashboard', 'campanhas', 'analytics'],
    }
  },
  {
    name: 'Global Best Part',
    email: 'contato@globalbestpart.com.br',
    slug: 'global-best-part',
    monthlyBudget: 18000,
    tags: ['automotive', 'global'],
    portalSettings: {
      primaryColor: '#0891B2',
      secondaryColor: '#0E7490',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'LJ Santos',
    email: 'contato@ljsantos.com.br',
    slug: 'lj-santos',
    monthlyBudget: 9000,
    tags: ['services'],
    portalSettings: {
      primaryColor: '#16A34A',
      secondaryColor: '#15803D',
      allowedSections: ['dashboard', 'relatorios'],
    }
  },
  {
    name: 'Favretto Mídia Exterior',
    email: 'contato@favrettomidia.com.br',
    slug: 'favretto-midia-exterior',
    monthlyBudget: 22000,
    tags: ['media', 'outdoor'],
    portalSettings: {
      primaryColor: '#9333EA',
      secondaryColor: '#7C3AED',
      allowedSections: ['dashboard', 'campanhas', 'analytics'],
    }
  },
  {
    name: 'Favretto Comunicação Visual',
    email: 'contato@favrettocv.com.br',
    slug: 'favretto-comunicacao-visual',
    monthlyBudget: 16000,
    tags: ['design', 'visual'],
    portalSettings: {
      primaryColor: '#DB2777',
      secondaryColor: '#BE185D',
      allowedSections: ['dashboard', 'campanhas'],
    }
  },
  {
    name: 'Mundial',
    email: 'contato@mundial.com.br',
    slug: 'mundial',
    monthlyBudget: 30000,
    tags: ['enterprise', 'global'],
    portalSettings: {
      primaryColor: '#1F2937',
      secondaryColor: '#374151',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Naframe',
    email: 'contato@naframe.com.br',
    slug: 'naframe',
    monthlyBudget: 11000,
    tags: ['tech', 'frames'],
    portalSettings: {
      primaryColor: '#0D9488',
      secondaryColor: '#0F766E',
      allowedSections: ['dashboard', 'analytics'],
    }
  },
  {
    name: 'Motin Films',
    email: 'contato@motinfilms.com.br',
    slug: 'motin-films',
    monthlyBudget: 14000,
    tags: ['entertainment', 'media'],
    portalSettings: {
      primaryColor: '#B91C1C',
      secondaryColor: '#991B1B',
      allowedSections: ['dashboard', 'campanhas', 'analytics'],
    }
  },
  {
    name: 'Naport',
    email: 'contato@naport.com.br',
    slug: 'naport',
    monthlyBudget: 13000,
    tags: ['logistics', 'port'],
    portalSettings: {
      primaryColor: '#1E40AF',
      secondaryColor: '#1D4ED8',
      allowedSections: ['dashboard', 'relatorios'],
    }
  },
  {
    name: 'Autoconnect Prime',
    email: 'contato@autoconnectprime.com.br',
    slug: 'autoconnect-prime',
    monthlyBudget: 19000,
    tags: ['automotive', 'tech'],
    portalSettings: {
      primaryColor: '#DC2626',
      secondaryColor: '#EF4444',
      allowedSections: ['dashboard', 'campanhas', 'analytics'],
    }
  },
  {
    name: 'Vtelco Networks',
    email: 'contato@vtelco.com.br',
    slug: 'vtelco-networks',
    monthlyBudget: 26000,
    tags: ['telecom', 'networks'],
    portalSettings: {
      primaryColor: '#7C3AED',
      secondaryColor: '#8B5CF6',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Amitech',
    email: 'contato@amitech.com.br',
    slug: 'amitech',
    monthlyBudget: 17000,
    tags: ['technology', 'solutions'],
    portalSettings: {
      primaryColor: '#059669',
      secondaryColor: '#10B981',
      allowedSections: ['dashboard', 'campanhas', 'analytics'],
    }
  },
  {
    name: 'Hogrefe Construtora',
    email: 'contato@hogrefe.com.br',
    slug: 'hogrefe-construtora',
    monthlyBudget: 21000,
    tags: ['construction', 'real-estate'],
    portalSettings: {
      primaryColor: '#92400E',
      secondaryColor: '#A16207',
      allowedSections: ['dashboard', 'campanhas', 'relatorios'],
    }
  },
  {
    name: 'Colaço Engenharia',
    email: 'contato@colaco.com.br',
    slug: 'colaco-engenharia',
    monthlyBudget: 15500,
    tags: ['engineering', 'construction'],
    portalSettings: {
      primaryColor: '#1F2937',
      secondaryColor: '#4B5563',
      allowedSections: ['dashboard', 'analytics', 'relatorios'],
    }
  },
  {
    name: 'Pesados Web',
    email: 'contato@pesadosweb.com.br',
    slug: 'pesados-web',
    monthlyBudget: 10000,
    tags: ['web', 'digital'],
    portalSettings: {
      primaryColor: '#0891B2',
      secondaryColor: '#0284C7',
      allowedSections: ['dashboard', 'campanhas'],
    }
  },
  {
    name: 'Eleva Corpo e Alma',
    email: 'contato@elevacorpoealma.com.br',
    slug: 'eleva-corpo-e-alma',
    monthlyBudget: 8500,
    tags: ['wellness', 'health'],
    portalSettings: {
      primaryColor: '#DB2777',
      secondaryColor: '#EC4899',
      allowedSections: ['dashboard', 'relatorios'],
    }
  }
];

/**
 * Initialize database with sample data
 */
async function initializeDatabase() {
  try {
    console.log('🚀 Iniciando configuração do banco de dados...');
    
    // Test encryption before proceeding
    console.log('🔒 Testando sistema de criptografia...');
    if (!testEncryption()) {
      console.error('❌ Falha no teste de criptografia');
      console.log('💡 Certifique-se de definir ENCRYPTION_KEY no .env.local');
      console.log('💡 Use este comando para gerar uma chave: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
      return;
    }
    console.log('✅ Criptografia funcionando corretamente');
    
    // Connect to database
    console.log('✅ Conectado ao MongoDB');
    
    // Create admin user if doesn't exist
    console.log('👤 Verificando usuário administrador...');
    const existingAdmin = await (User as any).findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      const adminPassword = await hashPassword('admin123');
      const adminUser = new User({
        email: 'admin@ninetwodash.com',
        password: adminPassword,
        name: 'Administrador',
        role: 'admin',
        isActive: true,
      });
      
      await adminUser.save();
      console.log('✅ Usuário administrador criado');
      console.log('📧 Email: admin@ninetwodash.com');
      console.log('🔑 Senha: admin123');
      console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    } else {
      console.log('✅ Usuário administrador já existe');
    }
    
    // Create sample clients
    console.log('🏢 Criando clientes de exemplo...');
    
    for (const clientData of SAMPLE_CLIENTS) {
      const existingClient = await (Client as any).findOne({ slug: clientData.slug });
      
      if (!existingClient) {
        const client = new Client({
          ...clientData,
          status: 'active',
          avatar: `/assets/images/clients/${clientData.slug}.png`,
          
          // Initialize API configurations
          googleAds: {
            connected: false,
          },
          facebookAds: {
            connected: false,
          },
          googleAnalytics: {
            connected: false,
          },
        });
        
        await client.save();
        console.log(`✅ Cliente criado: ${clientData.name}`);
        
        // Create portal user for each client
        const clientPassword = await hashPassword('cliente123');
        const clientUser = new User({
          email: clientData.email,
          password: clientPassword,
          name: `Portal ${clientData.name}`,
          role: 'client',
          clientId: client._id,
          isActive: true,
        });
        
        await clientUser.save();
        console.log(`👤 Usuário portal criado para: ${clientData.name}`);
      } else {
        console.log(`⏭️  Cliente já existe: ${clientData.name}`);
      }
    }
    
    console.log('\n🎉 Banco de dados inicializado com sucesso!');
    console.log('\n📋 INFORMAÇÕES IMPORTANTES:');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│ ACESSO ADMINISTRATIVO                       │');
    console.log('├─────────────────────────────────────────────┤');
    console.log('│ URL: /login                                 │');
    console.log('│ Email: admin@ninetwodash.com                │');
    console.log('│ Senha: admin123                            │');
    console.log('└─────────────────────────────────────────────┘');
    console.log('\n┌─────────────────────────────────────────────┐');
    console.log('│ ACESSO DOS CLIENTES                         │');
    console.log('├─────────────────────────────────────────────┤');
    console.log('│ URL: /login                                 │');
    console.log('│ Email: [email-do-cliente]                   │');
    console.log('│ Senha: cliente123                          │');
    console.log('│ Portal: /portal/[slug-do-cliente]           │');
    console.log('└─────────────────────────────────────────────┘');
    console.log('\n⚠️  LEMBRETE: Altere todas as senhas padrão após o primeiro acesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
  }
}

/**
 * Create indexes for better performance
 */
async function createIndexes() {
  try {
    console.log('📈 Criando índices do banco de dados...');
    
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1, isActive: 1 });
    
    // Client indexes
    await Client.collection.createIndex({ slug: 1 }, { unique: true });
    await Client.collection.createIndex({ status: 1 });
    await Client.collection.createIndex({ 'googleAds.customerId': 1 });
    await Client.collection.createIndex({ 'facebookAds.adAccountId': 1 });
    
    console.log('✅ Índices criados com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao criar índices:', error);
  }
}

/**
 * Check system requirements
 */
async function checkRequirements() {
  console.log('🔍 Verificando requisitos do sistema...');
  
  const requirements = [
    {
      name: 'MONGODB_URI',
      value: process.env.MONGODB_URI,
      required: true,
    },
    {
      name: 'NEXTAUTH_SECRET',
      value: process.env.NEXTAUTH_SECRET,
      required: true,
    },
    {
      name: 'ENCRYPTION_KEY',
      value: process.env.ENCRYPTION_KEY,
      required: true,
    },
  ];
  
  let allGood = true;
  
  for (const req of requirements) {
    if (req.required && !req.value) {
      console.log(`❌ ${req.name} não está definida`);
      allGood = false;
    } else {
      console.log(`✅ ${req.name} configurada`);
    }
  }
  
  if (!allGood) {
    console.log('\n⚠️  Configure as variáveis de ambiente necessárias no .env.local');
    return false;
  }
  
  return true;
}

// Run initialization if called directly
if (require.main === module) {
  (async () => {
    const requirementsOk = await checkRequirements();
    if (requirementsOk) {
      await createIndexes();
      await initializeDatabase();
    }
    process.exit(0);
  })();
}

export { initializeDatabase, createIndexes, checkRequirements };