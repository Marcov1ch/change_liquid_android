import { ACCOUNT_DELETION_URL, PRIVACY_POLICY_URL, openLegalUrl } from '../utils/legal'

export function LegalFooter() {
    return (
        <div className="mt-4 flex flex-col items-center gap-1 text-body-sm text-outline">
            <button
                type="button"
                onClick={() => void openLegalUrl(PRIVACY_POLICY_URL)}
                className="text-primary hover:underline underline-offset-2"
            >
                Политика конфиденциальности
            </button>
            <button
                type="button"
                onClick={() => void openLegalUrl(ACCOUNT_DELETION_URL)}
                className="text-primary hover:underline underline-offset-2"
            >
                Удаление аккаунта
            </button>
        </div>
    );
}
