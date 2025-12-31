// Express type extensions for Passport.js user session
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
    }
  }
}

export {};
