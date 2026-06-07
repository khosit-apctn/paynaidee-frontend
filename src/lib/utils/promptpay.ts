/**
 * PromptPay QR payload generator in TypeScript
 * Replicates the exact EMVCo standard and CRC16 logic from the backend
 */

function calculateCRC16(data: string): string {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ polynomial;
            } else {
                crc = crc << 1;
            }
        }
    }
    crc &= 0xFFFF;
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTLV(tag: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return `${tag}${length}${value}`;
}

/**
 * Generates PromptPay EMV QR payload string
 * @param phoneOrNationalId Thai phone number (10-digit starting with 0, or E.164) or National ID (13-digit)
 * @param amount Amount to pay (0 or negative represents static QR without amount)
 * @param header Custom reference description (max 25 characters)
 */
export function generatePromptPayPayload(phoneOrNationalId: string, amount: number, header?: string): string {
    // Remove non-digit characters
    let digits = phoneOrNationalId.replace(/\D/g, '');

    // Normalize E.164 Thai numbers (e.g. 66812345678 or +66812345678)
    if ((phoneOrNationalId.startsWith('+66') || phoneOrNationalId.startsWith('66')) && digits.length === 11 && digits.startsWith('66')) {
        digits = '0' + digits.slice(2);
    }

    let formattedID = '';
    if (digits.length === 10 && digits.startsWith('0')) {
        formattedID = '0066' + digits.slice(1);
    } else if (digits.length === 13) {
        formattedID = digits;
    } else {
        throw new Error('เบอร์โทรศัพท์หรือเลขบัตรประชาชนสำหรับ PromptPay ไม่ถูกต้อง');
    }

    let qrData = '';

    // Payload Format Indicator (00)
    qrData += formatTLV('00', '01');

    // Point of Initiation Method (01)
    if (amount > 0) {
        qrData += formatTLV('01', '12'); // Dynamic
    } else {
        qrData += formatTLV('01', '11'); // Static
    }

    // Merchant Account Information (29)
    let merchantInfo = '';
    merchantInfo += formatTLV('00', 'A000000677010111');
    if (formattedID.startsWith('0066')) {
        merchantInfo += formatTLV('01', formattedID);
    } else {
        merchantInfo += formatTLV('02', formattedID);
    }
    qrData += formatTLV('29', merchantInfo);

    // Transaction Currency (53): 764 for THB
    qrData += formatTLV('53', '764');

    // Transaction Amount (54)
    if (amount > 0) {
        let amountStr = amount.toFixed(2);
        if (amountStr.endsWith('.00')) {
            amountStr = amountStr.slice(0, -3);
        } else if (amountStr.endsWith('0')) {
            amountStr = amountStr.slice(0, -1);
        }
        qrData += formatTLV('54', amountStr);
    }

    // Country Code (58)
    qrData += formatTLV('58', 'TH');

    // Additional Data Field Template (62)
    if (header) {
        const slicedHeader = header.slice(0, 25);
        const additionalData = formatTLV('01', slicedHeader);
        qrData += formatTLV('62', additionalData);
    }

    // CRC (63)
    const qrDataWithoutCRC = qrData + '6304';
    const crc = calculateCRC16(qrDataWithoutCRC);
    qrData += `6304${crc}`;

    return qrData;
}
