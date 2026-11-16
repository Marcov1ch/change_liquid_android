import { ACCOUNT_DELETION_URL, PRIVACY_POLICY_URL, openLegalUrl } from '../../utils/legal'

export function ProfileLegalSection() {
    return (
        <div className="md3-card p-6">
            <h2 className="text-title-md text-surface-on mb-2">Документы</h2>
            <p className="text-body-md text-outline mb-4">
                Политика конфиденциальности и управление данными аккаунта.
            </p>
            <div className="flex flex-col items-start gap-2 text-body-md">
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
        </div>
    );
}
