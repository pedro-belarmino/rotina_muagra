import { useRef, useState } from "react";
import { FirebaseError } from "firebase/app";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../../context/SnackbarContext";
import { buildE164, DEFAULT_COUNTRY_CODE } from "../../utils/phone";

type FieldErrors = { countryCode?: string; number?: string };

function describeSaveError(error: unknown): string {
    if (error instanceof FirebaseError) {
        switch (error.code) {
            case "permission-denied":
                return "Você não tem permissão para salvar este número. Saia e entre novamente na sua conta.";
            case "not-found":
                return "Seu perfil ainda não foi criado. Recarregue a página e tente novamente.";
            case "unavailable":
                return "Sem conexão com o servidor. Verifique sua internet e tente novamente.";
        }
    }
    return "Não foi possível salvar seu número. Tente novamente.";
}

export function usePhoneNumberModalController() {
    const { savePhoneNumber } = useAuth();
    const { showSnackbar } = useSnackbar();

    const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
    const [number, setNumber] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    // Bloqueia cliques duplos antes do re-render que desabilita o botão.
    const savingRef = useRef(false);

    const handleCountryCodeChange = (value: string) => {
        setCountryCode(value.replace(/[^\d+]/g, "").slice(0, 4));
        setFieldErrors(prev => ({ ...prev, countryCode: undefined }));
    };

    const handleNumberChange = (value: string) => {
        setNumber(value.replace(/[^\d\s()-]/g, "").slice(0, 20));
        setFieldErrors(prev => ({ ...prev, number: undefined }));
    };

    const handleSubmit = async () => {
        if (savingRef.current) return;

        const result = buildE164(countryCode, number);
        if (!result.ok) {
            setFieldErrors({ [result.field]: result.message });
            return;
        }

        savingRef.current = true;
        setSaving(true);
        setSubmitError(null);
        try {
            await savePhoneNumber(result.e164);
            showSnackbar("Número de celular cadastrado com sucesso!", "success");
        } catch (error) {
            console.error("Error saving phone number:", error);
            setSubmitError(describeSaveError(error));
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    };

    return {
        countryCode,
        number,
        fieldErrors,
        submitError,
        saving,
        handleCountryCodeChange,
        handleNumberChange,
        handleSubmit,
    };
}
