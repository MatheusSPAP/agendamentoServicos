from rest_framework.routers import DefaultRouter
from .views import (
    UsuarioViewSet,
    ServicoViewSet,
    ProfissionalViewSet,
    HorarioTrabalhoViewSet,
    AgendamentoViewSet
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'servicos', ServicoViewSet, basename='servico')
router.register(r'profissionais', ProfissionalViewSet, basename='profissional')
router.register(r'horarios-trabalho', HorarioTrabalhoViewSet, basename='horariotrabalho')
router.register(r'agendamentos', AgendamentoViewSet, basename='agendamento')

urlpatterns = router.urls
