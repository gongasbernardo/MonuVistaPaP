const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Criar diretório para dados se não existir
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const connectDB = async () => {
  try {
    // Tentar conectar ao MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('MongoDB not available, using local file storage');
    console.warn(`Error: ${error.message}`);
    // Não terminar o processo, continuar com fallback
  }
};

module.exports = connectDB;
