import psycopg2

def connect_db():
    connect = psycopg2.connect(
        user="postgres",
        password="123",
        host="localhost",
        port="5432",
        database="fightGymManager",
    )
    return connect

def close_db(connection):
    if connection:
        connection.close()