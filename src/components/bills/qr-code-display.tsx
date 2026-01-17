'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useTranslation } from '@/lib/i18n';
import { Spinner } from '@/components/ui/spinner';
import { formatThaiCurrency } from '@/lib/utils/currency';

interface QRCodeDisplayProps {
    qrData: string;
    amount: number;
    header?: string;
    className?: string;
}

/**
 * QRCodeDisplay Component
 * Renders PromptPay-compatible QR codes for payments
 * Uses qrcode library to generate QR code canvas
 * _Requirements: 6.1, 6.2, 6.3_
 */
export function QRCodeDisplay({ qrData, amount, header, className }: QRCodeDisplayProps) {
    const t = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateQRCode = async () => {
            if (!canvasRef.current || !qrData) {
                return;
            }

            setIsGenerating(true);
            setError(null);

            try {
                await QRCode.toCanvas(canvasRef.current, qrData, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                    errorCorrectionLevel: 'M',
                });
            } catch (err) {
                console.error('QR Code generation error:', err);
                setError(t('errors.qrCodeGenerationFailed'));
            } finally {
                setIsGenerating(false);
            }
        };

        generateQRCode();
    }, [qrData, t]);

    return (
        <div className={`flex flex-col items-center ${className || ''}`}>
            {/* Header */}
            {header && (
                <div className="text-center mb-2">
                    <p className="text-sm font-medium text-muted-foreground">{header}</p>
                </div>
            )}

            {/* QR Code Canvas */}
            <div className="relative bg-white rounded-lg p-4 shadow-sm border border-border">
                {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                        <Spinner size="lg" />
                    </div>
                )}

                {error && (
                    <div className="text-center text-destructive text-sm p-8">
                        {error}
                    </div>
                )}

                <canvas
                    ref={canvasRef}
                    className={error ? 'hidden' : ''}
                />
            </div>

            {/* Amount Display */}
            <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                    {t('bills.scanToPay').replace('{{amount}}', formatThaiCurrency(amount))}
                </p>
                <p className="text-2xl font-bold text-primary">
                    {formatThaiCurrency(amount)}
                </p>
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center max-w-sm">
                <p className="text-xs text-muted-foreground">
                    {t('bills.qrInstructions')}
                </p>
            </div>
        </div>
    );
}

export default QRCodeDisplay;
