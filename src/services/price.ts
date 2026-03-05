import axios from 'axios';

const YADIO_API_URL = 'https://api.yadio.io/convert';

/**
 * Convertit les BIF en Satoshis via l'API Yadio
 */
export async function getSatsFromBIF(amountBif: number): Promise<number> {
    try {
        // Construction de l'URL : /amount/from/to
        const url = `${YADIO_API_URL}/${amountBif}/BIF/BTC`;
        
        const response = await axios.get(url);
        
        if (response.data && response.data.result) {
            const btcAmount = response.data.result;
            
            // Conversion BTC en Satoshis (1 BTC = 100,000,000 sats)
            const totalSats = Math.round(btcAmount * 100_000_000);

            console.log(`[Price] Yadio conversion : ${amountBif} BIF = ${totalSats} sats`);

            if (totalSats < 1) {
                throw new Error("Montant trop faible pour la conversion en Satoshis");
            }

            return totalSats;
        } else {
            throw new Error("Réponse Yadio invalide ou vide");
        }
    } catch (error: any) {
        console.error('Erreur Yadio (BIF->BTC):', error.message);
        throw new Error("Impossible de récupérer le prix via Yadio");
    }
}