from django.core.management.base import BaseCommand
from django.db import connection

def check_table_structure():
    with connection.cursor() as cursor:
        # Verificar estrutura da tabela usuarios
        cursor.execute("DESCRIBE usuarios;")
        columns = cursor.fetchall()
        print("Estrutura da tabela 'usuarios':")
        for column in columns:
            print(f"- {column[0]} ({column[1]})")

if __name__ == "__main__":
    check_table_structure()