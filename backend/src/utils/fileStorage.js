const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFilePath = path.join(__dirname, '../../data/users.json');

// Garantir que o arquivo existe
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
}

class FileStorage {
  // Ler usuários do arquivo
  readUsers() {
    try {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  // Salvar usuários no arquivo
  saveUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  }

  // Encontrar usuário por email
  findUserByEmail(email) {
    const users = this.readUsers();
    return users.find(u => u.email === email.toLowerCase());
  }

  // Criar novo usuário
  async createUser(userData) {
    const users = this.readUsers();
    
    // Verificar se já existe
    if (users.some(u => u.email === userData.email.toLowerCase())) {
      throw new Error('User already exists');
    }

    // Hash da password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = {
      _id: Date.now().toString(),
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      name: userData.name,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    return newUser;
  }

  // Comparar password
  async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Atualizar token de reset
  updateResetToken(email, token, expireTime) {
    const users = this.readUsers();
    const userIndex = users.findIndex(u => u.email === email.toLowerCase());
    
    if (userIndex !== -1) {
      users[userIndex].resetToken = token;
      users[userIndex].resetTokenExpire = expireTime;
      this.saveUsers(users);
    }
  }

  // Encontrar usuário por reset token
  findUserByResetToken(token) {
    const users = this.readUsers();
    return users.find(u => 
      u.resetToken === token && 
      u.resetTokenExpire && 
      u.resetTokenExpire > Date.now()
    );
  }

  // Atualizar password
  async updatePassword(email, newPassword) {
    const users = this.readUsers();
    const userIndex = users.findIndex(u => u.email === email.toLowerCase());
    
    if (userIndex !== -1) {
      const salt = await bcrypt.genSalt(10);
      users[userIndex].password = await bcrypt.hash(newPassword, salt);
      this.saveUsers(users);
    }
  }

  // Limpar token de reset
  clearResetToken(email) {
    const users = this.readUsers();
    const userIndex = users.findIndex(u => u.email === email.toLowerCase());
    
    if (userIndex !== -1) {
      users[userIndex].resetToken = null;
      users[userIndex].resetTokenExpire = null;
      this.saveUsers(users);
    }
  }}

module.exports = new FileStorage();