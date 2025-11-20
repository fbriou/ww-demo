import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const pages = {"products":{"outputDir":"./products","lang":"en","title":"List of product","cacheVersion":7,"meta":[{"name":"title","content":"List of product"},{"name":"description","content":"This is a description for the page that list products "},{"itemprop":"name","content":"List of product"},{"itemprop":"description","content":"This is a description for the page that list products "},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"List of product"},{"name":"twitter:description","content":"This is a description for the page that list products "},{"property":"og:title","content":"List of product"},{"property":"og:description","content":"This is a description for the page that list products "},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://0f9a166f-0697-493d-a7d2-0f31ad891fa9.weweb-preview.io/products/"},{"rel":"alternate","hreflang":"en","href":"https://0f9a166f-0697-493d-a7d2-0f31ad891fa9.weweb-preview.io/products/"}]},"product/:param/details":{"outputDir":"./product/:param/details","lang":"en","title":"Detailed page for one product","cacheVersion":7,"meta":[{"name":"title","content":"Detailed page for one product"},{"name":"description","content":"Description for product detailed page"},{"itemprop":"name","content":"Detailed page for one product"},{"itemprop":"description","content":"Description for product detailed page"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"Detailed page for one product"},{"name":"twitter:description","content":"Description for product detailed page"},{"property":"og:title","content":"Detailed page for one product"},{"property":"og:description","content":"Description for product detailed page"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://0f9a166f-0697-493d-a7d2-0f31ad891fa9.weweb-preview.io/product/:param/details/"},{"rel":"alternate","hreflang":"en","href":"https://0f9a166f-0697-493d-a7d2-0f31ad891fa9.weweb-preview.io/product/:param/details/"}]},"index":{"outputDir":"./","lang":"en","title":"","cacheVersion":7,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://0f9a166f-0697-493d-a7d2-0f31ad891fa9.weweb-preview.io/"},{"rel":"alternate","hreflang":"en","href":"https://0f9a166f-0697-493d-a7d2-0f31ad891fa9.weweb-preview.io/"}]},"product/:param":{"outputDir":"./product/:param","lang":"en","title":"","cacheVersion":7,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://0f9a166f-0697-493d-a7d2-0f31ad891fa9.weweb-preview.io/product/:param/"},{"rel":"alternate","hreflang":"en","href":"https://0f9a166f-0697-493d-a7d2-0f31ad891fa9.weweb-preview.io/product/:param/"}]}};

// Read the main HTML template
const template = fs.readFileSync(path.resolve(__dirname, 'template.html'), 'utf-8');
const compiledTemplate = handlebars.compile(template);

// Generate an HTML file for each page with its metadata
Object.values(pages).forEach(pageConfig => {
    // Compile the template with page metadata
    const html = compiledTemplate({
        title: pageConfig.title,
        lang: pageConfig.lang,
        meta: pageConfig.meta,
        scripts: {
            head: pageConfig.scripts.head,
            body: pageConfig.scripts.body,
        },
        alternateLinks: pageConfig.alternateLinks,
        cacheVersion: pageConfig.cacheVersion,
        baseTag: pageConfig.baseTag,
    });

    // Save output html for each page
    if (!fs.existsSync(pageConfig.outputDir)) {
        fs.mkdirSync(pageConfig.outputDir, { recursive: true });
    }
    fs.writeFileSync(`${pageConfig.outputDir}/index.html`, html);
});

const rollupOptionsInput = {};
for (const pageName in pages) {
    rollupOptionsInput[pageName] = path.resolve(__dirname, pages[pageName].outputDir, 'index.html');
}

export default defineConfig(() => {
    return {
        plugins: [nodePolyfills({ include: ['events', 'stream', 'string_decoder'] }), vue()],
        base: "/",
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                },
            },
            postcss: {
                plugins: [autoprefixer],
            },
        },
        build: {
            chunkSizeWarningLimit: 10000,
            rollupOptions: {
                input: rollupOptionsInput,
                onwarn: (entry, next) => {
                    if (entry.loc?.file && /js$/.test(entry.loc.file) && /Use of eval in/.test(entry.message)) return;
                    return next(entry);
                },
                maxParallelFileOps: 900,
            },
        },
        logLevel: 'warn',
    };
});
