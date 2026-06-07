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
            <LoginForm />
        </div>
    );
}
