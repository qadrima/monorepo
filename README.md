# My Monorepo

This repository is a monorepo containing both frontend and backend applications managed with Turborepo.

## Project Structure

```
my-monorepo/
├── apps/
│   ├── frontend-repo/
│   └── backend-repo/
├── packages/
│   └── shared/
└── config files...
```

## Prerequisites

- Node.js (v16 or later recommended)
- npm (v8 or later, v10.8.1 preferred)
- Firebase CLI (for running emulators)

## Installation

Install dependencies:
   ```bash
   npm install
   ```
Configure the project:
   - Copy `config.example.json` to `config.json`
   ```bash
   cp config.example.json config.json
   ```
   - Fill in the required configuration values in `config.json`:
     - Backend Firebase service account details
     - Frontend Firebase project configuration

## Development

### Start development servers:
```bash
npm run dev
```

This will start all packages and applications in development mode.

### Run Firebase emulators (for local development):
```bash
npm run emul
```

### Build all packages and applications:
```bash
npm run build
```

## Project Structure Details

- **apps/frontend-repo**: Frontend application
- **apps/backend-repo**: Backend application
- **packages/shared**: Shared code between frontend and backend

## Troubleshooting

If you encounter any issues during installation or setup:

1. Make sure all prerequisites are installed correctly
2. Verify that `config.json` is properly configured (real config firebase)
3. Clear node_modules and reinstall if necessary:
   ```bash
   rm -rf node_modules
   rm -rf apps/*/node_modules
   rm -rf packages/*/node_modules
   npm install
   ```

## License

ISC
