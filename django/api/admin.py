from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Servico, Profissional, HorarioTrabalho, Agendamento

# Para exibir campos customizados do nosso modelo de usuário
class CustomUserAdmin(UserAdmin):
    model = Usuario
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('telefone', 'tipo')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('telefone', 'tipo')}),
    )

admin.site.register(Usuario, CustomUserAdmin)
admin.site.register(Servico)
admin.site.register(Profissional)
admin.site.register(HorarioTrabalho)
admin.site.register(Agendamento)
