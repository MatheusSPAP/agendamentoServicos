# Sistema de Agendamento de Serviços

Este é um sistema de agendamento de serviços completo, com frontend em Angular e backend em Node.js.

## Descrição

O sistema permite que clientes agendem serviços com profissionais de um salão de beleza. Os administradores podem gerenciar serviços, profissionais e horários de trabalho.

## Funcionalidades

*   **Agendamento de Serviços:** Clientes podem visualizar os serviços disponíveis, escolher um profissional e agendar um horário.
*   **Gerenciamento de Usuários:** Sistema de cadastro e login para clientes e administradores.
*   **Gerenciamento de Serviços:** Administradores podem adicionar, editar e remover serviços.
*   **Gerenciamento de Profissionais:** Administradores podem cadastrar profissionais e suas especialidades.
*   **Gerenciamento de Horários:** Administradores podem definir os horários de trabalho de cada profissional.

## Tecnologias Utilizadas

*   **Frontend:**
    *   Angular
    *   TypeScript
    *   HTML/CSS
*   **Backend:**
    *   Node.js
    *   Express.js
    *   MySQL
*   **Banco de Dados:**
    *   MySQL

## Pré-requisitos

*   Node.js e npm
*   Angular CLI
*   MySQL

## Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/agendamento-servicos.git
    cd agendamento-servicos
    ```

2.  **Instale as dependências do Backend:**
    ```bash
    cd backend
    npm install
    ```

3.  **Instale as dependências do Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```

## Configuração do Banco de Dados

1.  Certifique-se de que você tem o MySQL instalado e em execução.
2.  Crie um banco de dados chamado `agendamento_servicos`.
3.  Execute o script `bd/modelagem_agendamento.sql` para criar as tabelas.
4.  Configure as variáveis de ambiente no arquivo `backend/.env`. Um arquivo de exemplo `backend/.env.example` é fornecido.

## Executando a Aplicação

1.  **Inicie o Backend:**
    ```bash
    cd backend
    npm start
    ```
    O servidor backend estará rodando em `http://localhost:3000`.

2.  **Inicie o Frontend:**
    ```bash
    cd ../frontend
    npm start
    ```
    A aplicação frontend estará disponível em `http://localhost:4200`.
