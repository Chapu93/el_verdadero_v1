import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    // Read the HTML file
    const htmlContent = fs.readFileSync('/datos_locales/jvillaverde/Descargas/stitch_landing_page/code.html', 'utf8');

    // Extract CSS from <style> tags
    let css = '';
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let match;
    while ((match = styleRegex.exec(htmlContent)) !== null) {
        css += match[1].trim() + '\n';
    }

    // Extract body content
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let bodyHtml = bodyMatch ? bodyMatch[1] : htmlContent;

    // Remove script tags from body
    bodyHtml = bodyHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // Create the template
    const template = await prisma.template.create({
        data: {
            name: 'SaaS Landing Page',
            description: 'Plantilla profesional para landing page SaaS con hero, pricing, y footer. Incluye modo oscuro y Tailwind CSS.',
            htmlContent: bodyHtml.trim(),
            cssContent: css.trim(),
            isActive: true,
        }
    });

    console.log('✅ Template created:', template.id);
    console.log('   Name:', template.name);
    console.log('   HTML length:', template.htmlContent.length);
    console.log('   CSS length:', template.cssContent?.length || 0);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
