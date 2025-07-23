import { appserviceHealth, type AppserviceHealth } from '../types/common'
import { error } from '@sveltejs/kit';

export async function checkHealth(public_appservice_url: string): Promise<AppserviceHealth> {
    let appservice_endpoint = `${public_appservice_url}/health`;

    try {
        const appservice_response = await fetch(appservice_endpoint);
        if (!appservice_response.ok) {
            console.error("Appservice health check failed with status:", appservice_response.status);
            throw new Error("Failed to fetch appservice health.");
        }

        const resp = await appservice_response.json();
        if (!resp) {
            console.error("Appservice health response is empty.");
            throw new Error("Empty appservice health response.");
        }

        let validated = appserviceHealth.safeParse(resp);

        if (validated.success) {
            if ('error' in validated.data) {
                console.error("Appservice health check failed:", validated.data.error);
                throw new Error(validated.data.error);

            } else {

                return {
                    status: validated.data.status,
                    user_id: validated.data.user_id,
                    features: validated.data.features
                };

            }
        } else {
            console.error("Appservice health validation failed:", validated.error);
            error(500, {
                message: "Invalid appservice health response."
            });
        }

    } catch (err: any) {
        error(500, {
            message: err.message,
        });
    }
}
