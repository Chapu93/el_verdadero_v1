import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.pageElement.deleteMany();
    await prisma.page.deleteMany();
    await prisma.template.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();

    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@empresa.com',
            password: adminPassword,
            firstName: 'Carlos',
            lastName: 'Ruiz',
            role: 'ADMIN',
            subscription: {
                create: {
                    plan: 'PRO',
                },
            },
        },
    });
    console.log('👤 Admin user created:', admin.email);

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await prisma.user.create({
        data: {
            email: 'user@empresa.com',
            password: userPassword,
            firstName: 'María',
            lastName: 'González',
            role: 'USER',
            subscription: {
                create: {
                    plan: 'FREE',
                },
            },
        },
    });
    console.log('👤 Regular user created:', user.email);

    // Create customers
    const customers = await Promise.all([
        prisma.customer.create({
            data: {
                name: 'Empresa ABC S.A.',
                email: 'contacto@empresaabc.com',
                status: 'ACTIVE',
            },
        }),
        prisma.customer.create({
            data: {
                name: 'Consultora XYZ',
                email: 'info@consultoraxyz.com',
                status: 'ACTIVE',
            },
        }),
        prisma.customer.create({
            data: {
                name: 'Tecnología DEF',
                email: 'ventas@tecnologiadef.com',
                status: 'PENDING',
            },
        }),
        prisma.customer.create({
            data: {
                name: 'Servicios GHI',
                email: 'admin@serviciosghi.com',
                status: 'INACTIVE',
            },
        }),
        prisma.customer.create({
            data: {
                name: 'Distribuidora JKL',
                email: 'compras@distribuidorajkl.com',
                status: 'ACTIVE',
            },
        }),
    ]);
    console.log('🏢 Created', customers.length, 'customers');

    // Create orders
    const orders = await Promise.all([
        prisma.order.create({
            data: {
                orderNumber: 'ORD-0001',
                customerId: customers[0].id,
                total: 15000.50,
                status: 'COMPLETED',
            },
        }),
        prisma.order.create({
            data: {
                orderNumber: 'ORD-0002',
                customerId: customers[1].id,
                total: 8500.00,
                status: 'PROCESSING',
            },
        }),
        prisma.order.create({
            data: {
                orderNumber: 'ORD-0003',
                customerId: customers[0].id,
                total: 22000.00,
                status: 'PENDING',
            },
        }),
        prisma.order.create({
            data: {
                orderNumber: 'ORD-0004',
                customerId: customers[2].id,
                total: 5750.25,
                status: 'PENDING',
            },
        }),
        prisma.order.create({
            data: {
                orderNumber: 'ORD-0005',
                customerId: customers[4].id,
                total: 12300.00,
                status: 'COMPLETED',
            },
        }),
        prisma.order.create({
            data: {
                orderNumber: 'ORD-0006',
                customerId: customers[1].id,
                total: 3200.00,
                status: 'CANCELLED',
            },
        }),
    ]);
    console.log('📦 Created', orders.length, 'orders');

    // Create sample templates
    const landingPageHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
</head>
<body>
    <header style="background: {{headerBackground}}; padding: 20px; text-align: center;">
        <img src="{{logoImage}}" alt="Logo" style="height: 50px;">
        <nav style="margin-top: 15px;">
            <a href="{{ctaLink}}" style="color: white; margin: 0 15px; text-decoration: none;">Inicio</a>
            <a href="#about" style="color: white; margin: 0 15px; text-decoration: none;">Nosotros</a>
            <a href="#contact" style="color: white; margin: 0 15px; text-decoration: none;">Contacto</a>
        </nav>
    </header>
    
    <main>
        <section style="padding: 80px 20px; text-align: center; background: linear-gradient(135deg, {{primaryColor}} 0%, {{secondaryColor}} 100%); color: white;">
            <h1 style="font-size: 3rem; margin-bottom: 20px;">{{heroTitle}}</h1>
            <p style="font-size: 1.25rem; margin-bottom: 30px; max-width: 600px; margin-left: auto; margin-right: auto;">{{heroDescription}}</p>
            <a href="{{ctaLink}}" style="display: inline-block; background: white; color: {{primaryColor}}; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">{{buttonText}}</a>
        </section>
        
        <section id="about" style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
            <h2 style="text-align: center; margin-bottom: 20px;">{{aboutTitle}}</h2>
            <p style="text-align: center; color: #666;">{{aboutDescription}}</p>
        </section>
        
        <section id="contact" style="padding: 60px 20px; background: #f5f5f5; text-align: center;">
            <h2 style="margin-bottom: 20px;">Contáctanos</h2>
            <p>Email: {{contactEmail}}</p>
            <p>Teléfono: {{contactPhone}}</p>
        </section>
    </main>
    
    <footer style="background: #333; color: white; padding: 20px; text-align: center;">
        <p>{{footerText}}</p>
    </footer>
