from django.views.generic import ListView
from .models import Servico, Profissional

class ServicoListView(ListView):
    model = Servico
    template_name = 'api/servico_list.html'
    context_object_name = 'servicos'

class ProfissionalListView(ListView):
    model = Profissional
    template_name = 'api/profissional_list.html'
    context_object_name = 'profissionais'
