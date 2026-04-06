const { Ollama } = require('ollama');

const client = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434',
});

module.exports = client;
