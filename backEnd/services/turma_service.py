from database import connect_db, close_db

def getTurmaDB(turma_id: int):
    connection = connect_db()
    cursor = connection.cursor()
    
    #Precisa adicionar um caso se ele retornar vazio
    query = "SELECT nome, professor FROM turma WHERE id = %s"
    cursor.execute(query, (turma_id,))
    nome_turma, professor = cursor.fetchone()
    
    query = "SELECT dia_semana, hora_inicio, hora_fim FROM turma_horario WHERE turma_id = %s ORDER BY dia_semana ASC, hora_inicio ASC"
    cursor.execute(query, (turma_id,))
    rows = cursor.fetchall()
    
    horarios = []
    for dia, ini, fim in rows:
        item = {
            "dia_semana": dia,
            "hora_inicio": str(ini),
            "hora_fim": str(fim),
        }
        horarios.append(item)
    """list compression nova forma de fazer também
    rows = cursor.fetchall()
        horarios = [
            {"dia_semana": d, "hora_inicio": str(ini), "hora_fim": str(fim)}
            for (d, ini, fim) in rows
        ]
    """
    
    close_db(connection)
    
    return {
        "id": turma_id,
        "nome": nome_turma,
        "professor": professor,
        "horarios": horarios,
    }

def updateTurmaDB(turma_id: id, changes: dict):
    """Update das turmas no banco de dados para realizar as mudanças. 
    
    changes(dict):
        "turma_id": id da turma para por no WHERE,
        "nome": nome da turma
        "professor": professor que pode ser o mesmo ou pode ter sido editado,
        "horarios": lista de dicionarios que entra: [{"dia_semana": 1, "hora_inicio": ini, "hora_fim": fim"}]
    """
    connection = connect_db()
    try:
        cursor = connection.cursor()

        cursor.execute(
            "UPDATE turma SET professor = %s, nome = %s WHERE id = %s",
            (changes["professor"], changes["nome"], turma_id)
        )

        cursor.execute("DELETE FROM turma_horario WHERE turma_id = %s", (turma_id,))

        query = """
            INSERT INTO turma_horario (turma_id, dia_semana, hora_inicio, hora_fim)
            VALUES (%s, %s, %s, %s)
        """

        values = [
            (turma_id, h["dia_semana"], h["hora_inicio"], h["hora_fim"])
            for h in changes.get("horarios", [])
        ]

        if values:
            cursor.executemany(query, values)

        connection.commit()
        return {"result": "sucesso"}
    except Exception:
        connection.rollback()
        raise
    finally:
        close_db(connection)

def deleteTurmaDB(turma_id: int):
    """
    delete a existing class
    
    :param turma_id: id of selected class
    """
    try:
        connection = connect_db()
        cursor = connection.cursor()
        
        query = "DELETE FROM turma WHERE id = %s"
        cursor.execute(query, (turma_id,))
        connection.commit()
        
        return {"result": "Turma deletada com sucesso!"}
    except Exception:
        raise
    finally:
        close_db(connection)

def createTurmaDB(nome: str, professor: str, horarios: list):
    """
    create a new class on database
    
    :param nome: name of the class
    :param professor: the teacher of the class(teacher need to be a existing user created by the admin on database)
    :param horarios: a list with dict to put initials horarys
    """
    
    try:
        connection = connect_db()
        cursor = connection.cursor()
        
        cursor.execute(
            """
            INSERT INTO turma (nome, professor)
            VALUES (%s, %s)
            RETURNING id
            """,
            (nome, professor)
        )
        
        turma_id = cursor.fetchone()[0]
        
        query_horario = """
            INSERT INTO turma_horario (turma_id, dia_semana, hora_inicio, hora_fim) VALUES (%s, %s, %s, %s)
        """
        
        values = [
            (turma_id, h["dia_semana"], h["hora_inicio"], h["hora_fim"])
            for h in horarios
        ]
        
        cursor.executemany(query_horario, values)
        
        connection.commit()
        
        return {
            "result": "Turma criada com sucesso",
        }
        
    except Exception:
        connection.rollback()
        raise
    finally:
        close_db(connection)