from django.urls import path
from .views_web import ServicoListView

app_name = 'web'

urlpatterns = [
    path('', ServicoListView.as_view(), name='servico-list'),
]
