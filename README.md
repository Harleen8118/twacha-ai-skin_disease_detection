# Twacha AI - Skin Disease Detection

## Overview

Twacha AI is an advanced dermatological analysis web application. It leverages the **Finetuned Qwen 2 VL** model to analyze skin images, detect potential conditions, assess severity, and provide actionable medical recommendations.

This application is designed as a demonstration of next-generation visual language models (VLMs) in healthcare.

## Key Features

*   **Finetuned Qwen 2 VL Integration**: Utilizes a state-of-the-art multimodal model specialized in dermatological visual patterns.
*   **Instant Analysis**: Upload an image to receive immediate classification.
*   **Severity Assessment**: Categorizes conditions into Mild, Moderate, or Severe.
*   **Medical Recommendations**: Provides precautions and potential treatment options.
*   **Secure Dashboard**: Simple, clean interface for uploading and viewing results.

## Prerequisites

Before running this project, ensure you have the following installed:
*   **Node.js** (Version 16 or higher)
*   **npm** (Node Package Manager)

## How to Run

Follow these exact steps to set up and run the website on your local machine.

### 1. Installation

Open your terminal or command prompt in the project root directory and run the following command to install all necessary dependencies:

```bash
npm install
```

### 2. Configure API Key

This application uses a Generative AI API Key to interface with the model.

1.  Create a new file in the root directory named `.env`.
2.  Add your API key to this file:

```env
API_KEY=your_actual_api_key_here
```

*(Note: While the app uses the Qwen 2 VL architecture conceptually, this demo may interface via available API endpoints compatible with the provided key).*

### 3. Start the Application

Run the following command to start the local development server:

```bash
npm run dev
```

### 4. Access the App

Once the server starts, the terminal will show a local URL (usually `http://localhost:5173`). Open this URL in your web browser.

## Project Structure

*   `src/` - Source code for the application.
*   `components/` - React components (Login, Dashboard, AnalysisView).
*   `services/` - API integration services.
*   `types.ts` - TypeScript definitions.

## Disclaimer

This tool is for educational and demonstration purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider.
