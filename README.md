    docker run -d \
          --name exchange-db \
          -e POSTGRES_USER=user \
          -e POSTGRES_PASSWORD=pass \
          -e POSTGRES_DB=exchange \
          -p 5432:5432 \
          -v exchange-data:/var/lib/postgresql/data \
          postgres:16
