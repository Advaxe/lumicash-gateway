import axios from 'axios';

const API_URL = 'https://api.blink.sv/graphql';

/**
 * Envoie des Satoshis vers une adresse Lightning
 */
export async function sendLightning(lnAddress: string, amountSats: number) {
    const apiKey = process.env.BLINK_API_KEY;
    const walletId = process.env.BLINK_WALLET_ID; // Récupéré depuis le .env

    if (!apiKey || !walletId) {
        throw new Error("Configuration Blink incomplète (API Key ou Wallet ID manquant)");
    }

    const mutation = `
      mutation LnAddressPaymentSend($input: LnAddressPaymentSendInput!) {
        lnAddressPaymentSend(input: $input) {
          status
          errors { message }
          transaction { id }
        }
      }
    `;

    try {
        const response = await axios.post(API_URL, {
            query: mutation,
            variables: {
                input: {
                    amount: Math.floor(amountSats),
                    lnAddress: lnAddress.trim(),
                    walletId: walletId
                }
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey
            }
        });

        const result = response.data?.data?.lnAddressPaymentSend;

        // Gestion des erreurs retournées par Blink
        if (result?.errors && result.errors.length > 0) {
            throw new Error(result.errors[0].message);
        }

        if (result && result.status === 'SUCCESS') {
            console.log(`[Blink] Paiement réussi ! ID Transaction: ${result.transaction?.id}`);
            return { success: true, id: result.transaction?.id };
        } else {
            throw new Error(`Échec Blink: Statut ${result?.status}`);
        }
    } catch (error: any) {
        console.error("Erreur Blink lors de l'envoi:", error.response?.data || error.message);
        throw error;
    }
}