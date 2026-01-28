from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views import View
from django.views.generic import ListView
from django.contrib import messages
from django.utils import timezone
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
    
    # Obter profissionais que oferecem este serviço
    profissionais = Profissional.objects.filter(servicos=servico)
    
    context = {
        'servico': servico,
        'profissionais': profissionais
    }
    
    return render(request, 'api/agendar_servico.html', context)

@login_required
def cancelar_agendamento_cliente(request, agendamento_id):
    agendamento = get_object_or_404(Agendamento, id=agendamento_id)
    
    # Check if the logged-in user is the owner of the appointment
    if request.user != agendamento.cliente:
        messages.error(request, 'Você não tem permissão para cancelar este agendamento.')
        return redirect('web:cliente-agendamentos')
        
    if request.method == 'POST':
        # Change status to 'cancelado' instead of deleting
        agendamento.status = 'cancelado'
        agendamento.save()
        messages.success(request, 'Agendamento cancelado com sucesso.')
        return redirect('web:cliente-agendamentos')
    
    # If GET request, show a confirmation page
    return render(request, 'api/cancelar_agendamento_confirm.html', {'agendamento': agendamento})

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
@login_required
def horarios_disponiveis(request, servico_id, profissional_id):
    servico = get_object_or_404(Servico, id=servico_id)
    profissional = get_object_or_404(Profissional, id=profissional_id)
    usuario_cliente = request.user

    if request.method == 'POST':
        data_hora_str = request.POST.get('data_hora')
        if not data_hora_str:
            messages.error(request, 'Por favor, selecione um horário.')
            return redirect('web:horarios-disponiveis', servico_id=servico_id, profissional_id=profissional_id)

        try:
            # Create a naive datetime first
            data_hora_naive = datetime.fromisoformat(data_hora_str)
            # Make it timezone-aware
            data_hora = timezone.make_aware(data_hora_naive)
        except ValueError:
            messages.error(request, 'Formato de horário inválido.')
            return redirect('web:horarios-disponiveis', servico_id=servico_id, profissional_id=profissional_id)

        # Final validation before creating the appointment
        if Agendamento.objects.filter(profissional=profissional, data_hora=data_hora, status='agendado').exists():
            messages.error(request, 'Este horário foi agendado por outra pessoa. Por favor, escolha outro.')
            return redirect('web:horarios-disponiveis', servico_id=servico_id, profissional_id=profissional_id)
        
        Agendamento.objects.create(
            cliente=usuario_cliente,
            servico=servico,
            profissional=profissional,
            data_hora=data_hora,
            status='agendado'
        )
        
        messages.success(request, f'Agendamento para {servico.nome} com {profissional.nome} em {data_hora.strftime("%d/%m/%Y às %H:%M")} realizado com sucesso!')
        return redirect('web:cliente-agendamentos')

    # GET request logic
    slots_disponiveis_por_dia = {}
    hoje = timezone.now().date()
    duracao_servico = timedelta(minutes=servico.duracao_minutos)
    
    # Helper dict for weekday mapping
    weekday_map = {0: 'segunda', 1: 'terca', 2: 'quarta', 3: 'quinta', 4: 'sexta', 5: 'sabado', 6: 'domingo'}

    for i in range(7): # Check for the next 7 days
        data = hoje + timedelta(days=i)
        dia_da_semana_str = weekday_map.get(data.weekday())
        
        if not dia_da_semana_str:
            continue

        horario_trabalho = HorarioTrabalho.objects.filter(profissional=profissional, dia_semana=dia_da_semana_str).first()
        if not horario_trabalho:
            continue

        agendamentos_do_dia = Agendamento.objects.filter(
            profissional=profissional,
            data_hora__date=data,
            status='agendado'  # Consider only scheduled appointments as booked
        ).values_list('data_hora', flat=True)

        slots = []
        hora_inicio_aware = timezone.make_aware(datetime.combine(data, horario_trabalho.hora_inicio))
        hora_fim_aware = timezone.make_aware(datetime.combine(data, horario_trabalho.hora_fim))
        hora_atual = hora_inicio_aware

        while hora_atual + duracao_servico <= hora_fim_aware:
            slot_ocupado = False
            for agendamento_existente in agendamentos_do_dia:
                if hora_atual < agendamento_existente + duracao_servico and agendamento_existente < hora_atual + duracao_servico:
                    slot_ocupado = True
                    break
            
            if not slot_ocupado:
                slots.append(hora_atual)
            
            hora_atual += duracao_servico

        if slots:
            slots_disponiveis_por_dia[data] = slots

    context = {
        'servico': servico,
        'profissional': profissional,
        'slots_disponiveis_por_dia': slots_disponiveis_por_dia,
    }
    
    return render(request, 'api/horarios_disponiveis.html', context)