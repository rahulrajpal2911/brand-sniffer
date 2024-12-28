export const showToast = (
    toast: any,
    message: string,
    severity: "info" | "success" | "warn" | "error"
) => {
    if (!toast.current) return;
    toast.current.show({
        severity,
        summary: severity.toUpperCase(),
        detail: message,
    });
};

export const isValidUrl = (url: string): boolean => {
    return /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/[\w-]*)*$/i.test(url);
};