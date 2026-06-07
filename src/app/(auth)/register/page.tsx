import type { Metadata } from 'next';
import { RegisterForm } from '@/components/forms/register-form';

// Prevent static generation since this page uses client-side hooks
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Register - PayNaiDee',
    description: 'Create a PayNaiDee account to manage and split expenses with friends',
};

/**
 * Register Page
 * Displays the registration form for user account creation
 */
export default function RegisterPage() {
    return (
        <div className="space-y-6">
            <RegisterForm />
        </div>
    );
}
