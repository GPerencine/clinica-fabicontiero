export const agruparClientes = (agendamentos, busca, filtroStatus) => {
  const map = new Map();
  const statusPriority = {
    'Pendente': 1,
    'Confirmado': 2,
    'Finalizado': 3,
    'Cancelado': 4
  };

  agendamentos.forEach(ag => {
    const whats = ag.whatsapp || "";
    if (!map.has(whats)) {
      map.set(whats, {
         nome: ag.nome,
         whatsapp: whats,
         agendamentos: [],
         ultimoProcedimento: null,
         statusPrioritario: 'Finalizado' // Default low priority
      });
    }
    const clienteGroup = map.get(whats);
    clienteGroup.agendamentos.push(ag);

    if (!clienteGroup.ultimoProcedimento || new Date(ag.dataCriacao) > new Date(clienteGroup.ultimoProcedimento.dataCriacao)) {
        clienteGroup.ultimoProcedimento = ag;
    }

    const currentStatus = ag.status || 'Pendente';
    const currentPriority = statusPriority[currentStatus] || 5;
    const existingPriority = statusPriority[clienteGroup.statusPrioritario] || 5;

    if (currentPriority < existingPriority) {
        clienteGroup.statusPrioritario = currentStatus;
    }
  });

  return Array.from(map.values()).filter(c => {
     const termo = busca.toLowerCase();
     const matchesBusca = c.nome?.toLowerCase().includes(termo) || c.whatsapp.includes(termo);
     const matchesStatus = filtroStatus === 'Todos' || c.agendamentos.some(a => a.status === filtroStatus);
     return matchesBusca && matchesStatus;
  });
};

export const calcularMetricas = (agendamentos, periodoFiltro, servicosDisponiveis) => {
  const statusCount = { Pendente: 0, Confirmado: 0, Finalizado: 0, Cancelado: 0 };
  const servicoCount = {};
  let agendamentosFiltrados = [];
  let faturamentoTotal = 0;
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  agendamentos.forEach(ag => {
    const dataAg = new Date(ag.dataCriacao);
    let matchesPeriodo = true;

    if (periodoFiltro === 'Hoje') {
      const d = new Date(dataAg);
      d.setHours(0, 0, 0, 0);
      matchesPeriodo = d.getTime() === hoje.getTime();
    } else if (periodoFiltro === '7') {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(hoje.getDate() - 7);
      matchesPeriodo = dataAg >= seteDiasAtras;
    } else if (periodoFiltro === '30') {
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(hoje.getDate() - 30);
      matchesPeriodo = dataAg >= trintaDiasAtras;
    }

    if (matchesPeriodo) {
      agendamentosFiltrados.push(ag);
      const statusKey = ag.status || 'Pendente';
      if (statusCount[statusKey] !== undefined) {
        statusCount[statusKey]++;
      }
      
      if (ag.queixa) {
        servicoCount[ag.queixa] = (servicoCount[ag.queixa] || 0) + 1;
      }

      if (statusKey === 'Finalizado') {
        const servicoRef = servicosDisponiveis.find(s => s.titulo === ag.queixa);
        if (servicoRef?.preco) {
          faturamentoTotal += servicoRef.preco;
        }
      }
    }
  });

  const ticketMedio = statusCount.Finalizado > 0 ? faturamentoTotal / statusCount.Finalizado : 0;

  return { 
    statusCount, 
    servicoCount, 
    faturamentoTotal, 
    ticketMedio,
    totalNoPeriodo: agendamentosFiltrados.length 
  };
};

export const formatWhatsApp = (num) => {
  if (!num || num === "N/A") return num;
  const cleaned = num.replaceAll(/\D/g, '');
  if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return num;
};

export const abrirWhatsAppAction = (numero, nome, procedimento) => {
    if(!numero || numero === "N/A") return { error: "Número não encontrado" };
    
    const fone = numero.replaceAll(/\D/g, '');
    const mensagem = encodeURIComponent(
        `Olá ${nome}! Aqui é da clínica Fabi Contiero. Recebemos seu interesse em *${procedimento}* pelo nosso site. Gostaria de agendar seu horário?`
    );
    
    window.open(`https://wa.me/55${fone}?text=${mensagem}`, '_blank');
    return { success: true };
};
