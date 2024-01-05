class BaseStore {
  private key: any;
  constructor(key: string) {
    this.key = key;
  }

  set(data: any) {
    localStorage.setItem(this.key, data);
  }

  get() {
    const data: any = localStorage.getItem(this.key);
    return data || null;
  }

  remove() {
    localStorage.removeItem(this.key);
    return true;
  }
  clear() {
    localStorage.clear();
    return true;
  }
}

export default BaseStore;
