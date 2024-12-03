export class BrowserDatabase {
  private db: IDBDatabase | null = null;

  constructor() {
    this.init();
  }

  // Initialize IndexedDB
  private init() {
    const request = indexedDB.open('docDatabase', 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBRequest).result;
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      this.db = request.result;
      console.log('IndexedDB initialized');
    };

    request.onerror = (error) => {
      console.error('Error initializing IndexedDB:', error);
    };
  }

  // Save document to IndexedDB
  saveDoc(docId: string, content: any) {
    if (!this.db) return;

    const transaction = this.db.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');

    const doc = { id: docId, content };
    store.put(doc); // Store or update document

    transaction.oncomplete = () => {
      console.log('Document saved to IndexedDB');
    };

    transaction.onerror = (error) => {
      console.error('Error saving document to IndexedDB:', error);
    };
  }

  // Get document from IndexedDB
  getDoc(docId: string, callback: (doc: any) => void) {
    if (!this.db) return;

    const transaction = this.db.transaction(['documents'], 'readonly');
    const store = transaction.objectStore('documents');

    const request = store.get(docId);
    request.onsuccess = () => {
      callback(request.result);
    };

    request.onerror = (error) => {
      console.error('Error fetching document from IndexedDB:', error);
    };
  }
}
