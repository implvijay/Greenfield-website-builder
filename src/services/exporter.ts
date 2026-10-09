import { Project, Page, Section, Menu, MenuItem, DesignTokens, Form, FormField } from '../types';
import { getThemeTokens } from '../data/themes';
import JSZip from 'jszip';

// Static HTML Export - generates a complete multi-page site
export function generateStaticSite(project: Project): Record<string, string> {
  const tokens = getThemeTokens(project.themeId, project.themeVariant);
  const pages = project.pages.filter(p => p.status === 'published');
  const primaryMenu = project.menus.find(m => m.location === 'primary');
  const footerMenu = project.menus.find(m => m.location === 'footer');
  const files: Record<string, string> = {};

  const renderMenuItems = (items: MenuItem[], isFooter = false): string =>
    items.filter(i => i.enabled).map(item => {
      const page = item.pageId ? project.pages.find(p => p.id === item.pageId) : null;
      const href = item.type === 'url' ? (item.target || '#') :
                   item.type === 'email' ? `mailto:${item.target}` :
                   item.type === 'phone' ? `tel:${item.target}` :
                   page ? `/${page.slug === 'home' ? 'index' : page.slug}.html` : '#';
      const children = item.children.length > 0 ? `<ul class="submenu">${renderMenuItems(item.children, isFooter)}</ul>` : '';
      return `<li class="menu-item${item.children.length > 0 ? ' has-children' : ''}"><a href="${href}"${item.openInNewTab ? ' target="_blank" rel="noopener"' : ''}>${item.label}</a>${children}</li>`;
    }).join('\n');

  const renderComponent = (comp: any, tokens: DesignTokens, textColor: string): string => {
    const { type, props } = comp;
    switch (type) {
      case 'heading': {
        const sizes: Record<string, string> = { '5xl': '3rem', '4xl': '2.5rem', '3xl': '2rem', '2xl': '1.5rem', 'xl': '1.25rem' };
        const tag = `h${props.level || 2}`;
        return `<${tag} class="gf-heading" style="font-family:${tokens.typography.headingFont};font-weight:${tokens.typography.headingWeight};font-size:${sizes[props.size] || '2rem'};color:${textColor};margin-bottom:0.75rem;line-height:1.2">${escapeHtml(props.text || '')}</${tag}>`;
      }
      case 'paragraph':
        return `<p class="gf-paragraph" style="font-family:${tokens.typography.bodyFont};font-size:${tokens.typography.bodySize};color:${textColor};opacity:0.85;line-height:${tokens.typography.lineHeight};margin-bottom:1rem">${escapeHtml(props.text || '')}</p>`;
      case 'text':
        return `<div class="gf-text" style="font-family:${tokens.typography.bodyFont};font-size:${tokens.typography.bodySize};color:${textColor};opacity:0.85;line-height:1.8;white-space:pre-line">${escapeHtml(props.text || '')}</div>`;
      case 'button-group':
        return `<div class="gf-buttons" style="display:flex;gap:0.75rem;justify-content:${props.align || 'center'};margin-top:1rem;flex-wrap:wrap">${(props.buttons || []).map((b: any) => {
          const style = b.variant === 'primary'
            ? `background:${tokens.colors.primary};color:#fff;border:none`
            : `background:transparent;color:${textColor};border:2px solid ${textColor}30`;
          return `<a href="${b.url || '#'}" class="gf-btn" style="padding:0.75rem 1.5rem;border-radius:${tokens.borderRadius};font-weight:600;font-size:0.9rem;text-decoration:none;display:inline-block;transition:all 0.2s;${style}">${escapeHtml(b.label)}</a>`;
        }).join('')}</div>`;
      case 'image':
        return props.src ? `<img src="${props.src}" alt="${escapeHtml(props.alt || '')}" style="width:100%;border-radius:${tokens.borderRadius};object-fit:cover;max-height:400px" loading="lazy" />` : `<div style="width:100%;height:200px;background:${tokens.colors.surfaceAlt};border-radius:${tokens.borderRadius};display:flex;align-items:center;justify-content:center;color:${tokens.colors.textMuted}">Image placeholder</div>`;
      case 'card':
        return `<div class="gf-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;margin-top:1.5rem">${(props.cards || []).map((card: any) => `
          <div class="gf-card" style="background:${tokens.colors.surface};border-radius:${tokens.borderRadius};padding:1.5rem;border:1px solid ${tokens.colors.border};text-align:center">
            ${card.icon ? `<span style="font-size:2rem;display:block;margin-bottom:0.75rem">${card.icon}</span>` : ''}
            ${card.image ? `<img src="${card.image}" alt="" style="width:100%;height:150px;object-fit:cover;border-radius:${tokens.borderRadius};margin-bottom:1rem" loading="lazy" />` : ''}
            <h4 style="font-weight:600;color:${textColor};margin-bottom:0.5rem">${escapeHtml(card.title || '')}</h4>
            <p style="font-size:0.875rem;color:${textColor};opacity:0.7">${escapeHtml(card.description || '')}</p>
          </div>`).join('')}</div>`;
      case 'stat':
        return `<div class="gf-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1.5rem;margin-top:1rem">${(props.stats || []).map((s: any) => `
          <div style="text-align:center">
            <p style="font-size:2.5rem;font-weight:800;color:${tokens.colors.primary};line-height:1">${escapeHtml(s.value || '')}</p>
            <p style="font-size:0.875rem;color:${textColor};opacity:0.7;margin-top:0.5rem">${escapeHtml(s.label || '')}</p>
          </div>`).join('')}</div>`;
      case 'testimonial':
        return `<div class="gf-testimonials" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;margin-top:1.5rem">${(props.testimonials || []).map((t: any) => `
          <div style="background:${tokens.colors.surface};border-radius:${tokens.borderRadius};padding:1.5rem;border:1px solid ${tokens.colors.border}">
            <p style="font-size:0.9rem;color:${textColor};opacity:0.8;line-height:1.7;margin-bottom:1rem;font-style:italic">"${escapeHtml(t.text || '')}"</p>
            <div><p style="font-weight:600;color:${textColor};font-size:0.875rem">${escapeHtml(t.name || '')}</p><p style="font-size:0.75rem;color:${textColor};opacity:0.6">${escapeHtml(t.role || '')}</p></div>
          </div>`).join('')}</div>`;
      case 'team-member':
        return `<div class="gf-team" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1.5rem;margin-top:1.5rem">${(props.members || []).map((m: any) => `
          <div style="text-align:center">
            <div style="width:80px;height:80px;border-radius:50%;background:${tokens.colors.surfaceAlt};margin:0 auto 0.75rem;display:flex;align-items:center;justify-content:center;font-size:2rem">👤</div>
            <p style="font-weight:600;color:${textColor};font-size:0.875rem">${escapeHtml(m.name || '')}</p>
            <p style="font-size:0.75rem;color:${textColor};opacity:0.6">${escapeHtml(m.role || '')}</p>
          </div>`).join('')}</div>`;
      case 'pricing-card':
        return `<div class="gf-pricing" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;margin-top:1.5rem">${(props.plans || []).map((plan: any) => `
          <div style="background:${plan.popular ? tokens.colors.primary : tokens.colors.surface};color:${plan.popular ? '#fff' : textColor};border-radius:${tokens.borderRadius};padding:2rem;border:1px solid ${plan.popular ? tokens.colors.primary : tokens.colors.border};text-align:center;position:relative">
            ${plan.popular ? `<span style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${tokens.colors.accent};color:#fff;padding:2px 12px;border-radius:99px;font-size:0.7rem;font-weight:600">Popular</span>` : ''}
            <h4 style="font-weight:700;font-size:1.1rem;margin-bottom:0.5rem">${escapeHtml(plan.name || '')}</h4>
            <p style="font-size:2.5rem;font-weight:800;margin-bottom:0.25rem">${escapeHtml(plan.price || '')}</p>
            <p style="font-size:0.8rem;opacity:0.7;margin-bottom:1.5rem">${escapeHtml(plan.period || '')}</p>
            <ul style="list-style:none;padding:0;text-align:left;margin-bottom:1.5rem">${(plan.features || []).map((f: string) => `<li style="padding:0.4rem 0;font-size:0.85rem;border-bottom:1px solid ${plan.popular ? 'rgba(255,255,255,0.1)' : tokens.colors.border}">✓ ${escapeHtml(f)}</li>`).join('')}</ul>
            <a href="#" style="display:block;padding:0.6rem;border-radius:${tokens.borderRadius};font-weight:600;font-size:0.85rem;text-decoration:none;background:${plan.popular ? '#fff' : tokens.colors.primary};color:${plan.popular ? tokens.colors.primary : '#fff'}">Get Started</a>
          </div>`).join('')}</div>`;
      case 'faq-item':
        return `<div class="gf-faq" style="margin-top:1.5rem;max-width:700px;margin-left:auto;margin-right:auto">${(props.items || []).map((item: any) => `
          <details style="background:${tokens.colors.surface};border-radius:${tokens.borderRadius};border:1px solid ${tokens.colors.border};padding:1rem 1.25rem;margin-bottom:0.5rem">
            <summary style="font-weight:600;color:${textColor};cursor:pointer;font-size:0.95rem">${escapeHtml(item.question || '')}</summary>
            <p style="margin-top:0.75rem;font-size:0.875rem;color:${textColor};opacity:0.75;line-height:1.7">${escapeHtml(item.answer || '')}</p>
          </details>`).join('')}</div>`;
      case 'form-field':
        return renderForm(project, tokens, textColor);
      default:
        return `<div style="padding:1rem;background:${tokens.colors.surfaceAlt};border-radius:${tokens.borderRadius};text-align:center;color:${tokens.colors.textMuted};font-size:0.85rem">[${type}]</div>`;
    }
  };

  const renderForm = (project: Project, tokens: DesignTokens, textColor: string): string => {
    const form = project.forms[0];
    if (!form) {
      return `<form class="gf-form" style="max-width:500px;margin-top:1rem"><div style="margin-bottom:0.75rem"><input type="text" placeholder="Your Name" required style="width:100%;padding:0.75rem;border-radius:${tokens.borderRadius};border:1px solid ${tokens.colors.border};font-size:0.9rem" /></div><div style="margin-bottom:0.75rem"><input type="email" placeholder="Your Email" required style="width:100%;padding:0.75rem;border-radius:${tokens.borderRadius};border:1px solid ${tokens.colors.border};font-size:0.9rem" /></div><div style="margin-bottom:0.75rem"><textarea placeholder="Your Message" rows="4" style="width:100%;padding:0.75rem;border-radius:${tokens.borderRadius};border:1px solid ${tokens.colors.border};font-size:0.9rem;resize:vertical"></textarea></div><button type="submit" style="padding:0.75rem 1.5rem;background:${tokens.colors.primary};color:#fff;border-radius:${tokens.borderRadius};font-weight:600;cursor:pointer;border:none;font-size:0.9rem">Send Message</button></form>`;
    }
    return `<form class="gf-form" style="max-width:500px;margin-top:1rem" action="${form.submitAction.endpoint || '#'}" method="POST">${form.fields.filter(f => f.type !== 'hidden').map(field => {
      const inputStyle = `width:100%;padding:0.75rem;border-radius:${tokens.borderRadius};border:1px solid ${tokens.colors.border};font-size:0.9rem`;
      let input = '';
      switch (field.type) {
        case 'textarea': input = `<textarea name="${field.label}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} rows="4" style="${inputStyle};resize:vertical"></textarea>`; break;
        case 'select': input = `<select name="${field.label}" ${field.required ? 'required' : ''} style="${inputStyle}"><option value="">Select...</option>${(field.options || []).map(o => `<option value="${o}">${o}</option>`).join('')}</select>`; break;
        case 'checkbox': input = `<div style="display:flex;flex-direction:column;gap:0.25rem">${(field.options || []).map(o => `<label style="display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;color:${textColor}"><input type="checkbox" name="${field.label}" value="${o}" /> ${o}</label>`).join('')}</div>`; break;
        case 'radio': input = `<div style="display:flex;flex-direction:column;gap:0.25rem">${(field.options || []).map(o => `<label style="display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;color:${textColor}"><input type="radio" name="${field.label}" value="${o}" /> ${o}</label>`).join('')}</div>`; break;
        default: input = `<input type="${field.type === 'phone' ? 'tel' : field.type}" name="${field.label}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} style="${inputStyle}" />`;
      }
      return `<div style="margin-bottom:0.75rem"><label style="display:block;font-size:0.875rem;font-weight:500;color:${textColor};margin-bottom:0.25rem">${escapeHtml(field.label)}${field.required ? ' <span style="color:red">*</span>' : ''}</label>${input}${field.helpText ? `<p style="font-size:0.75rem;color:${textColor};opacity:0.6;margin-top:0.25rem">${escapeHtml(field.helpText)}</p>` : ''}</div>`;
    }).join('')}<button type="submit" style="padding:0.75rem 1.5rem;background:${tokens.colors.primary};color:#fff;border-radius:${tokens.borderRadius};font-weight:600;cursor:pointer;border:none;font-size:0.9rem">Submit</button></form>`;
  };

  const renderSection = (section: Section): string => {
    const bgStyle = section.settings.background === 'gradient'
      ? `background:linear-gradient(135deg,${tokens.colors.primary},${tokens.colors.primaryDark});`
      : section.settings.backgroundImage
      ? `background-image:url(${section.settings.backgroundImage});background-size:cover;background-position:center;`
      : `background-color:${tokens.colors.background};`;
    const textColor = section.settings.background === 'gradient' ? '#ffffff' : tokens.colors.text;
    const animClass = section.animation?.type && section.animation.type !== 'none' ? ` gf-animate gf-animate-${section.animation.type}` : '';

    let content = '';
    section.rows.forEach(row => {
      content += `<div class="gf-row" style="display:flex;flex-wrap:wrap;gap:${row.gap || tokens.spacing.gap};align-items:${row.alignItems || 'stretch'}">`;
      row.columns.forEach(col => {
        content += `<div class="gf-col" style="width:${col.width}%;min-width:250px;flex:1">`;
        col.components.forEach(comp => {
          content += renderComponent(comp, tokens, textColor);
        });
        content += '</div>';
      });
      content += '</div>';
    });

    return `<section class="gf-section${animClass}" style="${bgStyle}padding:${section.settings.padding || '3rem 1.5rem'};text-align:${section.settings.textAlign || 'left'}"><div class="gf-container" style="max-width:${section.settings.fullWidth ? '100%' : tokens.spacing.container};margin:0 auto">${content}</div></section>`;
  };

  const generateAnalytics = (): string => {
    const scripts: string[] = [];
    if (project.analytics.googleAnalyticsId) {
      scripts.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${project.analytics.googleAnalyticsId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${project.analytics.googleAnalyticsId}');</script>`);
    }
    if (project.analytics.googleTagManagerId) {
      scripts.push(`<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${project.analytics.googleTagManagerId}');</script>`);
    }
    if (project.analytics.customScripts) {
      scripts.push(project.analytics.customScripts);
    }
    return scripts.join('\n');
  };

  const renderPage = (page: Page): string => {
    const sections = page.sections.map(renderSection).join('\n    ');
    const canonicalUrl = project.domain ? `https://${project.domain}/${page.slug === 'home' ? '' : page.slug}` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.seo.title || page.title + ' | ' + project.seo.siteTitle)}</title>
  <meta name="description" content="${escapeHtml(page.seo.description || project.seo.description)}">
  ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}">` : ''}
  ${page.seo.ogTitle ? `<meta property="og:title" content="${escapeHtml(page.seo.ogTitle)}">` : ''}
  ${page.seo.ogDescription ? `<meta property="og:description" content="${escapeHtml(page.seo.ogDescription)}">` : ''}
  ${page.seo.robots ? `<meta name="robots" content="${page.seo.robots}">` : ''}
  <meta name="generator" content="GREENFIELD Website Factory">
  ${generateAnalytics()}
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:${tokens.typography.bodyFont};color:${tokens.colors.text};line-height:${tokens.typography.lineHeight};background:${tokens.colors.background}}
    a{color:inherit;text-decoration:none}
    img{max-width:100%;height:auto}
    .gf-header{background:${tokens.colors.background};border-bottom:1px solid ${tokens.colors.border};padding:1rem 1.5rem;position:sticky;top:0;z-index:100}
    .gf-header-inner{max-width:${tokens.spacing.container};margin:0 auto;display:flex;align-items:center;justify-content:space-between}
    .gf-logo{font-weight:700;font-size:1.25rem;color:${tokens.colors.primary}}
    .gf-nav ul{display:flex;gap:1.5rem;list-style:none;align-items:center}
    .gf-nav a{font-size:0.875rem;font-weight:500;color:${tokens.colors.text};transition:color 0.2s}
    .gf-nav a:hover{color:${tokens.colors.primary}}
    .gf-nav .has-children{position:relative}
    .gf-nav .submenu{display:none;position:absolute;top:100%;left:0;background:${tokens.colors.background};border:1px solid ${tokens.colors.border};border-radius:${tokens.borderRadius};padding:0.5rem 0;min-width:180px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)}
    .gf-nav .has-children:hover .submenu{display:block}
    .gf-nav .submenu li{padding:0}
    .gf-nav .submenu a{display:block;padding:0.5rem 1rem;font-size:0.8rem}
    .gf-footer{background:${tokens.colors.surface};border-top:1px solid ${tokens.colors.border};padding:3rem 1.5rem 1.5rem}
    .gf-footer-inner{max-width:${tokens.spacing.container};margin:0 auto}
    .gf-footer-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;margin-bottom:2rem}
    .gf-footer-bottom{border-top:1px solid ${tokens.colors.border};padding-top:1rem;text-align:center}
    .gf-footer-bottom p{font-size:0.75rem;color:${tokens.colors.textMuted}}
    .gf-animate{opacity:0;transform:translateY(20px);transition:opacity 0.6s ease,transform 0.6s ease}
    .gf-animate.gf-visible{opacity:1;transform:translateY(0)}
    .mobile-toggle{display:none;background:none;border:none;cursor:pointer;padding:0.5rem}
    @media(max-width:768px){
      .gf-nav{display:none}
      .gf-nav.open{display:block;position:absolute;top:100%;left:0;right:0;background:${tokens.colors.background};padding:1rem;border-bottom:1px solid ${tokens.colors.border}}
      .gf-nav.open ul{flex-direction:column;gap:0.5rem}
      .gf-nav .submenu{position:static;box-shadow:none;border:none;padding-left:1rem}
      .mobile-toggle{display:block}
      .gf-row>div{width:100%!important;min-width:100%!important}
      .gf-cards,.gf-testimonials,.gf-team,.gf-pricing,.gf-stats{grid-template-columns:1fr!important}
    }
  </style>
