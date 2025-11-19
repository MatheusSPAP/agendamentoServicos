from django.contrib import admin
from .models import Usuario, Servico, Profissional, HorarioTrabalho, Agendamento

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Servico, Profissional, HorarioTrabalho, Agendamento

class CustomUserAdmin(UserAdmin):
    model = Usuario
    ordering = ('email',)
    # Add custom fields to the admin display
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'tipo', 'telefone')
    # Add custom fields to the fieldsets
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Info', {'fields': ('tipo', 'telefone')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Info', {'fields': ('tipo', 'telefone')}),
    )

admin.site.register(Usuario, CustomUserAdmin)
admin.site.register(Servico)
admin.site.register(Profissional)
admin.site.register(HorarioTrabalho)
admin.site.register(Agendamento)

