export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click(); // Simula il click dell'utente sul link per avviare il download
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function openAndReadTextFile(accept: string = 'text/plain, .js'): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;

    // Questo evento scatta quando l'utente ha selezionato un file.
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) {
        reject(new Error('Nessun file selezionato.'));
        return;
      }

      const file = target.files[0];
      const reader = new FileReader();

      reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
        if (readerEvent.target && typeof readerEvent.target.result === 'string') {
          resolve(readerEvent.target.result);
        } else {
          reject(new Error('Impossibile leggere il contenuto del file.'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Errore durante la lettura del file.'));
      };
      reader.readAsText(file);
    };
    input.click();
  });

}