</head>
<body>
  <header class="gf-header">
    <div class="gf-header-inner">
      <a href="/index.html" class="gf-logo">${escapeHtml(project.seo.siteTitle || project.name)}</a>
      <nav class="gf-nav" id="mainNav">
        <ul>${primaryMenu ? renderMenuItems(primaryMenu.items) : ''}</ul>
      </nav>
      <button class="mobile-toggle" onclick="document.getElementById('mainNav').classList.toggle('open')" aria-label="Toggle menu">☰</button>
    </div>
  </header>

  <main>
    ${sections}
  </main>

  <footer class="gf-footer">
    <div class="gf-footer-inner">
      <div class="gf-footer-grid">
        <div>
          <h4 style="font-weight:700;color:${tokens.colors.text};margin-bottom:0.5rem">${escapeHtml(project.seo.siteTitle || project.name)}</h4>
          <p style="font-size:0.8rem;color:${tokens.colors.textMuted}">${escapeHtml(project.seo.description)}</p>
          ${project.seo.phone ? `<p style="font-size:0.8rem;color:${tokens.colors.textMuted};margin-top:0.5rem">📞 ${escapeHtml(project.seo.phone)}</p>` : ''}
          ${project.seo.email ? `<p style="font-size:0.8rem;color:${tokens.colors.textMuted}">✉️ ${escapeHtml(project.seo.email)}</p>` : ''}
        </div>
        <div>
          <h4 style="font-weight:600;color:${tokens.colors.text};margin-bottom:0.5rem;font-size:0.875rem">Quick Links</h4>
          <ul style="list-style:none">${footerMenu ? renderMenuItems(footerMenu.items, true) : ''}</ul>
        </div>
        ${project.seo.location ? `<div><h4 style="font-weight:600;color:${tokens.colors.text};margin-bottom:0.5rem;font-size:0.875rem">Location</h4><p style="font-size:0.8rem;color:${tokens.colors.textMuted}">${escapeHtml(project.seo.location)}</p></div>` : ''}
      </div>
      <div class="gf-footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${escapeHtml(project.seo.siteTitle || project.name)}. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script>
    // Animation on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('gf-visible');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.gf-animate').forEach(el => observer.observe(el));
  </script>
