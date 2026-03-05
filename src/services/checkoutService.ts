import { pool } from '../database.js';
import { getSatsFromBIF } from './price.js';
import crypto from 'crypto';

export async function initiateAfripayPurchase(amountBif: number, lnAddress: string, userId: string) {
    const satsToReceive = await getSatsFromBIF(amountBif);
    const clientToken = crypto.randomBytes(12).toString('hex');

    // Sauvegarde en DB (On garde l'adresse lightning pour le webhook plus tard)
    await pool.query(
        "INSERT INTO transactions (lumicash_txid, phone_number, amount_fbu, sats_sent, status) VALUES ($1, $2, $3, $4, $5)",
        [clientToken, lnAddress, amountBif, satsToReceive, 'PENDING']
    );

    const params = new URLSearchParams({
        amount: amountBif.toString(),
        currency: "BIF",
        comment: `Achat de ${satsToReceive} sats`,
        client_token: clientToken,
        // ICI : On s'assure que return_url n'est pas vide
        return_url: process.env.AFRIPAY_RETURN_URL || "http://localhost:3000/payment-callback",
        app_id: process.env.AFRIPAY_ID || "",
        app_secret: process.env.AFRIPAY_SECRET || ""
    });

    return `https://www.afripay.africa/checkout/index.php?${params.toString()}`;
}