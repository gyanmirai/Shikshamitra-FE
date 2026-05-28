# Azure Deployment Guide

## Overview

Deployment is a **2-step process**:

1. **Build** — run the script to prepare the `build/standalone/` folder
2. **Upload** — manually upload `build/standalone/` to the Azure Web App

---

## Step 1 — Build the App

Open a terminal in the project root and run:

```powershell
.\build-standalone.ps1
```

> If you get an execution policy error, run this once first:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

The script will:
- Install all dependencies (`npm ci`)
- Build the Next.js app
- Copy `public/` and `build/static/` into `build/standalone/`

When finished you will see:
```
============================================================
  Build ready at:  build\standalone\
============================================================
```

---

## Step 2 — Upload to Azure

### Option A — Azure Portal (drag & drop, no CLI needed)

1. Go to [portal.azure.com](https://portal.azure.com)
2. Open **App Services** → select `dev-gyanmirai-fe`
3. In the left menu go to **Development Tools** → **Advanced Tools** → click **Go**
4. In the Kudu window click **Tools** → **Zip Push Deploy**
5. Zip the `build\standalone\` folder contents:
   ```powershell
   Compress-Archive -Path "build\standalone\*" -DestinationPath "build\standalone.zip" -Force
   ```
6. Drag and drop `build\standalone.zip` onto the Kudu page

---

### Option B — Azure CLI

**One-time setup:**
```powershell
winget install Microsoft.AzureCLI
az login
```

**Deploy:**
```powershell
# 1. Zip the standalone folder
Compress-Archive -Path "build\standalone\*" -DestinationPath "build\standalone.zip" -Force

# 2. Deploy
az webapp deploy `
  --name dev-gyanmirai-fe `
  --resource-group <YOUR_RESOURCE_GROUP> `
  --src-path build\standalone.zip `
  --type zip
```

Replace `<YOUR_RESOURCE_GROUP>` with your actual resource group name (find it in the Azure Portal on the App Service overview page).

---

## App URL

After deployment the app will be live at:

```
https://dev-gyanmirai-fe.azurewebsites.net
```
