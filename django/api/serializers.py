from rest_framework import serializers
from .models import Usuario, Servico, Profissional, HorarioTrabalho, Agendamento

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'telefone', 'tipo']

class UsuarioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'telefone', 'tipo']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            telefone=validated_data.get('telefone'),
            tipo=validated_data.get('tipo', 'cliente')
        )
        return user

class ServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servico
        fields = '__all__'

class ProfissionalSerializer(serializers.ModelSerializer):
    servicos = serializers.PrimaryKeyRelatedField(queryset=Servico.objects.all(), many=True)

    class Meta:
        model = Profissional
        fields = ['id', 'nome', 'especialidade', 'servicos']

class HorarioTrabalhoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioTrabalho
        fields = '__all__'

class AgendamentoSerializer(serializers.ModelSerializer):
    # Usando serializers aninhados para leitura para fornecer mais detalhes
    cliente = UsuarioSerializer(read_only=True)
    profissional = ProfissionalSerializer(read_only=True)
    servico = ServicoSerializer(read_only=True)

    # Usando campos de chave primária para escrita para simplificar a criação/atualização
    cliente_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), source='cliente', write_only=True
    )
    profissional_id = serializers.PrimaryKeyRelatedField(
        queryset=Profissional.objects.all(), source='profissional', write_only=True
    )
    servico_id = serializers.PrimaryKeyRelatedField(
        queryset=Servico.objects.all(), source='servico', write_only=True
    )

    class Meta:
        model = Agendamento
        fields = [
            'id', 'cliente', 'profissional', 'servico', 'data_hora', 'status',
            'cliente_id', 'profissional_id', 'servico_id'
        ]
        read_only_fields = ['cliente', 'profissional', 'servico']

    def to_representation(self, instance):
        """ Personaliza a representação para leitura. """
        representation = super().to_representation(instance)
        # Remove os campos _id da representação de leitura para evitar redundância
        representation.pop('cliente_id', None)
        representation.pop('profissional_id', None)
        representation.pop('servico_id', None)
        return representation
