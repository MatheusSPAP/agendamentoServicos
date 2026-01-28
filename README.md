# Sistema de Agendamento de Serviços (Backend Django)

Este repositório contém o backend da aplicação de agendamento de serviços, desenvolvido com Python e o framework Django.

## Visão Geral

O sistema permite que clientes agendem serviços com profissionais. Possui uma interface web para interação do usuário e uma API RESTful para comunicação programática.

### Funcionalidades

*   **Autenticação de Usuários**: Sistema de login e cadastro para clientes e administradores.
*   **Controle de Permissão**: Distinção entre usuários 'cliente' e 'admin', onde administradores possuem acesso a funcionalidades de gerenciamento.
*   **Gerenciamento (Admin)**: CRUD (Criar, Ler, Atualizar, Deletar) para Serviços, Profissionais e Horários de Trabalho.
*   **Fluxo de Agendamento (Cliente)**:
    *   Visualização de serviços e profissionais.
    *   Cálculo e exibição de horários disponíveis em tempo real.
    *   Criação e cancelamento de agendamentos.

## Tecnologias Utilizadas

*   **Backend**:
    *   Python
    *   Django
    *   Django Rest Framework (para a API)
*   **Banco de Dados**:
    *   MySQL

## Como Executar a Aplicação

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento localmente.

### 1. Pré-requisitos

*   Python 3.9+
*   Um servidor de banco de dados MySQL em execução.

### 2. Configuração do Ambiente

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd agendamentoServicos
    ```

2.  **Crie e Ative o Ambiente Virtual:**
    Navegue até a pasta `django/` e crie um ambiente virtual.

    ```bash
    # No Windows (PowerShell)
    cd django
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    ```

3.  **Instale as Dependências:**
    Com o ambiente virtual ativado, instale todas as dependências listadas no `requirements.txt`.
    ```bash
    pip install -r requirements.txt
    ```

### 3. Configuração do Banco de Dados

1.  **Crie um Banco de Dados:**
    No seu servidor MySQL, crie um banco de dados vazio.
    ```sql
    CREATE DATABASE agendamento_servicos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```

2.  **Configure a Conexão:**
    Abra o arquivo `django/backend_config/settings.py`. Na seção `DATABASES`, atualize os campos `USER` e `PASSWORD` com suas credenciais do MySQL.
    ```python
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': 'agendamento_servicos',
            'USER': 'seu_usuario_mysql',      # <- ATUALIZE AQUI
            'PASSWORD': 'sua_senha_mysql',  # <- ATUALIZE AQUI
            'HOST': 'localhost',
            'PORT': '3306',
        }
    }
    ```
    *Nota: Para um projeto em produção, é fortemente recomendado usar variáveis de ambiente para proteger essas credenciais.*

3.  **Execute as Migrações:**
    Este comando criará todas as tabelas da aplicação no seu banco de dados, com base no histórico de migrações.
    ```bash
    python manage.py migrate
    ```

### 4. Executando a Aplicação

1.  **Crie um Superusuário (Admin):**
    Para acessar o painel de administração, crie um usuário administrador.
    ```bash
    python manage.py createsuperuser
    ```
    Siga as instruções no terminal para definir o e-mail e a senha.

2.  **Inicie o Servidor:**
    ```bash
    python manage.py runserver
    ```

3.  **Acesse a Aplicação:**
    A interface web estará disponível em `http://127.0.0.1:8000/`.
