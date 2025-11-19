from django.views.generic import ListView
from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required, user_passes_test
from django.utils.decorators import method_decorator
from django.contrib.admin.views.decorators import staff_member_required
from .models import Servico, Profissional, Agendamento, Usuario
from .forms import ClienteRegistrationForm

class ClienteRegistrationView(View):
    def get(self, request):
        form = ClienteRegistrationForm()
        return render(request, 'api/cliente_registration.html', {'form': form})

    def post(self, request):
        form = ClienteRegistrationForm(request.POST)
        if form.is_valid():
            usuario = form.save()
            # Fazer login com o usuário do Django
            user_django = usuario
            login(request, user_django)
            return redirect('web:servico-list')
        return render(request, 'api/cliente_registration.html', {'form': form})


class ServicoListView(ListView):
    model = Servico
    template_name = 'api/servico_list.html'
    context_object_name = 'servicos'

class ProfissionalListView(ListView):
    model = Profissional
    template_name = 'api/profissional_list.html'
    context_object_name = 'profissionais'

# Views para administradores
@method_decorator(staff_member_required, name='dispatch')
class AdminDashboardView(View):
    def get(self, request):
        # Contadores para o painel de administração
        total_servicos = Servico.objects.count()
        total_profissionais = Profissional.objects.count()
        total_agendamentos = Agendamento.objects.count()
        # Contar apenas os usuários que têm tipo 'cliente'
        total_clientes = Usuario.objects.filter(tipo='cliente').count()

        context = {
            'total_servicos': total_servicos,
            'total_profissionais': total_profissionais,
            'total_agendamentos': total_agendamentos,
            'total_clientes': total_clientes,
        }
        return render(request, 'api/admin_dashboard.html', context)

@method_decorator(staff_member_required, name='dispatch')
class AdminServicoListView(ListView):
    model = Servico
    template_name = 'api/admin_servico_list.html'
    context_object_name = 'servicos'

@method_decorator(staff_member_required, name='dispatch')
class AdminProfissionalListView(ListView):
    model = Profissional
    template_name = 'api/admin_profissional_list.html'
    context_object_name = 'profissionais'

@method_decorator(staff_member_required, name='dispatch')
class AdminAgendamentoListView(ListView):
    model = Agendamento
    template_name = 'api/admin_agendamento_list.html'
    context_object_name = 'agendamentos'

# View para mostrar os agendamentos do cliente
@method_decorator(login_required, name='dispatch')
class ClienteAgendamentoListView(ListView):
    model = Agendamento
    template_name = 'api/cliente_agendamento_list.html'
    context_object_name = 'agendamentos'

    def get_queryset(self):
        # Pegar o usuário do Django e encontrar o Usuario correspondente
        try:
            # Apenas agendamentos do cliente logado
            return Agendamento.objects.filter(cliente=self.request.user).select_related('servico', 'profissional')
        except:
            # Se não encontrar um Usuario correspondente, retornar uma queryset vazia
            return Agendamento.objects.none()
