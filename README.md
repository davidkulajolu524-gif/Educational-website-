# EduVerse

A responsive multi-page educational website served by FastAPI.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend:app --reload
```

Open http://127.0.0.1:8000. API documentation is available at `/docs`.

## Email delivery

Password reset codes and contact notifications are sent by SMTP when these environment variables are configured: `SMTP_HOST`, `SMTP_PORT` (default `587`), `SMTP_USE_SSL`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, and `CONTACT_EMAIL`. Copy `.env.example` to `.env`, replace its values, and restart Uvicorn. For Gmail, use an App Password rather than your normal account password. Without SMTP settings, contact messages are still saved locally and password reset codes are shown as a local fallback for development.

## Deploy

This project is ready for Koyeb or any host that runs the `Procfile`. Set the service to install from `requirements.txt` and use `uvicorn backend:app --host 0.0.0.0 --port $PORT`.

### Koyeb

Create a new Web Service from this repository. Use the build command `pip install -r requirements.txt` and the run command `uvicorn backend:app --host 0.0.0.0 --port $PORT`. Add the SMTP environment variables listed below to enable password-reset and contact emails. The local SQLite filesystem may be temporary on hosted services, so use a persistent database before relying on account data in production.

The contact endpoint currently validates submissions and returns success. Connect it to an email provider or database before treating it as production storage.
