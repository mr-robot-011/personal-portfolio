import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
`;

const typing = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%           { transform: scale(1);   opacity: 1; }
`;

const StyledWrapper = styled.div`
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  font-family: var(--font-sans);
`;

const StyledToggle = styled.button`
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: var(--green);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  transition: var(--transition);
  animation: ${({ $pulse }) =>
    $pulse
      ? css`
          ${pulse} 1.8s ease-in-out 3
        `
      : 'none'};

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 28px rgba(0, 0, 0, 0.45);
  }

  svg {
    width: 24px;
    height: 24px;
    fill: var(--navy);
  }
`;

const StyledWindow = styled.div`
  position: absolute;
  bottom: 66px;
  right: 0;
  width: 340px;
  max-height: 480px;
  background: var(--light-navy);
  border: 1px solid var(--lightest-navy);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
  animation: ${fadeIn} 0.25s ease forwards;
  overflow: hidden;

  @media (max-width: 420px) {
    width: calc(100vw - 40px);
    right: 0;
  }
`;

const StyledHeader = styled.div`
  padding: 14px 16px;
  background: var(--navy);
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--lightest-navy);

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--green);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .info {
    flex: 1;

    .name {
      color: var(--lightest-slate);
      font-size: var(--fz-sm);
      font-weight: 600;
    }

    .status {
      color: var(--green);
      font-size: var(--fz-xxs);
      font-family: var(--font-mono);
    }
  }

  button {
    background: none;
    border: none;
    color: var(--slate);
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 2px;
    transition: color 0.2s;

    &:hover {
      color: var(--lightest-slate);
    }
  }
`;

const StyledMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: var(--lightest-navy) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--lightest-navy);
    border-radius: 2px;
  }
`;

const StyledMessage = styled.div`
  display: flex;
  justify-content: ${({ $user }) => ($user ? 'flex-end' : 'flex-start')};

  .bubble {
    max-width: 82%;
    padding: 9px 13px;
    border-radius: ${({ $user }) => ($user ? '14px 14px 4px 14px' : '14px 14px 14px 4px')};
    background: ${({ $user }) => ($user ? 'var(--green)' : 'var(--navy)')};
    color: ${({ $user }) => ($user ? 'var(--navy)' : 'var(--light-slate)')};
    font-size: var(--fz-xs);
    line-height: 1.55;
    word-break: break-word;
  }
`;

const StyledTyping = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 13px;
  background: var(--navy);
  border-radius: 14px 14px 14px 4px;
  width: fit-content;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--slate);
    display: inline-block;
    animation: ${typing} 1.2s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`;

const StyledChips = styled.div`
  padding: 0 12px 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const StyledChip = styled.button`
  background: transparent;
  border: 1px solid var(--green);
  color: var(--green);
  border-radius: 20px;
  padding: 5px 12px;
  font-size: var(--fz-xxs);
  font-family: var(--font-mono);
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;

  &:hover {
    background: var(--green-tint);
  }
`;

const StyledInput = styled.div`
  padding: 10px 12px;
  border-top: 1px solid var(--lightest-navy);
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    background: var(--navy);
    border: 1px solid var(--lightest-navy);
    border-radius: 20px;
    padding: 8px 14px;
    color: var(--lightest-slate);
    font-size: var(--fz-xs);
    font-family: var(--font-sans);
    outline: none;
    transition: border-color 0.2s;

    &::placeholder {
      color: var(--dark-slate);
    }
    &:focus {
      border-color: var(--green);
    }
  }

  button {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--green);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: var(--transition);

    &:hover {
      opacity: 0.85;
    }

    svg {
      width: 15px;
      height: 15px;
      fill: var(--navy);
    }
  }
`;

const QUICK_REPLIES = ['About Chinmay', 'Skills', 'Projects', 'Experience', 'Contact'];

const BOT_REPLIES = {
  'about chinmay': `Hi! I'm Chinmay Mishra — a software & data engineer pursuing a Master's in Engineering Management at Northeastern University. I love building scalable systems, data pipelines, and shipping products that matter.`,
  skills: `Core skills:\n• Languages: Python, JavaScript, SQL, Java\n• Frontend: React, Gatsby, Next.js\n• Backend: Node.js, Django, FastAPI\n• Data: Spark, Airflow, dbt, Pandas\n• Cloud: AWS, GCP, Azure\n• Tools: Docker, Git, Tableau`,
  projects: `Some of my work:\n• US Housing Cost Burden Analysis — interactive D3/Plotly dashboard\n• Django Chat App — real-time messaging\n• Flight Price Predictor — ML regression model\n• Salary Predictor — data science project\n\nCheck the Work section above for full details!`,
  experience: `Most recently at Deloitte as a Software/Data Engineer — building data pipelines, leading agile sprints, and shipping data-driven products at scale. Currently at Northeastern pursuing Engineering Management.`,
  contact: `Best way to reach me:\n📧 chinmay.neu@gmail.com\n\nOr hit the "Get In Touch" button on the hero section — I try to respond within 24 hours!`,
};

function getBotReply(input) {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(BOT_REPLIES)) {
    if (lower.includes(key) || key.split(' ').some(w => lower.includes(w))) {
      return val;
    }
  }
  return `Good question! Feel free to reach out directly at chinmay.neu@gmail.com — I'd love to connect. You can also browse the sections above to learn more about my work.`;
}

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: `Hey there! 👋 I'm Chinmay's assistant. Ask me anything about his skills, projects, or experience!`,
      bot: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPulsing(true), 3000);
    const t2 = setTimeout(() => {
      setOpen(true);
      setPulsing(false);
    }, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = text => {
    const msg = text || input.trim();
    if (!msg) {return;}
    setInput('');
    setMessages(prev => [...prev, { text: msg, bot: false }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { text: getBotReply(msg), bot: true }]);
    }, 900 + Math.random() * 500);
  };

  const handleKey = e => {
    if (e.key === 'Enter') {sendMessage();}
  };

  return (
    <StyledWrapper>
      {open && (
        <StyledWindow>
          <StyledHeader>
            <div className="avatar">💼</div>
            <div className="info">
              <div className="name">Chinmay's Assistant</div>
              <div className="status">● online</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </StyledHeader>

          <StyledMessages>
            {messages.map((m, i) => (
              <StyledMessage key={i} $user={!m.bot}>
                <div className="bubble" style={{ whiteSpace: 'pre-line' }}>
                  {m.text}
                </div>
              </StyledMessage>
            ))}
            {isTyping && (
              <StyledTyping>
                <span />
                <span />
                <span />
              </StyledTyping>
            )}
            <div ref={messagesEndRef} />
          </StyledMessages>

          <StyledChips>
            {QUICK_REPLIES.map(q => (
              <StyledChip key={q} onClick={() => sendMessage(q)}>
                {q}
              </StyledChip>
            ))}
          </StyledChips>

          <StyledInput>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              aria-label="Chat input"
            />
            <button onClick={() => sendMessage()} aria-label="Send">
              <svg viewBox="0 0 24 24">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </StyledInput>
        </StyledWindow>
      )}

      <StyledToggle onClick={() => setOpen(o => !o)} $pulse={pulsing} aria-label="Toggle chat">
        {open ? (
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        )}
      </StyledToggle>
    </StyledWrapper>
  );
};

export default ChatBot;
