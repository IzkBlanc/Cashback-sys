def calcular_cashback(valorBruto, desconto, clt_vip):
    valor_final = valorBruto * (1 - desconto)
    cashback = valor_final * 0.05

    if clt_vip:
        cashback += cashback * 0.10

    if valor_final > 500:
        cashback *= 2

    return round(cashback, 2)