</body>
</html>`;
  };

  // Generate all pages
  pages.forEach(page => {
    const filename = page.slug === 'home' ? 'index.html' : `${page.slug}.html`;
    files[filename] = renderPage(page);
  });

  // Generate sitemap.xml
  files['sitemap.xml'] = generateSitemap(project, pages);

  // Generate robots.txt
  files['robots.txt'] = `User-agent: *
Allow: /
${project.domain ? `Sitemap: https://${project.domain}/sitemap.xml` : ''}
`;

  return files;
}

function generateSitemap(project: Project, pages: Page[]): string {
  const baseUrl = project.domain ? `https://${project.domain}` : 'https://example.com';
  const urls = pages.map(p => `  <url>
    <loc>${baseUrl}/${p.slug === 'home' ? '' : p.slug}</loc>
    <lastmod>${new Date(project.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.type === 'home' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// Generate Laravel project structure
export function generateLaravelProject(project: Project): Record<string, string> {
  const tokens = getThemeTokens(project.themeId, project.themeVariant);
  const files: Record<string, string> = {};

  // composer.json
  files['composer.json'] = JSON.stringify({
    name: `greenfield/${project.name.toLowerCase().replace(/\s+/g, '-')}`,
    description: project.description,
    type: 'project',
    require: {
      php: '^8.3',
      'laravel/framework': '^12.0',
    },
    autoload: { psr_4: { 'App\\': 'app/' } },
  }, null, 2);

  // .env.example
  files['.env.example'] = `APP_NAME="${project.seo.siteTitle || project.name}"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=${project.domain ? `https://${project.domain}` : 'http://localhost'}

LOG_CHANNEL=stack

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=${project.name.toLowerCase().replace(/\s+/g, '_')}
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
`;

  // routes/web.php
  const routes = project.pages.filter(p => p.status === 'published').map(p => {
    const method = p.slug === 'home' ? "Route::get('/'," : `Route::get('/${p.slug}',`;
    const controller = p.slug === 'home' ? 'HomeController' : `${p.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Controller`;
    return `    ${method} [${controller}::class, 'index'])->name('${p.slug}');`;
  }).join('\n');

  files['routes/web.php'] = `<?php

use Illuminate\\Support\\Facades\\Route;

/*
|--------------------------------------------------------------------------
| ${project.name} - Generated by GREENFIELD Website Factory
|--------------------------------------------------------------------------
*/

${routes}
`;

  // Main layout
  files['resources/views/layouts/app.blade.php'] = generateBladeLayout(project, tokens);

  // Page views
  project.pages.filter(p => p.status === 'published').forEach(page => {
    const viewName = page.slug === 'home' ? 'home' : page.slug.replace(/-/g, '.');
    files[`resources/views/pages/${viewName}.blade.php`] = generateBladePage(page, project, tokens);
  });

  // package.json
  files['package.json'] = JSON.stringify({
    private: true,
    scripts: {
      dev: 'vite',
      build: 'vite build',
    },
    devDependencies: {
      'laravel-vite-plugin': '^1.0.0',
      vite: '^5.0.0',
    },
  }, null, 2);

  // vite.config.js
  files['vite.config.js'] = `import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.js'],
      refresh: true,
    }),
  ],
});`;

  // README
  files['README.md'] = `# ${project.name}

