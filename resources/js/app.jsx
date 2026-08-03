import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Without this, a failed page visit (validation error aside — those are
// handled separately by Inertia) fails silently: the progress bar finishes
// but nothing else happens, which looks exactly like a page stuck loading.
// Log it and surface something visible so it's obvious a request failed
// rather than just never finishing.
router.on('error', (event) => {
    console.error('Inertia request failed:', event.detail.errors);
});

router.on('invalid', (event) => {
    console.error('Inertia received a non-Inertia response (likely a server error page):', event.detail.response?.status);
});

router.on('exception', (event) => {
    console.error('Inertia request threw an exception:', event.detail.exception);
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
