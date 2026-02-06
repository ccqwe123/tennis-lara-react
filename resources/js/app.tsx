import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Toaster } from 'sonner';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        // Try .tsx first, then fall back to .jsx
        const pages = import.meta.glob<any>('./Pages/**/*.tsx');
        const jsxPages = import.meta.glob<any>('./Pages/**/*.jsx');

        const tsxPath = `./Pages/${name}.tsx`;
        const jsxPath = `./Pages/${name}.jsx`;

        if (pages[tsxPath]) {
            return resolvePageComponent(tsxPath, pages);
        }
        return resolvePageComponent(jsxPath, jsxPages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster position="top-right" richColors closeButton />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
