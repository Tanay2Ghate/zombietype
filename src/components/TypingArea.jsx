import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Keyboard } from 'lucide-react';

export default function TypingArea({
  words,
  currentWordIndex,
  typedWord,
  typedHistory,
  isActive,
  isFinished,
  onWordComplete,
  onWordBackspace,
  onCharTyped,
  onStartTest
}) {
  const [isFocused, setIsFocused] = useState(true);
  const [caretStyle, setCaretStyle] = useState({ left: '0px', top: '0px' });
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isBlinking, setIsBlinking] = useState(true);
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Autofocus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Sync caret blink state
  useEffect(() => {
    setIsBlinking(true);
    const timeout = setTimeout(() => setIsBlinking(false), 500);
    return () => clearTimeout(timeout);
  }, [typedWord, currentWordIndex]);

  // Adjust caret position and scroll offset
  useLayoutEffect(() => {
    if (isFinished) return;
    
    const container = containerRef.current;
    if (!container) return;

    const activeWordEl = container.querySelector('.word.active-word');
    if (!activeWordEl) return;

    const letters = activeWordEl.querySelectorAll('.letter');
    let caretX = activeWordEl.offsetLeft;
    let caretY = activeWordEl.offsetTop;

    if (typedWord.length < letters.length) {
      const activeLetterEl = letters[typedWord.length];
      if (activeLetterEl) {
        caretX = activeWordEl.offsetLeft + activeLetterEl.offsetLeft;
        caretY = activeWordEl.offsetTop + activeLetterEl.offsetTop;
      }
    } else {
      const lastLetterEl = letters[letters.length - 1];
      if (lastLetterEl) {
        caretX = activeWordEl.offsetLeft + lastLetterEl.offsetLeft + lastLetterEl.offsetWidth;
        caretY = activeWordEl.offsetTop + lastLetterEl.offsetTop;
      }
    }

    setCaretStyle({
      left: `${caretX}px`,
      top: `${caretY + 4}px` // center caret vertically a bit
    });

    // Handle scroll alignment:
    // Active line top offset relative to the scrolling wrapper
    // Standard row height is roughly 35-40px (2.2rem + margin)
    // If offsetTop is greater than 35px, scroll up by translating
    const lineThreshold = 35;
    if (caretY > lineThreshold) {
      setScrollOffset(-(caretY - lineThreshold));
    } else {
      setScrollOffset(0);
    }
  }, [typedWord, currentWordIndex, isFinished]);

  // Focus tracking
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  
  const triggerFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Keyboard shortcut listener to auto-focus when key is pressed
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (isFinished) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === 'Tab' || e.key === 'Escape' || e.key === 'Enter') return;
      
      if (!isFocused && inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFocused, isFinished]);

  // Input events
  const handleKeyDown = (e) => {
    if (isFinished) return;

    // Detect first typing character to start the test
    if (!isActive && !isFinished && e.key.length === 1) {
      onStartTest();
    }

    if (e.key === ' ') {
      e.preventDefault();
      // Only proceed to next word if there is typed content
      if (typedWord.length > 0) {
        onWordComplete(typedWord);
      }
    } else if (e.key === 'Backspace') {
      if (typedWord === '' && currentWordIndex > 0) {
        e.preventDefault();
        onWordBackspace();
      }
    }
  };

  const handleChange = (e) => {
    if (isFinished) return;
    
    const value = e.target.value;
    // Don't allow spaces directly in input value (should be caught by onKeyDown)
    if (value.endsWith(' ')) return;
    
    onCharTyped(value);
  };

  return (
    <div 
      className="typing-container glass-panel"
      onClick={triggerFocus}
      ref={containerRef}
    >
      {/* Focus Overlay */}
      <div className={`focus-overlay ${!isFocused && !isFinished ? 'active' : ''}`}>
        <Keyboard size={36} className="focus-icon" />
        <span className="focus-text">Click here or press any key to focus</span>
      </div>

      {/* Secret Input */}
      <input
        ref={inputRef}
        type="text"
        className="secret-input"
        value={typedWord}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Words Box */}
      <div className="words-wrapper">
        <div 
          className="words-content" 
          style={{ transform: `translateY(${scrollOffset}px)` }}
        >
          {/* Caret */}
          {!isFinished && isFocused && (
            <div 
              className={`caret ${isBlinking ? 'blinking' : ''}`} 
              style={caretStyle}
            />
          )}

          {words.map((word, wIdx) => {
            const isActiveWord = wIdx === currentWordIndex;
            const hasBeenTyped = wIdx < currentWordIndex;
            const userWord = hasBeenTyped ? typedHistory[wIdx] : (isActiveWord ? typedWord : '');

            // Form list of characters
            const letters = [];
            const maxLength = Math.max(word.length, userWord.length);

            for (let i = 0; i < maxLength; i++) {
              const targetChar = word[i];
              const typedChar = userWord[i];

              let charClass = 'untyped';
              if (typedChar !== undefined) {
                if (targetChar === undefined) {
                  charClass = 'extra';
                } else if (typedChar === targetChar) {
                  charClass = 'correct';
                } else {
                  charClass = 'incorrect';
                }
              }

              letters.push(
                <span 
                  key={i} 
                  className={`letter ${charClass}`}
                >
                  {targetChar || typedChar}
                </span>
              );
            }

            return (
              <span 
                key={wIdx} 
                className={`word ${isActiveWord ? 'active-word' : ''}`}
              >
                {letters}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
