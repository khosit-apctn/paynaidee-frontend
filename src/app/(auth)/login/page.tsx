import Link from 'next/link';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/forms/login-form';

// Prevent static generation since this page uses client-side hooks
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Login - PayNaiDee',
    description: 'Login to your PayNaiDee account to manage shared expenses',
};

/**
 * Login Page
 * Displays the login form for user authentication
 */
export default function LoginPage() {
    return (
        <div className="space-y-6">
            {/* Card */}
            <div className="rounded-2xl bg-card border border-border p-6 shadow-xl">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Sign in to your account
                    </p>
                </div>

                <LoginForm />

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">
                        Don&apos;t have an account?{' '}
                    </span>
                    <Link
                        href="/register"
                        className="font-medium text-primary hover:text-primary-600 transition-colors"
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
