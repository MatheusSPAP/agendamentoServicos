from django.urls import path
from .views_web import (
    ServicoListView,
    ProfissionalListView,
    ClienteRegistrationView,
    ClienteAgendamentoListView,
    AdminDashboardView,
    AdminServicoListView,
    AdminProfissionalListView,
    AdminAgendamentoListView
)
from .views_agendamento import (
    AgendamentoCreateView,
    agendar_servico,
    horarios_disponiveis,
    AgendamentoUpdateView,
    AgendamentoDeleteView
)
from .views_auth import LoginView, LogoutView

app_name = 'web'

urlpatterns = [
    # URLs para autenticação
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # URLs para clientes (usuários comuns)
    path('', ServicoListView.as_view(), name='servico-list'),
    path('profissionais/', ProfissionalListView.as_view(), name='profissional-list'),
    path('registrar/', ClienteRegistrationView.as_view(), name='cliente-registrar'),
    path('meus-agendamentos/', ClienteAgendamentoListView.as_view(), name='cliente-agendamentos'),

    # URLs para agendamento
    path('agendar/', AgendamentoCreateView.as_view(), name='agendar'),
    path('agendar/<int:servico_id>/', agendar_servico, name='agendar-servico'),
    path('horarios-disponiveis/<int:profissional_id>/', horarios_disponiveis, name='horarios-disponiveis'),

    # URLs para administradores (acesso restrito)
    path('admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/servicos/', AdminServicoListView.as_view(), name='admin-servicos'),
    path('admin/profissionais/', AdminProfissionalListView.as_view(), name='admin-profissionais'),
    path('admin/agendamentos/', AdminAgendamentoListView.as_view(), name='admin-agendamentos'),

    # URLs para gerenciamento de agendamentos (admin)
    path('admin/agendamentos/<int:pk>/editar/', AgendamentoUpdateView.as_view(), name='admin-agendamento-editar'),
    path('admin/agendamentos/<int:pk>/excluir/', AgendamentoDeleteView.as_view(), name='admin-agendamento-excluir'),
]


