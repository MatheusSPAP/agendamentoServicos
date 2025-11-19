from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.views import View
from django.contrib.auth.forms import AuthenticationForm

class LoginView(View):
    def get(self, request):
        form = AuthenticationForm()
        return render(request, 'api/login.html', {'form': form})

    def post(self, request):
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                # Redirecionar com base no tipo de usuário
                if user.tipo == 'admin':
                    return redirect('web:admin-dashboard')
                else:
                    return redirect('web:servico-list')
            else:
                messages.error(request, 'Credenciais inválidas.')
        else:
            messages.error(request, 'Erro no formulário de login.')
        return render(request, 'api/login.html', {'form': form})

class LogoutView(View):
    def get(self, request):
        from django.contrib.auth import logout
        logout(request)
        return redirect('web:servico-list')