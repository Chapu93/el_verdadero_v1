import { Router, Request, Response } from 'express';
import { pageService } from '../services/pages.service.js';

const router = Router();

const CACHE_TTL = 60 * 1000; // 60 seconds
const pageCache = new Map<string, { html: string; expires: number }>();

/**
 * Public route to render a page by slug
 * GET /p/:slug
 */
router.get('/:slug', async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug!;

        // Check cache
        const cached = pageCache.get(slug);
        if (cached && cached.expires > Date.now()) {
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'public, max-age=60');
            res.setHeader('X-Cache', 'HIT');
            return res.send(cached.html);
        }

        const page = await pageService.findBySlug(slug);

        if (!page.isPublished) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Página no encontrada</title></head>
                <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
                    <div style="text-align: center;">
                        <h1>404</h1>
                        <p>Esta página no está disponible</p>
                    </div>
                </body>
                </html>
            `);
        }

        // Build content replacements from elements
        const replacements: Record<string, string> = {};
        for (const element of page.elements) {
            replacements[element.elementKey] = element.content;
        }

        // Start with template HTML
        let html = page.template.htmlContent;

        // Replace placeholders with element values
        // Format: {{elementKey}} or data-element="elementKey"
        for (const [key, value] of Object.entries(replacements)) {
            // Replace mustache-style placeholders
            html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);

            // Replace data-element content (for more complex replacements)
            const dataElementRegex = new RegExp(
                `(<[^>]*data-element="${key}"[^>]*>)[^<]*(</[^>]+>)`,
                'g'
            );
            html = html.replace(dataElementRegex, `$1${value}$2`);
        }

        // Parse theme config
        let themeConfig: any = { mode: 'light', palette: {} };
        try {
            if ((page as any).theme) {
                themeConfig = JSON.parse((page as any).theme);
            }
        } catch (e) {
            console.error('Error parsing theme:', e);
        }

        const modeClass = themeConfig.mode === 'dark' ? 'dark' : '';

        // Build CSS variables override if palette exists
        let themeCss = '';
        if (themeConfig.palette && Object.keys(themeConfig.palette).length > 0) {
            const vars = Object.entries(themeConfig.palette)
                .map(([k, v]) => `${k}: ${v};`)
                .join(' ');
            themeCss = `:root { ${vars} }`;
        }

        // Inject custom CSS if present
        const customCss = page.customCss || '';
        const templateCss = page.template.cssContent || '';

        // If template doesn't include a <style> section, wrap and inject
        if (!html.includes('</head>')) {
            html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${page.name}</title>
                    <style>${templateCss}</style>
                    <style>${customCss}</style>
                    <style>${themeCss}</style>
                </head>
                <body class="${modeClass}">${html}</body>
                </html>
            `;
        } else {
            // Inject styles before </head>
            const styles = `<style>${templateCss}</style><style>${customCss}</style><style>${themeCss}</style>`;
            html = html.replace('</head>', `${styles}</head>`);

            // Inject class to body
            if (html.includes('<body')) {
                html = html.replace('<body', `<body class="${modeClass}"`);
            } else {
                html = html.replace('<body>', `<body class="${modeClass}">`);
            }
        }

        // Update cache
        pageCache.set(slug, {
            html,
            expires: Date.now() + CACHE_TTL
        });

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.setHeader('X-Cache', 'MISS');
        return res.send(html);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage === 'PAGE_NOT_FOUND') {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Página no encontrada</title></head>
                <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
                    <div style="text-align: center;">
                        <h1>404</h1>
                        <p>Página no encontrada</p>
                    </div>
                </body>
                </html>
            `);
        }

        return res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Error</title></head>
            <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
                <div style="text-align: center;">
                    <h1>Error</h1>
                    <p>Ocurrió un error al cargar la página</p>
                </div>
            </body>
            </html>
        `);
    }
});

export default router;
