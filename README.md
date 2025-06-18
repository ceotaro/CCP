# CivicCoin Platform

Regional Digital Currency Management System - A SaaS platform for issuing and managing regional digital currencies.

## Features

- **Dual Mode Architecture**: Switchable between DB and Blockchain modes
- **User Authentication**: Secure authentication with NextAuth
- **Role-Based Access**: Admin, Merchant, and User roles
- **Token Management**: Mint, transfer, and track digital currencies
- **QR Code Payments**: Easy QR-based transactions
- **Transaction History**: Complete transaction tracking

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Future Blockchain**: Ethereum/Polygon support (planned)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd civiccoin-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and update the values:
   ```bash
   cp .env.example .env.local
   ```

4. **Set up the database**
   ```bash
   npm run prisma:push
   npm run prisma:generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

- `CIVICCOIN_MODE`: Set to `DB` or `BLOCKCHAIN`
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your app URL
- `NEXTAUTH_SECRET`: Random secret for NextAuth

## API Endpoints

- `POST /api/users` - Create new user
- `POST /api/mint` - Mint tokens (admin only)
- `POST /api/transfer` - Transfer tokens
- `GET /api/tx/[userId]` - Get transaction history

## User Roles

- **Admin**: Can mint new tokens and view all transactions
- **Merchant**: Can receive payments from users
- **User**: Can send and receive tokens

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - TypeScript type checking
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio

## Cross-Platform Development

### TypeScript Type Checking
- **Recommended (all platforms)**: `npm run type-check:safe`
- **Standard**: `npm run type-check` (may not work in some Windows environments)

### Other Commands
- `npm run dev` - Development server
- `npm run build` - Production build  
- `npm run lint` - ESLint check
- `npm run lint:fix` - ESLint auto-fix

### Platform Notes
If you encounter `npx` issues on Windows, always use the npm scripts instead of direct `npx` commands.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

MIT