Generated by GREENFIELD Website Factory

## Requirements
- PHP 8.3+
- Composer
- Node.js 18+

## Setup
\`\`\`bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan serve
\`\`\`

## Pages
${project.pages.filter(p => p.status === 'published').map(p => `- ${p.title} (/${p.slug === 'home' ? '' : p.slug})`).join('\n')}
`;

  return files;
}

function generateBladeLayout(project: Project, tokens: DesignTokens): string {
  const primaryMenu = project.menus.find(m => m.location === 'primary');
  const menuItems = primaryMenu?.items.filter(i => i.enabled).map(item => {
    const page = item.pageId ? project.pages.find(p => p.id === item.pageId) : null;
    const route = page ? (page.slug === 'home' ? "route('home')" : `route('${page.slug}')`) : "'#'";
    return `<li><a href="{{ ${route} }}">{{ '${item.label}' }}</a></li>`;
  }).join('\n                    ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', '${project.seo.siteTitle}')</title>
    <meta name="description" content="@yield('description', '${project.seo.description}')">
    <meta name="generator" content="GREENFIELD Website Factory">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @yield('head')
</head>
<body>
    <header style="background:${tokens.colors.background};border-bottom:1px solid ${tokens.colors.border};padding:1rem 1.5rem">
        <div style="max-width:${tokens.spacing.container};margin:0 auto;display:flex;align-items:center;justify-content:space-between">
            <a href="{{ route('home') }}" style="font-weight:700;font-size:1.25rem;color:${tokens.colors.primary}">
                ${project.seo.siteTitle || project.name}
            </a>
            <nav>
                <ul style="display:flex;gap:1.5rem;list-style:none">
                    ${menuItems || '<li><a href="/">Home</a></li>'}
                </ul>
            </nav>
        </div>
    </header>

    <main>
        @yield('content')
    </main>

    <footer style="background:${tokens.colors.surface};border-top:1px solid ${tokens.colors.border};padding:2rem 1.5rem;text-align:center">
        <p style="font-size:0.8rem;color:${tokens.colors.textMuted}">&copy; {{ date('Y') }} ${project.seo.siteTitle || project.name}. All rights reserved.</p>
    </footer>
</body>
</html>`;
}

function generateBladePage(page: Page, project: Project, tokens: DesignTokens): string {
  return `@extends('layouts.app')

@section('title', '${page.seo.title || page.title}')
@section('description', '${page.seo.description || ''}')

@section('content')
    @foreach($sections ?? [] as $section)
        @include('components.sections.' . $section['type'], ['section' => $section])
    @endforeach
@endsection
`;
}

// Generate React project structure
export function generateReactProject(project: Project): Record<string, string> {
  const tokens = getThemeTokens(project.themeId, project.themeVariant);
  const files: Record<string, string> = {};

  // package.json
  files['package.json'] = JSON.stringify({
    name: project.name.toLowerCase().replace(/\s+/g, '-'),
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
      server: 'node server/index.js',
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.8.0',
      express: '^4.18.0',
    },
    devDependencies: {
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      '@vitejs/plugin-react': '^4.0.0',
      typescript: '^5.0.0',
      vite: '^5.0.0',
    },
  }, null, 2);

  // App.tsx
  const routes = project.pages.filter(p => p.status === 'published').map(p => {
    const componentName = p.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Page';
    const path = p.slug === 'home' ? '/' : `/${p.slug}`;
    return `    <Route path="${path}" element={<${componentName} />} />`;
  }).join('\n');

  files['src/App.tsx'] = `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
${project.pages.filter(p => p.status === 'published').map(p => {
  const componentName = p.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Page';
  return `import { ${componentName} } from './pages/${componentName}';`;
}).join('\n')}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
${routes}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
`;

  // Theme tokens
  files['src/theme/tokens.ts'] = `export const tokens = ${JSON.stringify(tokens, null, 2)};
`;

  // Layout component
  files['src/components/Layout.tsx'] = `import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { tokens } from '../theme/tokens';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header style={{ background: tokens.colors.background, borderBottom: \`1px solid \${tokens.colors.border}\`, padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '${tokens.spacing.container}', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontWeight: 700, fontSize: '1.25rem', color: tokens.colors.primary }}>
            ${project.seo.siteTitle || project.name}
          </Link>
          <nav>
            <ul style={{ display: 'flex', gap: '1.5rem', listStyle: 'none' }}>
              ${project.menus.find(m => m.location === 'primary')?.items.filter(i => i.enabled).map(item => {
                const page = item.pageId ? project.pages.find(p => p.id === item.pageId) : null;
                const path = page ? (page.slug === 'home' ? '/' : `/${page.slug}`) : '#';
                return `<li><Link to="${path}" style={{ fontSize: '0.875rem', fontWeight: 500, color: tokens.colors.text }}>{item.label}</Link></li>`;
              }).join('\n              ') || ''}
            </ul>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer style={{ background: tokens.colors.surface, borderTop: \`1px solid \${tokens.colors.border}\`, padding: '2rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: tokens.colors.textMuted }}>&copy; {new Date().getFullYear()} ${project.seo.siteTitle || project.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
`;

  // Server
  files['server/index.js'] = `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;

  // README
  files['README.md'] = `# ${project.name}

Generated by GREENFIELD Website Factory

## Tech Stack
- React 18 + TypeScript
- Vite
- React Router
- Express (production server)

## Development
\`\`\`bash
npm install
npm run dev
\`\`\`

## Production
\`\`\`bash
npm run build
npm run server
\`\`\`

## Pages
${project.pages.filter(p => p.status === 'published').map(p => `- ${p.title} → /${p.slug === 'home' ? '' : p.slug}`).join('\n')}
`;

  return files;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Generate ZIP file from exported files
export async function generateZip(files: Record<string, string>, projectName: string): Promise<Blob> {
  const zip = new JSZip();

  // Add all files to the ZIP
  Object.entries(files).forEach(([path, content]) => {
    zip.file(path, content);
  });

  // Generate the ZIP blob
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  return blob;
}

// Download ZIP file
export function downloadZip(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
