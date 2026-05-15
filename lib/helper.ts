export const isValidJson = (value: string) => {
    if (!value.trim()) return null;
    try {
        JSON.parse(value);
        return true;
    } catch(err) {
        console.error(err)
        return false;
    }
};

export const getDataFromLocal = (key: string) => {
    const item = localStorage.getItem(key);
    if (item) {
        return item
    }

    return null
}