from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views import View
from django.views.generic import ListView
from django.contrib import messages
from datetime import datetime, timedelta
from .models import Agendamento, Servico, Profissional, HorarioTrabalho
from .forms_agendamento import AgendamentoForm
from .models import Usuario

class AgendamentoCreateView(View):
    template_name = 'api/agendamento_form.html'
    
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect('web:login')
        
        usuario_cliente = request.user
        
        form = AgendamentoForm()
        servicos = Servico.objects.all()
        profissionais = Profissional.objects.all()
        
        context = {
            'form': form,
            'servicos': servicos,
            'profissionais': profissionais,
        }
        return render(request, self.template_name, context)
    
    def post(self, request):
        if not request.user.is_authenticated:
            return redirect('web:login')
        
        usuario_cliente = request.user
        
        form = AgendamentoForm(request.POST)
        if form.is_valid():
            agendamento = form.save(commit=False)
            agendamento.cliente = usuario_cliente
            agendamento.status = 'agendado'
            
            # Verificar se já existe um agendamento para o mesmo profissional, data e horário
            if Agendamento.objects.filter(
                profissional=agendamento.profissional,
                data_hora=agendamento.data_hora
            ).exists():
                messages.error(request, 'Já existe um agendamento para este profissional neste horário.')
                return render(request, self.template_name, {'form': form})
            
            agendamento.save()
            messages.success(request, 'Agendamento realizado com sucesso!')
            return redirect('web:cliente-agendamentos')
        else:
            servicos = Servico.objects.all()
            profissionais = Profissional.objects.all()
            context = {
                'form': form,
                'servicos': servicos,
                'profissionais': profissionais,
            }
            return render(request, self.template_name, context)

@login_required
def agendar_servico(request, servico_id):
    servico = get_object_or_404(Servico, id=servico_id)
    
    try:
        usuario_cliente = request.user.usuario_custom
    except Usuario.DoesNotExist:
        messages.error(request, 'Você precisa estar registrado como cliente para agendar um serviço.')
        return redirect('web:servico-list')
    
    if request.method == 'POST':
        profissional_id = request.POST.get('profissional')
        data_hora_str = request.POST.get('data_hora')
        
        try:
            profissional = get_object_or_404(Profissional, id=profissional_id)
            data_hora = datetime.strptime(data_hora_str, '%Y-%m-%dT%H:%M')
            
            # Verificar se o profissional oferece o serviço
            if servico not in profissional.servicos.all():
                messages.error(request, 'Este profissional não oferece este serviço.')
                return redirect('web:agendar-servico', servico_id=servico_id)
            
            # Verificar se já existe um agendamento para o mesmo profissional, data e horário
            if Agendamento.objects.filter(
                profissional=profissional,
                data_hora=data_hora
            ).exists():
                messages.error(request, 'Já existe um agendamento para este profissional neste horário.')
                return redirect('web:agendar-servico', servico_id=servico_id)
            
            # Criar o agendamento
            agendamento = Agendamento.objects.create(
                cliente=usuario_cliente,
                servico=servico,
                profissional=profissional,
                data_hora=data_hora,
                status='agendado'
            )
            
            messages.success(request, 'Agendamento realizado com sucesso!')
            return redirect('web:cliente-agendamentos')
        
        except ValueError:
            messages.error(request, 'Formato de data/hora inválido.')
    
    # Obter profissionais que oferecem este serviço
    profissionais = Profissional.objects.filter(servicos=servico)
    
    context = {
        'servico': servico,
        'profissionais': profissionais
    }
    
    return render(request, 'api/agendar_servico.html', context)

@method_decorator(staff_member_required, name='dispatch')
class AgendamentoUpdateView(View):
    template_name = 'api/agendamento_update.html'
    
    def get(self, request, pk):
        agendamento = get_object_or_404(Agendamento, pk=pk)
        form = AgendamentoForm(instance=agendamento)
        
        context = {
            'form': form,
            'agendamento': agendamento
        }
        return render(request, self.template_name, context)
    
    def post(self, request, pk):
        agendamento = get_object_or_404(Agendamento, pk=pk)
        form = AgendamentoForm(request.POST, instance=agendamento)
        
        if form.is_valid():
            form.save()
            messages.success(request, 'Agendamento atualizado com sucesso!')
            return redirect('web:admin-agendamentos')
        
        context = {
            'form': form,
            'agendamento': agendamento
        }
        return render(request, self.template_name, context)

@method_decorator(staff_member_required, name='dispatch')
class AgendamentoDeleteView(View):
    def post(self, request, pk):
        agendamento = get_object_or_404(Agendamento, pk=pk)
        agendamento.delete()
        messages.success(request, 'Agendamento cancelado com sucesso!')
        return redirect('web:admin-agendamentos')

# View para listar os horários disponíveis de um profissional
def horarios_disponiveis(request, profissional_id):
    profissional = get_object_or_404(Profissional, id=profissional_id)
    
    # Obter os horários de trabalho do profissional
    horarios_trabalho = HorarioTrabalho.objects.filter(profissional=profissional)
    
    # Calcular os próximos 7 dias
    datas = []
    hoje = datetime.now().date()
    for i in range(7):
        data = hoje + timedelta(days=i)
        datas.append(data)
    
    context = {
        'profissional': profissional,
        'horarios_trabalho': horarios_trabalho,
        'datas': datas
    }
    
    return render(request, 'api/horarios_disponiveis.html', context)