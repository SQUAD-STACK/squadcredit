declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;

    // Session
    SESSION_SECRET: string;

    // Squad (HabariPay)
    SQUAD_API_BASE_URL: string;
    SQUAD_SECRET_KEY: string;

    // Google Gemini AI
    GEMINI_API_KEY: string;

    // Node.js
    NODE_ENV: "development" | "production" | "test";
  }
}
