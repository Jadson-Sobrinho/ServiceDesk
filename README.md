# 📘 Documentação da API - Sistema de Chamados com Chat Integrado

## 🔎 Visão Geral
Esta API fornece recursos para o **gerenciamento de chamados de suporte interno**, com **chat integrado**, voltado para empresas de médio e grande porte, além de **prefeituras** e **escolas municipais** com setor de T.I.  

A API permite:
- Criação, acompanhamento e encerramento de chamados.  
- Comunicação em tempo real via chat entre usuário e equipe de suporte.  
- Controle de autenticação e autorização por nível de acesso.  

---

## 🛠️ Tecnologias Utilizadas
- **Banco de Dados:** MongoDB  
- **ODM:** Mongoose  
- **Framework:** API REST  
- **Motor:** Node.js  
- **Linguagem Back-end:** JavaScript  
- **Linguagem & Framework Front-end:** React.js, Next.js  
- **Segurança:** Bcrypt, SessionStorage  
- **Autenticação:** JWT  
- **Validação:** Joi  
- **Variáveis de Ambiente:** Dotenv  
- **Chat em Tempo Real:** WebSocket (socket.io)  
- **Formato do Corpo de Requisição:** JSON  

---

## 🔑 Autenticação

A API utiliza **JWT** para autenticação. O token deve ser enviado no header:

```http
Authorization: Bearer <token>
```

---

## 📂 Endpoints

### 🔹 Registro de Usuário

**POST** `/register`

* **Descrição:** Cria um novo usuário no sistema.
* **Body (JSON):**

```json
{
  "name": "Jadson Sobrinho",
  "email": "jadson@empresa.com",
  "role": "admin",
  "phone_number": "11999999999",
  "hashed_password": "senha123"
}
```

* **Resposta (201):**

```json
{
  "message": "Usuário registrado com sucesso!",
  "name": "Jadson Sobrinho"
}
```

* **Erros possíveis:**

  * `500 Internal Server Error` → Falha ao criar usuário

---

### 🔹 Autenticação

**POST** `/auth/login`

* **Descrição:** Autentica o usuário e retorna um JWT.
* **Body (JSON):**

```json
{
  "email": "jadson@empresa.com",
  "password": "senha123"
}
```

* **Resposta (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "user_id": "64f9b8c2e5a1c6a123456789",
    "name": "Jadson Sobrinho",
    "email": "jadson@empresa.com",
    "rule": "admin",
    "phone_number": "11999999999"
  }
}
```

* **Erros possíveis:**

  * `401 Unauthorized` → Email ou senha incorretos
  * `500 Internal Server Error` → Erro interno

**GET** `/auth/me`

* **Descrição:** Retorna informações do usuário autenticado.
* **Headers:**

```http
Authorization: Bearer <token>
```

* **Resposta (200):**

```json
{
  "user_id": "64f9b8c2e5a1c6a123456789",
  "name": "Jadson Sobrinho",
  "email": "jadson@empresa.com",
  "rule": "admin",
  "phone_number": "11999999999"
}
```

---

### 🔹 Chamados

**GET** `/ticket`

* **Descrição:** Retorna todos os chamados cadastrados.
* **Resposta (200):**

```json
[
  {
    "_id": "64f9b8c2e5a1c6a987654321",
    "address": "Rua X, 123",
    "description": "Problema no sistema de login",
    "urgency_level": "alta",
    "status": "aberto",
    "user_id": {
      "_id": "64f9b8c2e5a1c6a123456789",
      "name": "Jadson Sobrinho"
    }
  }
]
```

**GET** `/ticket/user`

* **Descrição:** Retorna os chamados do usuário autenticado.
* **Headers:**

```http
Authorization: Bearer <token>
```

**GET** `/ticket/:id`

* **Descrição:** Retorna detalhes de um chamado pelo ID.

**POST** `/ticket`

* **Descrição:** Cria um novo chamado.
* **Headers:**

```http
Authorization: Bearer <token>
```

* **Body (JSON):**

```json
{
  "address": "Rua Central, 456",
  "description": "Computador não liga",
  "urgency_level": "média"
}
```

* **Resposta (201):**

```json
{
  "message": "Ticket created successfully."
}
```

**PATCH** `/ticket/status`

* **Descrição:** Atualiza o status de um chamado.
* **Headers:**

```http
Authorization: Bearer <token>
```

* **Body (JSON):**

```json
{
  "_id": "64f9b8c2e5a1c6a987654321",
  "status": "fechado"
}
```

* **Resposta (200):**

```json
{
  "message": "Operação concluída sucesso."
}
```

---

### 🔹 Chat

**POST** `/chat`

* **Descrição:** Cria uma nova conversa de chat.
* **Body (JSON):**

```json
{
  "client": {
    "id": "64f9b8c2e5a1c6a123456789",
    "name": "Maria Silva",
    "email": "maria@empresa.com"
  },
  "support": {
    "id": "64f9b8c2e5a1c6a987654321",
    "name": "Carlos Souza",
    "email": "carlos@empresa.com"
},
  "status": "open",
  "messages": [
    {
      "sender": {
        "id": "64f9b8c2e5a1c6a123456789",
        "rule": "client"
      },
      "content": "Olá, estou com problema no login."
    }
  ]
}
```

* **Resposta (201):**

```json
{
"_id": "64f9b8c2e5a1c6a999888777",
"client": {
"id": "64f9b8c2e5a1c6a123456789",
"name": "Maria Silva",
"email": "maria@empresa.com"
},
"support": {
"id": "64f9b8c2e5a1c6a987654321",
"name": "Carlos Souza",
"email": "carlos@empresa.com"
},
"status": "open",
"created_at": "2025-09-04T10:00:00.000Z",
"closed_at": null,
"messages": [
{
"sender": {
"id": "64f9b8c2e5a1c6a123456789",
"rule": "client"
},
"content": "Olá, estou com problema no login.",
"created_at": "2025-09-04T10:05:00.000Z"
}
]
}
```

* **Erros possíveis:**

  * `400 Bad Request` → Dados inválidos
  * `500 Internal Server Error` → Erro ao criar conversa

---

## ⚠️ Erros Padrão

* **400 Bad Request** → Requisição inválida
* **401 Unauthorized** → Token inválido ou ausente
* **403 Forbidden** → Acesso negado
* **404 Not Found** → Recurso não encontrado
* **500 Internal Server Error** → Erro inesperado

---