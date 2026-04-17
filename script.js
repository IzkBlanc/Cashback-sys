async function calcular() {
    const valor = document.getElementById("valor").value;
    const descontoInput = document.getElementById("desconto").value;
    const desconto = descontoInput / 100;
    const vip = document.getElementById("vip").checked;

    if (!valor || !descontoInput) {
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
        `Cashback: R$ ${Number(data.cashback).toFixed(2)}`;
}

async function verHistorico() {
    const response = await fetch("/historico");
    const data = await response.json();

    const historicoLista = document.getElementById("historico-lista");

    if (data.length === 0) {
        historicoLista.innerHTML = "Nenhum histórico encontrado.";
        return;
    }

    let html = "";

    data.forEach(item => {
        const descontoPercentual = item.desconto * 100;

        html += `
            <div class="history-item">
                <strong>Compra:</strong> R$ ${Number(item.valor).toFixed(2)}<br>
                <strong>Desconto:</strong> ${descontoPercentual}%<br>
                <strong>VIP:</strong> ${item.vip ? "Sim" : "Não"}<br>
                <strong>Cashback:</strong> R$ ${Number(item.cashback).toFixed(2)}<br>
                <strong>Data:</strong> ${item.data}
            </div>
        `;
    });

    historicoLista.innerHTML = html;
}