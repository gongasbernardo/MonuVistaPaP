# MonuVista

MonuVista is a prototype app for monument discovery and community features (frontend in React + Ionic, backend in Node/Express + MongoDB).

## Tech stack
- Frontend: React 18, Ionic, TypeScript, Vite
- Backend: Node.js, Express, MongoDB (Mongoose)

## Quick start (local)

Prerequisites: Node.js (16+), npm, MongoDB running locally or a connection string.

Backend

```bash
cd backend
npm install
# create a .env file (see .env.example) with MONGODB_URI and JWT_SECRET
npm run dev
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🤖 Agente de Chat sobre PDF (Jupyter Notebook)

O ficheiro `notebooks/pdf_agent_chat.ipynb` implementa um agente de IA que responde **apenas** com base no conteúdo de um PDF à tua escolha.

### Pré-requisitos
- Python 3.10+
- [Jupyter Lab](https://jupyterlab.readthedocs.io/) ou Jupyter Notebook
- Uma chave de API do [OpenAI](https://platform.openai.com/api-keys)

### Como usar

```bash
# Instala Jupyter (se ainda não tiveres)
pip install jupyterlab

# Abre o notebook
jupyter lab notebooks/pdf_agent_chat.ipynb
```

1. Executa a **célula de instalação** de dependências (só uma vez).
2. Na **célula de configuração**, define `OPENAI_API_KEY` e `PDF_PATH` (caminho para o teu PDF).
3. Executa as restantes células por ordem.
4. Na última célula aparece a **interface de chat** — escreve as tuas perguntas e prime *Enviar*.

> O agente recusa responder a perguntas que não estejam no PDF, garantindo que todas as respostas são fundamentadas no documento.

## Notes
- Some features are prototypes or simulated (e.g. monument recognition and album service uses localStorage). See project files for details.
- Configure backend URL in frontend API calls if deploying.

## Environment variables
Create a `.env` file in the `backend/` folder (you can copy `.env.example`) and set the following values:

```
MONGODB_URI=mongodb://localhost:27017/monuvista
JWT_SECRET=your_strong_jwt_secret
PORT=5000
```

## GitHub CI
This repository includes basic GitHub Actions workflows under `.github/workflows/`:
- `frontend-ci.yml` — installs dependencies and builds the frontend on push/PR for the `frontend/` folder.
- `backend-ci.yml` — installs backend dependencies and runs basic checks on push/PR for the `backend/` folder.

## License
This project is licensed under the MIT License. See `LICENSE`.

## Next steps
- Create a GitHub repo and push this project.
- Add CI and environment variable handling for production.
