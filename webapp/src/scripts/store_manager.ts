/**
 * Salva una stringa nel localStorage del browser associandola a un nome (chiave).
 * 
 * @param key Il nome (chiave) con cui salvare la stringa.
 * @param value La stringa da salvare.
 */
export function saveStringToLocalStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
    console.log(`Stringa salvata con successo con la chiave: "${key}"`);
  } catch (error) {
    console.error("Errore durante il salvataggio nel localStorage:", error);
    // Potresti mostrare una notifica all'utente qui
  }
}

/**
 * Legge una stringa dal localStorage del browser usando il suo nome (chiave).
 * 
 * @param key Il nome (chiave) della stringa da recuperare.
 * @returns La stringa salvata se trovata, altrimenti `null`.
 */
export function getStringFromLocalStorage(key: string): string | null {
  try {
    const value = window.localStorage.getItem(key);
    return value;
  } catch (error) {
    console.error("Errore durante la lettura dal localStorage:", error);
    // Restituisce null anche in caso di errore per una gestione uniforme
    return undefined;
  }
}