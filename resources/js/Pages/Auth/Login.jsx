import GuestLayout from '@/Layouts/GuestLayout';
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
        <GuestLayout>
            <Head title="Sign in" />
            <h2>Welcome back.</h2>
            <p>Sign in to your hospitality workspace.</p>
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
                        className="mt-1.5 w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-brass-500 focus:ring-brass-500"
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
                        className="mt-1.5 w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-brass-500 focus:ring-brass-500"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-brass-600"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        Remember me
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-brass-600 py-3 text-sm font-semibold text-white shadow hover:bg-brass-700 disabled:opacity-60"
                >
                    {processing ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </GuestLayout>
    );
}
