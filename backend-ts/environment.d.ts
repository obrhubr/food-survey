declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      ENV: 'LOCAL' | 'PROD';
      DB: 'firestore' | 'test';
      ADMIN_USERNAME: string;
      ADMIN_PASSWORD: string;
      SECRET: string;
      PYTHONANALYSIS_URL: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
