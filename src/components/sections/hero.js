import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled, { keyframes } from 'styled-components';
import { navDelay, loaderDelay } from '@utils';
import { usePrefersReducedMotion } from '@hooks';
import HeroCanvas from '@components/HeroCanvas';

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const WORDS = ['Software Engineer', 'Data Engineer', 'Product Builder', 'ML Enthusiast'];
const TYPE_SPEED = 80;
const DELETE_SPEED = 45;
const PAUSE_TYPED = 1800;
const PAUSE_DELETED = 400;

const StyledHeroSection = styled.section`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  align-items: flex-start;
  min-height: 100vh;
  padding: 0;
  position: relative;

  @media (max-width: 480px) and (min-height: 700px) {
    padding-bottom: 10vh;
  }

  .hero-greeting {
    margin: 0 0 20px 4px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: clamp(var(--fz-sm), 5vw, var(--fz-md));
    font-weight: 400;

    @media (max-width: 480px) {
      margin: 0 0 16px 2px;
    }
  }

  h2.big-heading {
    font-size: clamp(28px, 5.5vw, 56px);
  }

  h3.big-heading {
    font-size: clamp(22px, 4.5vw, 46px);
    margin-top: 4px;
    color: var(--slate);
    line-height: 1.1;
    min-height: 1.2em;
  }

  p {
    margin: 20px 0 0;
    max-width: 480px;
    color: var(--slate);
    font-size: var(--fz-lg);
    line-height: 1.6;
  }

  .email-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 40px;
  }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 3px;
  height: 0.85em;
  background-color: var(--green);
  margin-left: 3px;
  vertical-align: middle;
  border-radius: 1px;
  animation: ${blink} 0.75s step-end infinite;
`;

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const [displayText, setDisplayText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState('typing');

  useEffect(() => {
    if (prefersReducedMotion) {return;}
    const timeout = setTimeout(() => setIsMounted(true), navDelay);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isMounted || prefersReducedMotion) {return;}
    const word = WORDS[wordIdx % WORDS.length];

    if (phase === 'typing') {
      if (displayText.length < word.length) {
        const t = setTimeout(
          () => setDisplayText(word.slice(0, displayText.length + 1)),
          TYPE_SPEED,
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('deleting'), PAUSE_TYPED);
      return () => clearTimeout(t);
    }

    if (phase === 'deleting') {
      if (displayText.length > 0) {
        const t = setTimeout(() => setDisplayText(d => d.slice(0, -1)), DELETE_SPEED);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        setWordIdx(i => i + 1);
        setPhase('typing');
      }, PAUSE_DELETED);
      return () => clearTimeout(t);
    }
  }, [displayText, phase, wordIdx, isMounted, prefersReducedMotion]);

  const one = <p className="hero-greeting">Hi, my name is</p>;

  const two = <h2 className="big-heading">Chinmay Mishra.</h2>;

  const three = (
    <h3 className="big-heading">
      {prefersReducedMotion ? WORDS[0] : displayText}
      {!prefersReducedMotion && <Cursor aria-hidden="true" />}
    </h3>
  );

  const four = (
    <p>
      Software engineer & data enthusiast pursuing Engineering Management at{' '}
      <a href="https://northeastern.edu" target="_blank" rel="noreferrer">
        Northeastern
      </a>
      . I build scalable pipelines, lead agile teams, and ship data-driven products — most recently
      at{' '}
      <a href="https://www2.deloitte.com" target="_blank" rel="noreferrer">
        Deloitte
      </a>
      .
    </p>
  );

  const five = (
    <a className="email-link" href="mailto:chinmay.neu@gmail.com" target="_blank" rel="noreferrer">
      Get In Touch
    </a>
  );

  const items = [one, two, three, four, five];

  return (
    <StyledHeroSection>
      <HeroCanvas />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '540px' }}>
        {prefersReducedMotion ? (
          <>
            {items.map((item, i) => (
              <div key={i}>{item}</div>
            ))}
          </>
        ) : (
          <TransitionGroup component={null}>
            {isMounted &&
              items.map((item, i) => (
                <CSSTransition key={i} classNames="fadeup" timeout={loaderDelay}>
                  <div style={{ transitionDelay: `${i + 1}00ms` }}>{item}</div>
                </CSSTransition>
              ))}
          </TransitionGroup>
        )}
      </div>
    </StyledHeroSection>
  );
};

export default Hero;
