import React, { useState, useRef } from 'react';
import './FAQ.css'


const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const answerRefs = useRef([]);

  const faqData = [
    { question: "O que devo vestir para aventuras?", answer: "Use roupas confortáveis e sapatos fechados para segurança." },
    { question: "Iniciantes podem participar de passeios de quadriciclo?", answer: "Sim, temos passeios adequados para iniciantes." },
    { question: "Vocês fornecem equipamentos de segurança para paintball?", answer: "Sim, todo o equipamento de segurança é fornecido." },
    { question: "Os pacotes de grupo estão disponíveis para reserva?", answer: "Sim, oferecemos pacotes para grupos de vários tamanhos." },
    { question: "Qual é a vossa política de cancelamento de reservas?", answer: "Cancelamentos são aceitos até 48 horas antes da reserva." },
    { question: "É necessário reservar com antecedência?", answer: "Sim, recomendamos reservar com antecedência para garantir disponibilidade." },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      {faqData.map((item, index) => (
        <div key={index} className="faq-item">
          <div className="faq-question" onClick={() => toggleFAQ(index)}>
            {item.question}
            <span>{activeIndex === index ? '-' : '+'}</span>
          </div>
          <div
            className="faq-answer"
            ref={el => answerRefs.current[index] = el}
            style={{
              maxHeight: activeIndex === index ? `${answerRefs.current[index].scrollHeight}px` : '0px',
              transition: 'max-height 0.5s ease',
              overflow: 'hidden'
            }}
          >
            {item.answer}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;
