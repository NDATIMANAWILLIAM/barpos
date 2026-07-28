import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email:    '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
            <Head title="Sign in" />

            <div className="w-full max-w-sm">
                {/* Logo / Brand */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg">
                        <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Isaro Rubengera</h1>
                    <p className="mt-1 text-sm text-gray-400">Sign in to your account</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl bg-white p-8 shadow-2xl">
                    {status && (
                        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="username"
                                autoFocus
                                className="mt-1.5 w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="admin@barpos.rw"
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                className="mt-1.5 w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {processing ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-gray-500">
                    Isaro Rubengera — Bar &amp; Lodge Management System
                </p>
            </div>
        </div>
    );
}
