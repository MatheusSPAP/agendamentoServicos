from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    TIPO_CHOICES = (
        ('cliente', 'Cliente'),
        ('admin', 'Admin'),
    )
    # O Django já fornece: username, first_name, last_name, email, password, is_staff, is_active, etc.
    # Usaremos 'first_name' para o 'nome' do usuário.
    # O campo 'username' é obrigatório por padrão.
    
    telefone = models.CharField(max_length=20, blank=True, null=True)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, default='cliente')

    # Se você quiser usar o email como principal forma de login, descomente as linhas abaixo
    # e ajuste o serializer e as views de acordo.
    # USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['username', 'first_name']

    def __str__(self):
        return self.get_full_name() or self.username

    class Meta:
        db_table = 'usuarios'


class Servico(models.Model):
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    duracao_minutos = models.IntegerField()
    def __str__(self):
        return self.nome

    class Meta:
        db_table = 'servicos'


class Profissional(models.Model):
    nome = models.CharField(max_length=255)
    especialidade = models.CharField(max_length=255, blank=True, null=True)
    servicos = models.ManyToManyField(Servico, related_name="profissionais", db_table='profissionais_servicos')

    def __str__(self):
        return self.nome

    class Meta:
        db_table = 'profissionais'


class HorarioTrabalho(models.Model):
    DIA_SEMANA_CHOICES = (
        ('domingo', 'Domingo'),
        ('segunda', 'Segunda-feira'),
        ('terca', 'Terça-feira'),
        ('quarta', 'Quarta-feira'),
        ('quinta', 'Quinta-feira'),
        ('sexta', 'Sexta-feira'),
        ('sabado', 'Sábado'),
    )
    profissional = models.ForeignKey(Profissional, on_delete=models.CASCADE, related_name="horarios_trabalho")
    dia_semana = models.CharField(max_length=10, choices=DIA_SEMANA_CHOICES)
    hora_inicio = models.TimeField()
    hora_fim = models.TimeField()

    class Meta:
        db_table = 'horarios_trabalho'
        unique_together = ('profissional', 'dia_semana')

    def __str__(self):
        return f"{self.profissional.nome} - {self.get_dia_semana_display()}"

class Agendamento(models.Model):
    STATUS_CHOICES = (
        ('agendado', 'Agendado'),
        ('cancelado', 'Cancelado'),
        ('concluido', 'Concluído'),
    )
    cliente = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="agendamentos")
    profissional = models.ForeignKey(Profissional, on_delete=models.CASCADE, related_name="agendamentos")
    servico = models.ForeignKey(Servico, on_delete=models.CASCADE, related_name="agendamentos")
    data_hora = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='agendado')

    class Meta:
        db_table = 'agendamentos'
        indexes = [
            models.Index(fields=['cliente']),
            models.Index(fields=['profissional']),
            models.Index(fields=['servico']),
            models.Index(fields=['data_hora']),
        ]

    def __str__(self):
        return f"Agendamento de {self.cliente} com {self.profissional} em {self.data_hora.strftime('%d/%m/%Y %H:%M')}"