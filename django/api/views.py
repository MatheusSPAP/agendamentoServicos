from rest_framework import viewsets, permissions
from .models import Usuario, Servico, Profissional, HorarioTrabalho, Agendamento
from .serializers import (
    UsuarioSerializer,
    UsuarioCreateSerializer,
    ServicoSerializer,
    ProfissionalSerializer,
    HorarioTrabalhoSerializer,
    AgendamentoSerializer
)

# Permissão customizada para verificar se o usuário é admin
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.tipo == 'admin'

# Permissão customizada para permitir que o dono do objeto o edite
class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Admins podem ver tudo
        if request.user.tipo == 'admin':
            return True
        # O dono do agendamento (cliente) pode ver/modificar
        if isinstance(obj, Agendamento):
            return obj.cliente == request.user
        return False

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCreateSerializer
        return UsuarioSerializer

    def get_permissions(self):
        # Qualquer um pode criar um usuário (se cadastrar)
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        # Apenas admins podem listar/deletar/editar todos os usuários
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

class ServicoViewSet(viewsets.ModelViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    # Apenas admins podem modificar serviços, mas qualquer um pode ver
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        else: # list, retrieve
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()


class ProfissionalViewSet(viewsets.ModelViewSet):
    queryset = Profissional.objects.all()
    serializer_class = ProfissionalSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        else: # list, retrieve
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()

class HorarioTrabalhoViewSet(viewsets.ModelViewSet):
    queryset = HorarioTrabalho.objects.all()
    serializer_class = HorarioTrabalhoSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        else: # list, retrieve
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()


class AgendamentoViewSet(viewsets.ModelViewSet):
    serializer_class = AgendamentoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.tipo == 'admin':
            return Agendamento.objects.all()
        # Clientes só podem ver seus próprios agendamentos
        return Agendamento.objects.filter(cliente=user)

    def perform_create(self, serializer):
        # Associa o cliente logado ao novo agendamento
        serializer.save(cliente=self.request.user)

    def get_permissions(self):
        # Permissões a nível de objeto (ex: cliente só pode editar seu agendamento)
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsOwnerOrAdmin]
        # Permissões a nível de view (qualquer usuário autenticado pode listar seus agendamentos ou criar um novo)
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()