FROM python:3.11

# Define diretório de trabalho


WORKDIR /app


# Evita prompts interativos ao ins\\\\\\talar pacotes
ENV DEBIAN_FRONTEND=noninteractive


# Copia apenas o requirements.txt para usar cache
COPY requirements.txt .

# Instala as dependências Python sem cache de pip
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copia o restante do código do projeto

COPY main.py .
COPY app ./app


# Expõe a porta da aplicação
EXPOSE 10000

# Comando para iniciar o servidor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]