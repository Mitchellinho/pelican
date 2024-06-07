/**
 * @author Frank Nelles
 */
import {environment} from "../environments/environment";

export class Configuration {
    public static alphaUrl: string = environment.ALPHA_URL;
    public static frontendPrefix: string = `${location.protocol}//${location.host}`;
    public static backendPrefix: string = `${location.protocol}//${location.host}`;
    public static backendWsPrefix: string = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`;
}

export const SERVICE_NAME = "Pelican";