</body>
</html>`;

    const templates = await Promise.all([
        prisma.template.create({
            data: {
                name: 'Landing Page Pro (Themeable)',
                description: 'Plantilla moderna con soporte para Modo Oscuro y Colores dinámicos.',
                htmlContent: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
</head>
<body>
    <header style="background: var(--header-bg); padding: 20px; text-align: center; border-bottom: 1px solid var(--border);">
        <img src="{{logoImage}}" alt="Logo" style="height: 50px;">
        <nav style="margin-top: 15px;">
            <a href="{{ctaLink}}" style="color: var(--text); margin: 0 15px; text-decoration: none;">Inicio</a>
            <a href="#about" style="color: var(--text); margin: 0 15px; text-decoration: none;">Nosotros</a>
            <a href="#contact" style="color: var(--text); margin: 0 15px; text-decoration: none;">Contacto</a>
        </nav>
    </header>
    
    <main>
        <section style="padding: 80px 20px; text-align: center; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white;">
            <h1 style="font-size: 3rem; margin-bottom: 20px;">{{heroTitle}}</h1>
            <p style="font-size: 1.25rem; margin-bottom: 30px; max-width: 600px; margin-left: auto; margin-right: auto; opacity: 0.9;">{{heroDescription}}</p>
            <a href="{{ctaLink}}" style="display: inline-block; background: white; color: var(--primary); padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">{{buttonText}}</a>
        </section>
        
        <section id="about" style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
            <h2 style="text-align: center; margin-bottom: 20px; color: var(--text);">{{aboutTitle}}</h2>
            <p style="text-align: center; color: var(--text-muted);">{{aboutDescription}}</p>
        </section>
        
        <section id="contact" style="padding: 60px 20px; background: var(--section-bg); text-align: center;">
            <h2 style="margin-bottom: 20px; color: var(--text);">Contáctanos</h2>
            <p style="color: var(--text);">Email: {{contactEmail}}</p>
            <p style="color: var(--text);">Teléfono: {{contactPhone}}</p>
        </section>
    </main>
    
    <footer style="background: var(--footer-bg); color: white; padding: 20px; text-align: center;">
        <p>{{footerText}}</p>
    </footer>
</body>
</html>`,
                cssContent: `
:root {
    --primary: #3B82F6;
    --secondary: #2563EB;
    --bg: #FFFFFF;
    --header-bg: #FFFFFF;
    --section-bg: #F3F4F6;
    --footer-bg: #1F2937;
    --text: #111827;
    --text-muted: #6B7280;
    --border: #E5E7EB;
}

.dark {
    --primary: #60A5FA;
    --secondary: #3B82F6;
    --bg: #111827;
    --header-bg: #1F2937;
    --section-bg: #374151;
    --footer-bg: #000000;
    --text: #F9FAFB;
    --text-muted: #D1D5DB;
    --border: #374151;
}

body {
    background-color: var(--bg);
    color: var(--text);
    font-family: system-ui, -apple-system, sans-serif;
    margin: 0;
    padding: 0;
    transition: background-color 0.3s, color 0.3s;
}
`,
                isActive: true,
            },
        }),
        prisma.template.create({
            data: {
                name: 'Página Simple',
                description: 'Página minimalista con título y descripción.',
                htmlContent: '<div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background: {{backgroundColor}};"><h1 style="font-size: 2.5rem; color: {{textColor}}; margin-bottom: 20px;">{{title}}</h1><p style="font-size: 1.2rem; color: {{textColor}}; opacity: 0.8; max-width: 500px; text-align: center;">{{description}}</p><a href="{{linkUrl}}" style="margin-top: 30px; padding: 12px 24px; background: {{buttonColor}}; color: white; text-decoration: none; border-radius: 6px;">{{buttonText}}</a></div>',
                cssContent: '* { font-family: system-ui, -apple-system, sans-serif; margin: 0; }',
                isActive: true,
            },
        }),
    ]);
    console.log('📄 Created', templates.length, 'templates');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@empresa.com / admin123');
    console.log('   User:  user@empresa.com / user123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
