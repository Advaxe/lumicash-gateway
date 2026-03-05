// src/services/tradeService.ts
import { pool } from '../database.js';
import { sendLightning } from './lightning.js';
import { getSatsFromBIF } from './price.js';

export async function processLumicashPurchase(txid: string, phone: string, amountFbu: number, lnAddress: string) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Protection contre le double-paiement
        const exists = await client.query('SELECT id FROM transactions WHERE lumicash_txid = $1', [txid]);
        if (exists.rowCount > 0) {
            console.log("Transaction déjà traitée.");
            return;
        }

        // 2. Enregistrer l'intention de transaction
        await client.query(
            'INSERT INTO transactions (lumicash_txid, phone_number, amount_fbu, status) VALUES ($1, $2, $3, $4)',
            [txid, phone, amountFbu, 'PROCESSING']
        );

        // --- CALCUL DES FRAIS ---
        
        // A. Ce que Lumicash nous laisse réellement (96%)
        const netAmountAfterLumicash = amountFbu * 0.96; 

        // B. On calcule combien de Sats valent ces FBU nets via l'API Blink
        const totalSatsAvailable = await getSatsFromBIF(netAmountAfterLumicash);

        // C. On applique tes frais de service de 2% (l'utilisateur reçoit 98% des sats nets)
        const satsToSend = Math.floor(totalSatsAvailable * 0.98);

        console.log(`Calcul : Brut ${amountFbu} FBU -> Net ${netAmountAfterLumicash} FBU -> Sats ${satsToSend}`);

        // 3. Envoi des Bitcoins via Blink
        try {
            await sendLightning(lnAddress, satsToSend);

            // 4. Succès : Mise à jour de la DB
            await client.query(
                'UPDATE transactions SET status = $1, sats_sent = $2 WHERE lumicash_txid = $3',
                ['COMPLETED', satsToSend, txid]
            );

            await client.query('COMMIT');
            console.log(`Succès: ${satsToSend} sats envoyés au ${phone}`);

        } catch (error) {
            // Échec de l'envoi Lightning : On marque FAILED pour gestion manuelle sans annuler le log DB
            await client.query('UPDATE transactions SET status = $1 WHERE lumicash_txid = $2', ['FAILED', txid]);
            await client.query('COMMIT'); 
            throw error;
        }

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erreur critique, transaction annulée en DB:", error);
    } finally {
        client.release();
    }
}