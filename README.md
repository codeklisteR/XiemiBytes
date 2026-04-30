# Frontend Setup Instructions

Follow these steps to set up and run the frontend project on your local laptop.

## Prerequisites

Make sure you have **Node.js** installed on your laptop. If you don't have it, download and install it from [nodejs.org](https://nodejs.org/). We recommend using Node.js version 16 or higher.

To check if Node.js is installed, open your terminal and run:
```bash
node --version
npm --version
```

## Installation Steps

### 1. Download and Extract the Repository

- Download the repository as a ZIP file
- Extract the ZIP file to a location of your choice on your laptop
- Navigate to the project folder in your terminal:
  ```bash
  cd path/to/your/project-folder
  ```

### 2. No Need to Run npm install

**Note:** The `node_modules` folder is already included in the repository, so you **do not need** to run `npm install`. This saves time and ensures all dependencies are pre-configured exactly as intended for this project.

If for any reason you want a fresh installation of dependencies, you can optionally delete the `node_modules` folder and run `npm install`, but this is not necessary.

### 3. Start the Development Server

Once you're in the project directory, run the following command:

```bash
npm run dev
```

This will start the development server. You should see output in your terminal indicating that the server is running:

```
> xiemibytes-frontend@1.0.0 dev
> serve . -p 3000

Serving!

- Local:     http://localhost:3000
- Network:   http://192.168.x.x:3000
```

### 4. Open in Your Browser

Open your web browser and navigate to:
- **Local**: http://localhost:3000 (on the same laptop)
- **Network**: http://192.168.x.x:3000 (from another device on the same network)

You should now see your frontend application running locally!

## Development Workflow

- **Edit files**: Make changes to your source files, and they will automatically reload in your browser (hot module replacement)
- **Stop the server**: Press `Ctrl + C` in your terminal to stop the development server

## Troubleshooting

### Port Already in Use
If you get an error that port 3000 is already in use, you can run on a different port:
```bash
npm run dev -- --port 3001
```

### Node Modules Issues
If you encounter any module-related errors, try clearing your npm cache:
```bash
npm cache clean --force
```

Then delete the `node_modules` folder and reinstall:
```bash
rm -rf node_modules
npm install
```

### Not Seeing Changes
Clear your browser cache or do a hard refresh (Ctrl + Shift + R on Windows/Linux or Cmd + Shift + R on Mac).

## Need Help?

If you encounter any issues, check that:
- Node.js is properly installed
- You're in the correct project directory
- All firewall/antivirus software isn't blocking localhost connections
- No other application is using port 3000

Enjoy developing! 🚀
