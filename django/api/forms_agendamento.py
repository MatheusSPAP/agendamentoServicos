from django import forms
from .models import Agendamento, Servico, Profissional

class AgendamentoForm(forms.ModelForm):
    servico = forms.ModelChoiceField(
        queryset=Servico.objects.all(),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    profissional = forms.ModelChoiceField(
        queryset=Profissional.objects.all(),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    data_hora = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={'type': 'datetime-local', 'class': 'form-control'}),
        input_formats=['%Y-%m-%dT%H:%M']
    )

    class Meta:
        model = Agendamento
        fields = ['servico', 'profissional', 'data_hora']
        exclude = ['cliente', 'status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Adicionar validação para garantir que o serviço e o profissional são compatíveis
        if 'profissional' in self.fields:
            self.fields['profissional'].queryset = Profissional.objects.filter(
                servicos__isnull=False
            ).distinct()