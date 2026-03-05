import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './database.js';
import { initiateAfripayPurchase } from './services/checkoutService.js';
import { sendLightning } from './services/lightning.js';
import axios from 'axios';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

/**
 * MIDDLEWARES
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

/**
 * ROUTE 1 : INITIATION D'ACHAT (Ton Formulaire)
 */
app.post('/buy-sats', async (req: Request, res: Response) => {
    const { amount, lnAddress } = req.body;
    const userId = "USER_123"; 

    try {
        console.log(`[Checkout] Initiation: ${amount} BIF pour ${lnAddress}`);
        const checkoutUrl = await initiateAfripayPurchase(Number(amount), lnAddress, userId);
        res.redirect(checkoutUrl);
    } catch (error) {
        console.error("Erreur initiation:", error);
        res.status(500).send("Erreur lors de la préparation du paiement.");
    }
});

/**
 * ROUTE 2 : PAGE DE RETOUR (Polling & Instructions)
 * L'utilisateur attend ici pendant qu'il valide sur son téléphone
 */
app.get('/payment-callback', (req: Request, res: Response) => {
    // On sert la page qui contient le script de Polling (setInterval)
    res.sendFile(path.join(__dirname, '../public/pending_view.html'));
});

/**
 * ROUTE 3 : CONFIRMATION DE MYSATOSHIS (Le Hub)
 * C'est cette route qui déclenche l'envoi des Bitcoins
 */
app.post('/confirm-from-mysatoshis', async (req: Request, res: Response) => {
    const { STATUS, CLIENT_TOKEN } = req.body;

    console.log(`[Hub Callback] Token: ${CLIENT_TOKEN}, Status: ${STATUS}`);

    try {
        if (STATUS === "1" || STATUS === 1) {
            // 1. Récupérer les infos de la transaction avant de mettre à jour
            const checkTx = await pool.query(
                "SELECT * FROM transactions WHERE lumicash_txid = $1 AND status = 'PENDING'",
                [CLIENT_TOKEN]
            );

            if (checkTx.rows.length > 0) {
                const tx = checkTx.rows[0];
                const lnAddress = tx.phone_number; // On a stocké l'adresse LN ici
                const sats = tx.sats_sent;

                // 2. ENVOI RÉEL DES BITCOINS VIA BLINK
                console.log(`[Blink] Envoi de ${sats} sats à ${lnAddress}...`);
                await sendLightning(lnAddress, sats);

                // 3. Mise à jour du statut en base
                await pool.query(
                    "UPDATE transactions SET status = 'COMPLETED', updated_at = NOW() WHERE lumicash_txid = $1",
                    [CLIENT_TOKEN]
                );

                return res.status(200).json({ success: true, message: "Sats envoyés et DB mise à jour" });
            }
        }
        
        res.status(404).json({ success: false, message: "Transaction non trouvée ou déjà traitée" });

    } catch (error) {
        console.error("Erreur lors du traitement final:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});

/**
 * ROUTE 4 : API DE POLLING (Pour ton Frontend)
 */
app.get('/api/check-status/:token', async (req: Request, res: Response) => {
    const { token } = req.params;
    try {
        const result = await pool.query(
            "SELECT status FROM transactions WHERE lumicash_txid = $1", 
            [token]
        );
        res.json({ status: result.rows.length > 0 ? result.rows[0].status : 'NOT_FOUND' });
    } catch (error) {
        res.status(500).json({ error: "Erreur DB" });
    }
});

// Route temporaire à appeler une seule fois
// ROUTE TEMPORAIRE DE DEBUG
app.get('/debug/blink-wallet', async (req: Request, res: Response) => {
    const apiKey = process.env.BLINK_API_KEY;
    const username = "mysatoshis"; 

    console.log("[Debug] Tentative de récupération du Wallet ID pour:", username);

    const query = `
        query accountDefaultWallet($username: Username!) {
            accountDefaultWallet(username: $username) {
                id
                walletCurrency
            }
        }
    `;

    try {
        const response = await axios.post('https://api.blink.sv/graphql', 
            { query, variables: { username } },
            { headers: { 'X-API-KEY': apiKey } }
        );
        
        const wallet = response.data?.data?.accountDefaultWallet;
        
        if (wallet) {
            console.log("\n--- TON WALLET ID BLINK ---");
            console.log(wallet.id);
            console.log("---------------------------\n");
            res.send(`<h1>ID trouvé !</h1><p>Vérifie ton terminal ou copie ceci : <b>${wallet.id}</b></p>`);
        } else {
            res.status(404).send("Compte non trouvé. Vérifie le username et l'API Key.");
        }
    } catch (error: any) {
        console.error("Erreur Blink:", error.response?.data || error.message);
        res.status(500).json(error.response?.data || error.message);
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[OpenMMLN] Ready on port ${PORT}`);
});