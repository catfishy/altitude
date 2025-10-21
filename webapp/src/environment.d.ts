declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_FIREBASE_API_KEY: string;
      REACT_APP_FIREBASE_PROJECT_ID: string;
      REACT_APP_FIREBASE_APP_ID: string;
      REACT_APP_FIREBASE_AUTH_DOMAIN: string;
      REACT_APP_FIREBASE_DATABASE_URL: string;
      REACT_APP_FIREBASE_STORAGE_BUCKET: string;
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID: string;
      REACT_APP_FIREBASE_MEASUREMENT_ID: string;
      REACT_APP_FIREBASE_BASE_URL: string;
      REACT_APP_FIREBASE_REGION: string;
      REACT_APP_GOOGLE_MAPS_PLATFORM_API_KEY: string;
      REACT_APP_MAPBOX_API_KEY: string;
      REACT_APP_MUI_LICENSE: string;
    }
  }
}

export {}
