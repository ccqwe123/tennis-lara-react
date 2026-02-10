import { AxiosInstance } from 'axios';
import zigzag from 'ziggy-js';

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    var route: typeof zigzag;
}
