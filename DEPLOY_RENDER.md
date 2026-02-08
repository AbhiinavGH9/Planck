# Deploying Planck on Render

This guide outlines the steps to deploy the Planck backend (Node.js/Express) and frontend (if applicable) on Render.

## Prerequisites
- A [Render](https://render.com) account.
- This GitHub repository connected to your Render account.

## Backend Deployment (Web Service)

1. **Dashboard**: Go to your Render Dashboard and click **New +** -> **Web Service**.
2. **Connect Repo**: Select the `Planck` repository.
3. **Configuration**:
    - **Name**: `planck-backend` (or similar)
    - **Region**: Closest to your users (e.g., Singapore, Frankfurt, Oregon).
    - **Branch**: `main`
    - **Root Directory**: `backend` (Important: This tells Render to look in the backend folder)
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node src/server.js` (or `npm start`)
4. **Environment Variables**:
    Add the following variables under "Environment" (copy values from your local `.env`):
    - `PORT`: `10000` (Render default)
    - `MONGO_URI`: Your MongoDB connection string.
    - `JWT_SECRET`: Your secret key.
    - `CLOUDINARY_CLOUD_NAME`: ...
    - `CLOUDINARY_API_KEY`: ...
    - `CLOUDINARY_API_SECRET`: ...
    - `FIREBASE_SERVICE_ACCOUNT`: (If using Firebase Admin, you may need to handle the JSON file path or encoded string)
5. **Deploy**: Click **Create Web Service**.

## Database (MongoDB Atlas)

Ensure your MongoDB Atlas cluster allows connections from anywhere (`0.0.0.0/0`) OR whitelist Render's IP addresses (which can change, so allowing all or using a VPC peering is standard).

## Frontend (Expo)

Since the frontend is built with Expo (React Native), it is typically deployed to App Stores or as a progressive web app (PWA).

### If deploying as Web (Static Site):
1. **Build**: Run `npx expo export:web` locally to generate a `web-build` folder.
2. **Deploy**: You can deploy this static folder to **Render Static Sites** or **Vercel/Netlify**.
3. **Configuration**:
    - **Root Directory**: `frontend`
    - **Build Command**: `npx expo export:web`
    - **Publish Directory**: `web-build`
    - **Rewrite Rules**: SPAs need a rewrite rule: Source `/*`, Destination `/index.html`.

## Troubleshooting
- **Logs**: Check the "Logs" tab in Render for startup errors.
- **Port**: Ensure the backend listens on `process.env.PORT`.
