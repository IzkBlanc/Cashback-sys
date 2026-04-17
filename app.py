from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import os

from logicaCashback import calcular_cashback

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)


def conectar_db():
    return mysql.connector.connect(
        host=os.getenv("MYSQLHOST", "localhost"),
        user=os.getenv("MYSQLUSER", "root"),
        password=os.getenv("MYSQLPASSWORD", ""),
        database=os.getenv("MYSQLDATABASE", "cashback_db"),
        port=int(os.getenv("MYSQLPORT", 3306))
    )


def obter_ip_cliente():
    ip = request.headers.get("X-Forwarded-For", request.remote_addr)

    if ip and "," in ip:
        ip = ip.split(",")[0].strip()

    return ip


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/calcular", methods=["POST"])
def calcular():
    data = request.json

    try:
        valor = float(data["valor"])
        desconto = float(data["desconto"])
        vip = data["vip"]
    except (KeyError, ValueError, TypeError):
        return jsonify({"erro": "Dados inválidos"}), 400

    resultado = calcular_cashback(valor, desconto, vip)
    ip = obter_ip_cliente()

    conexao = conectar_db()
    cursor = conexao.cursor()

    sql = """
    INSERT INTO historico (ip, valor, desconto, vip, cashback, data)
    VALUES (%s, %s, %s, %s, %s, NOW())
    """

    cursor.execute(sql, (ip, valor, desconto, vip, resultado))
    conexao.commit()

    cursor.close()
    conexao.close()

    return jsonify({"cashback": resultado})


@app.route("/historico", methods=["GET"])
def historico():
    ip = obter_ip_cliente()

    conexao = conectar_db()
    cursor = conexao.cursor()

    sql = """
    SELECT valor, desconto, vip, cashback, data
    FROM historico
    WHERE ip = %s
    ORDER BY data DESC
    """

    cursor.execute(sql, (ip,))
    resultados = cursor.fetchall()

    cursor.close()
    conexao.close()

    historico_lista = []

    for linha in resultados:
        historico_lista.append({
            "valor": linha[0],
            "desconto": linha[1],
            "vip": bool(linha[2]),
            "cashback": linha[3],
            "data": str(linha[4])
        })

    return jsonify(historico_lista)


@app.route("/script.js")
def servir_js():
    return send_from_directory(".", "script.js")


@app.route("/style.css")
def servir_css():
    return send_from_directory(".", "style.css")


if __name__ == "__main__":
    app.run(debug=True)