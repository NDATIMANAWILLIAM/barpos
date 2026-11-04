import { getRestaurantName } from '@/utils/branding';
import { Link, usePage } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const businessName = getRestaurantName(usePage().props.business);
    return (
        <div className="auth-layout">
            <aside className="auth-story">
                <Link href="/" className="auth-brand"><img src="/images/logo.jpeg" alt="" /><span>{businessName}</span></Link>
                <div>
                    <p className="ui-eyebrow">Staff workspace</p>
                    <h1>{businessName}</h1>
                    <p>Your tables, your team, and every guest.<br />One place to keep the day moving.</p>
                </div>
                <span className="auth-story-footer">Restaurant management</span>
            </aside>
            <main className="auth-main">
                <Link href="/" className="auth-back">Back to the menu</Link>
                <div className="auth-form-card">
                    <p className="ui-eyebrow">{businessName} / Staff access</p>
                    {children}
                </div>
                <p className="auth-footer">A little more care. Every service.</p>
            </main>
        </div>
    );
}
