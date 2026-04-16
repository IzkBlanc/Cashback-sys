async function calcular() {
    const valor = document.getElementById("valor").value;
    const desconto = document.getElementById("desconto").value / 100;
    const vip = document.getElementById("vip").checked;

    if (!valor || !document.getElementById("desconto").value) {
        alert("Preencha os campos.");
        return;
    }

    const response = await fetch("/calcular", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            valor: valor,
            desconto: desconto,
            vip: vip
        })
    });

    const data = await response.json();

    if (data.erro) {
        document.getElementById("resultado").innerText = data.erro;
        return;
    }

    document.getElementById("resultado").innerText =
        "Cashback: R$ " + data.cashback;
}

async function verHistorico() {
    const response = await fetch("/historico");
    const data = await response.json();

    let texto = "";

    if (data.length === 0) {
        texto = "Nenhum histórico encontrado.";
    } else {
        data.forEach(item => {
            const descontoPercentual = item.desconto * 100;
            texto += `Compra: R$ ${item.valor} | Desconto: ${descontoPercentual}% | VIP: ${item.vip ? "Sim" : "Não"} | Cashback: R$ ${item.cashback} | Data: ${item.data}<br>`;
        });
    }

    document.getElementById("resultado").innerHTML = texto;
}