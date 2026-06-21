# Kpglobal

Sleek and premium portal showcasing institutional-grade trading resources, custom indicators, AI trading journals, and a responsive contact system.

## Features
- **TradinJournal Integration**: Analytical AI-powered journal interfaces.
- **Partner Showcase**: Best Prop Firms and Trading Platforms slide carousel.
- **Glassmorphic Contact Form**: Translucent cards, golden outline glow inputs, and dynamic vertical stacking.
- **PowerShell HTTP Server**: Fully custom local development server.
- **Local Submission Store**: Form submissions are automatically appended to a local `contact_submissions.json` file.
- **SMTP Notification Pipeline**: Optional email forwarding via environment configuration.

## Getting Started

### Local Setup
1. Open PowerShell in the root directory.
2. Start the server:
   ```powershell
   powershell -ExecutionPolicy Bypass -File server.ps1
   ```
3. Open `http://localhost:8080` in your web browser.

### Email Forwarding Configuration
To receive contact form submissions directly in your email, set the following environment variables:
- `SMTP_SERVER`: Your SMTP server (e.g. `smtp.gmail.com`)
- `SMTP_PORT`: SMTP port (e.g. `587`)
- `SMTP_USER`: Sender authentication email address
- `SMTP_PASS`: App password or account credentials
- `SMTP_TO`: Destination email address (defaults to `kpglobal574@gmail.com`)
