import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import API_BASE_URL from '../config';

// AUDIO FILES
const SUCCESS_SOUND = new Audio('/success.mp3');
const FAIL_SOUND = new Audio('/fail.mp3');
const LEVEL_UP_SOUND = new Audio('/levelup.mp3');
const WRONG_SOUND = new Audio('/wrong.mp3');

const ColorMatchGame = ({ learner, onBack }) => {
  // --- STATE ---
  // Added 'FULLSCREEN_PROMPT' to the flow
  const [gameState, setGameState] = useState('IDLE'); 
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);       
  const [levelScore, setLevelScore] = useState(0); 
  const [round, setRound] = useState(1);       
  
  const [targetColor, setTargetColor] = useState(null);
  const [message, setMessage] = useState("Press Start to Begin");
  
  // --- TIMERS ---
  const [totalSeconds, setTotalSeconds] = useState(0); 
  const [levelTimeLeft, setLevelTimeLeft] = useState(300); 
  const [roundTimeLeft, setRoundTimeLeft] = useState(null); 
  const [roundStartTime, setRoundStartTime] = useState(0); 

  // STATS
  const [reactionTimes, setReactionTimes] = useState([]); 
  const [mistakes, setMistakes] = useState(0);
  const [finalStats, setFinalStats] = useState(null);

  // REFS
  const socketRef = useRef(null);
  const totalTimerRef = useRef(null);
  const levelTimerRef = useRef(null);
  const roundTimerRef = useRef(null);

  // --- CONFIGURATION ---
  const COLORS = ['RED', 'BLUE', 'GREEN'];
  
  const LEVEL_CONFIG = {
    1: { 
        name: 'Association', rounds: 5, passScore: 80, roundLimit: null, levelDuration: null, 
        minForce: 10, desc: "Match the color shown on screen.", goal: "Get at least 4 correct." 
    },
    2: { 
        name: 'Pacing', rounds: 5, passScore: 50, roundLimit: 10, levelDuration: 180, 
        minForce: 10, desc: "You have 10 seconds per color.", goal: "Accuracy is key. Don't rush." 
    },
    3: { 
        name: 'Speed', rounds: 5, passScore: 75, roundLimit: 5, levelDuration: 150, 
        minForce: 10, desc: "Fast! React within 2 seconds.", goal: "Speed bonuses are required to pass." 
    },
    4: { 
        name: 'Strength', rounds: 5, passScore: 50, roundLimit: 5, levelDuration: 150, 
        minForce: 80, desc: "Press the pad HARD!", goal: "Focus on power, not just speed." 
    }
  };

  // --- HELPER: FORMAT TIME ---
  const formatTime = (secs) => {
    if (secs === null) return "--:--";
    if (secs < 0) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- HELPER: FULL SCREEN ---
  const triggerFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log(err));
    }
  };

  const exitFullScreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  // --- LOGIC: SAVE GAME ---
  const handleFinishGame = useCallback((completedAll = false, reason = "") => {
    clearInterval(totalTimerRef.current);
    clearInterval(levelTimerRef.current);
    clearInterval(roundTimerRef.current);
    exitFullScreen(); 
    
    const durationString = formatTime(totalSeconds);

    const avgReaction = reactionTimes.length > 0 
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
        : 0;
    
    let engagement = "Medium";
    if (avgReaction < 2.5 && mistakes < 3) engagement = "High";
    else if (avgReaction > 5.0 || mistakes > 5) engagement = "Low";

    const sessionData = {
        learner_id: learner.id,
        activity_id: 1, 
        performance_score: score,
        duration: totalSeconds,
        engagement_level: engagement
    };

    axios.post(`${API_BASE_URL}/log-session`, sessionData)
      .then(() => console.log("Session Saved"))
      .catch(err => console.error("Save Failed", err));

    setFinalStats({
        score: score,
        time: durationString,
        level: level,
        engagement: engagement,
        statusMsg: reason || (completedAll ? "Mission Accomplished! 🏆" : "Session Ended")
    });
    setGameState('FINISHED');
  }, [learner.id, level, mistakes, reactionTimes, score, totalSeconds]);

  const checkLevelPass = useCallback((finalLevelScore) => {
      const config = LEVEL_CONFIG[level];
      if (finalLevelScore >= config.passScore) {
          setGameState('LEVEL_COMPLETE');
          LEVEL_UP_SOUND.play().catch(() => {});
      } else {
          setGameState('FAILED');
      }
  }, [level]);

  const nextRound = useCallback((currentLevel, currentRound) => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(nextColor);
    setRoundStartTime(Date.now()); 
    
    const config = LEVEL_CONFIG[currentLevel];
    setMessage(currentLevel === 4 ? `Press ${nextColor} HARD!` : `Press ${nextColor}`);

    if (config.roundLimit) {
      setRoundTimeLeft(config.roundLimit);
    } else {
      setRoundTimeLeft(null);
    }
  }, []);

  const finishRound = useCallback((pointsEarned) => {
    setGameState('FEEDBACK');
    setScore(prev => prev + pointsEarned);
    setLevelScore(prev => prev + pointsEarned);

    setTimeout(() => {
      const config = LEVEL_CONFIG[level];
      if (round >= config.rounds) {
         setGameState('CHECKING_PASS'); 
      } else {
         setRound(prev => prev + 1);
         setGameState('PLAYING');
         nextRound(level, round + 1);
      }
    }, 1500);
  }, [level, round, nextRound]);

  useEffect(() => {
      if (gameState === 'CHECKING_PASS') {
          checkLevelPass(levelScore); 
      }
  }, [gameState, levelScore, checkLevelPass]);

  const handleSuccess = useCallback(() => {
    clearInterval(roundTimerRef.current);
    SUCCESS_SOUND.currentTime = 0;
    SUCCESS_SOUND.play();
    
    const reactionTimeSec = (Date.now() - roundStartTime) / 1000;
    setReactionTimes(prev => [...prev, reactionTimeSec]);

    let points = 20; 
    if (level > 1 && LEVEL_CONFIG[level].roundLimit) {
         points = 10 + Math.max(0, 10 - Math.floor(reactionTimeSec * 2));
    }

    setMessage(`Great! +${points} Pts (${reactionTimeSec.toFixed(1)}s)`);
    finishRound(points);
  }, [level, roundStartTime, finishRound]);

  const handleLevelTimeout = useCallback(() => {
      clearInterval(totalTimerRef.current);
      clearInterval(levelTimerRef.current);
      clearInterval(roundTimerRef.current);
      FAIL_SOUND.play(); 
      handleFinishGame(false, "Level Time Expired! ⏰");
  }, [handleFinishGame]);

  const handleRoundTimeout = useCallback(() => {
      clearInterval(roundTimerRef.current);
      FAIL_SOUND.play(); 
      setMessage("Too Slow! ⏳ (0 Pts)");
      setReactionTimes(prev => [...prev, 10]); 
      setMistakes(prev => prev + 1);
      finishRound(0); 
  }, [finishRound]);

  const handleInput = useCallback((data) => {
    if (gameState !== 'PLAYING' || !targetColor) return;

    const inputPad = (data.pad || data.fsr || "").toUpperCase();
    const inputForce = data.force || data.pressure || 0;
    const config = LEVEL_CONFIG[level];

    if (inputPad === targetColor) {
      if (inputForce >= config.minForce) {
        handleSuccess();
      } else {
        setMessage(`Push Harder! (Force: ${inputForce}%)`);
      }
    } else {
      WRONG_SOUND.currentTime = 0;
      WRONG_SOUND.play();
      setMessage(`Wrong! That was ${inputPad}`);
    }
  }, [gameState, targetColor, level, handleSuccess]);

  // --- 1. SETUP IOT ---
  useEffect(() => {
    socketRef.current = io(API_BASE_URL);
    socketRef.current.on('fsr_update', (data) => handleInput(data));
    return () => {
      socketRef.current.disconnect();
      clearInterval(totalTimerRef.current);
      clearInterval(levelTimerRef.current);
      clearInterval(roundTimerRef.current);
    };
  }, [handleInput]);

  // --- 2. TIMER EFFECTS ---
  useEffect(() => {
    if ((gameState === 'PLAYING' || gameState === 'FEEDBACK') && !totalTimerRef.current) {
        totalTimerRef.current = setInterval(() => {
            setTotalSeconds(prev => prev + 1);
        }, 1000);
    } else if (gameState !== 'PLAYING' && gameState !== 'FEEDBACK') {
        clearInterval(totalTimerRef.current);
        totalTimerRef.current = null;
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'PLAYING' && levelTimeLeft !== null) {
        levelTimerRef.current = setInterval(() => {
            setLevelTimeLeft(prev => {
                if (prev <= 1) {
                    handleLevelTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    } else {
        clearInterval(levelTimerRef.current);
    }
    return () => clearInterval(levelTimerRef.current);
  }, [gameState, levelTimeLeft, handleLevelTimeout]);

  useEffect(() => {
    if (gameState === 'PLAYING' && roundTimeLeft !== null) {
        roundTimerRef.current = setInterval(() => {
            setRoundTimeLeft(prev => {
                if (prev <= 1) {
                    handleRoundTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(roundTimerRef.current);
  }, [gameState, roundTimeLeft, handleRoundTimeout]);

  // --- GAME STARTUP FLOW ---
  const initGame = () => {
    setScore(0);
    setLevelScore(0);
    setLevel(1);
    setRound(1);
    setTotalSeconds(0);
    setReactionTimes([]);
    setMistakes(0);
    // 1. First step: Ask for Full Screen
    setGameState('FULLSCREEN_PROMPT');
  };

  const handleFullScreenChoice = (enable) => {
      if (enable) triggerFullScreen();
      // 2. Next step: Show Level 1 Instructions
      setGameState('INSTRUCTIONS');
  };

  const startLevelAction = () => {
      setGameState('PLAYING');
      const duration = LEVEL_CONFIG[level].levelDuration;
      setLevelTimeLeft(duration);
      nextRound(level, 1);
  };

  const proceedToNextLevel = () => {
    if (level >= 4) {
        handleFinishGame(true, "All Levels Complete!"); 
    } else {
        setLevel(prev => prev + 1);
        setLevelScore(0); 
        setRound(1);
        setGameState('INSTRUCTIONS'); 
    }
  };

  // --- UI HELPERS ---
  const getCircleStyle = () => {
    if (gameState === 'FEEDBACK') return { background: 'gold', transform: 'scale(1.1)' };
    const map = { 'RED': '#FF5252', 'BLUE': '#448AFF', 'GREEN': '#69F0AE' };
    return { 
      background: targetColor ? map[targetColor] : '#eee',
      boxShadow: `0 0 40px ${targetColor ? map[targetColor] : '#ddd'}`
    };
  };

  // --- SCREENS ---

  // 1. FULL SCREEN PROMPT (New)
  if (gameState === 'FULLSCREEN_PROMPT') {
      return (
        <div className="main-content" style={{textAlign:'center', paddingTop:'100px'}}>
             <div style={{background:'white', padding:'50px', borderRadius:'20px', display:'inline-block', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}>
                <h2 style={{color:'#2C3E50'}}>Enable Focus Mode?</h2>
                <p style={{color:'#666', marginBottom:'30px'}}>Full screen helps reduce distractions for the learner.</p>
                <div style={{display:'flex', gap:'20px', justifyContent:'center'}}>
                    <button className="action-btn" onClick={() => handleFullScreenChoice(true)} style={{background:'#27ae60'}}>
                        Yes, Full Screen
                    </button>
                    <button className="action-btn" onClick={() => handleFullScreenChoice(false)} style={{background:'#95a5a6'}}>
                        No, Windowed
                    </button>
                </div>
             </div>
        </div>
      );
  }

  // 2. INSTRUCTIONS
  if (gameState === 'INSTRUCTIONS') {
      const config = LEVEL_CONFIG[level];
      return (
        <div className="main-content" style={{textAlign:'center', paddingTop:'80px'}}>
             <div style={{background:'white', padding:'50px', borderRadius:'20px', display:'inline-block', border:'4px solid #3498DB', maxWidth:'600px'}}>
                <h2 style={{color:'#3498DB'}}>LEVEL {level}: {config.name.toUpperCase()}</h2>
                <div style={{textAlign:'left', margin:'30px 0', fontSize:'1.2rem', color:'#555'}}>
                    <p><strong>ℹ️ Instructions:</strong> {config.desc}</p>
                    <p><strong>🎯 Goal:</strong> {config.goal}</p>
                    <p><strong>🏆 Passing Score:</strong> {config.passScore} Points</p>
                    <p><strong>⏱ Time Limit:</strong> {config.levelDuration ? formatTime(config.levelDuration) : "No Limit"}</p>
                </div>
                <button className="action-btn" onClick={startLevelAction} style={{fontSize:'1.5rem', padding:'15px 40px', background:'#3498DB'}}>
                    START LEVEL ➡
                </button>
             </div>
        </div>
      );
  }

  // 3. RESULTS
  if (gameState === 'FINISHED' && finalStats) {
      return (
        <div className="main-content" style={{textAlign:'center', paddingTop:'50px'}}>
            <h1 style={{fontSize:'2.5rem', color:'#2C3E50'}}>{finalStats.statusMsg}</h1>
            <div style={{background:'white', padding:'40px', borderRadius:'20px', display:'inline-block', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px', marginBottom:'20px'}}>
                    <div><h4 style={{color:'#999'}}>TOTAL TIME</h4><h2>{finalStats.time}</h2></div>
                    <div><h4 style={{color:'#999'}}>FINAL SCORE</h4><h2 style={{color:'#F9BF15'}}>{finalStats.score}</h2></div>
                    <div style={{gridColumn:'span 2'}}>
                        <h4 style={{color:'#999'}}>ENGAGEMENT</h4>
                        <h1 style={{color: finalStats.engagement === 'High' ? '#27ae60' : finalStats.engagement === 'Medium' ? '#f39c12' : '#c0392b'}}>
                            {finalStats.engagement}
                        </h1>
                    </div>
                </div>
                <button className="action-btn" onClick={() => { exitFullScreen(); onBack(); }} style={{width:'100%'}}>Back to Dashboard</button>
            </div>
        </div>
      );
  }

  // 4. FAILED
  if (gameState === 'FAILED') {
      return (
        <div className="main-content" style={{textAlign:'center', paddingTop:'50px'}}>
             <div style={{background:'white', padding:'50px', borderRadius:'20px', display:'inline-block', border:'4px solid #E74C3C'}}>
                <h1 style={{color:'#E74C3C'}}>Session Failed 🛑</h1>
                <p>You scored {levelScore} points. Needed {LEVEL_CONFIG[level].passScore}.</p>
                <button className="action-btn" onClick={() => handleFinishGame(false)} style={{marginTop:'20px', background:'#E74C3C'}}>Finish & Save</button>
             </div>
        </div>
      );
  }

  // 5. LEVEL COMPLETE
  if (gameState === 'LEVEL_COMPLETE') {
      return (
        <div className="main-content" style={{textAlign:'center', paddingTop:'100px'}}>
             <div style={{background:'white', padding:'50px', borderRadius:'20px', display:'inline-block', border:'4px solid #4CAF50'}}>
                <h1 style={{color:'#4CAF50'}}>⭐ Level {level} Complete!</h1>
                <p>You scored {levelScore} points in this level.</p>
                {level < 4 ? (
                    <button className="action-btn" onClick={proceedToNextLevel} style={{fontSize:'1.5rem', padding:'15px 40px', marginTop:'20px'}}>
                        Next Level ➡
                    </button>
                ) : (
                    <button className="action-btn" onClick={() => handleFinishGame(true)} style={{background:'#F9BF15', color:'black', marginTop:'20px'}}>
                        🏆 Finish Game
                    </button>
                )}
             </div>
        </div>
      );
  }

  return (
    <div className="main-content" style={{textAlign: 'center', position: 'relative'}}>
      
      {/* TEST CONTROLS
      <div style={{position: 'absolute', top: '100px', left: '20px', background: 'rgba(255,255,255,0.9)', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 100, textAlign: 'left'}}>
          <h4 style={{margin:'0 0 10px 0', fontSize:'12px', color:'#999'}}>SIMULATOR</h4>
          <button onClick={() => handleInput({pad: 'RED', force: 100})} style={{display:'block', marginBottom:'5px'}}>🔴 Red</button>
          <button onClick={() => handleInput({pad: 'BLUE', force: 100})} style={{display:'block', marginBottom:'5px'}}>🔵 Blue</button>
          <button onClick={() => handleInput({pad: 'GREEN', force: 100})} style={{display:'block'}}>🟢 Green</button>
      </div> */}

      {/* HEADER */}
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between'}}>
         <div style={{textAlign:'left'}}>
            <h1 className="page-title">Color Match</h1>
            <p style={{color: '#666', margin:0}}>Level {level} | Round {round}/5</p>
         </div>
         <div style={{textAlign: 'right'}}>
           <div style={{fontSize:'14px', color:'#999'}}>⏱ Total: {formatTime(totalSeconds)}</div>
           
           <div style={{fontSize:'14px', color: levelTimeLeft !== null && levelTimeLeft < 60 ? 'red' : '#333'}}>
               Limit: {formatTime(levelTimeLeft)}
           </div>

           <h2 style={{margin:0}}>
             Score: {score} <span style={{fontSize:'16px', color:'#999'}}>/ {LEVEL_CONFIG[level].passScore}</span>
           </h2>
           {roundTimeLeft !== null && <h3 style={{color: roundTimeLeft < 3 ? '#E74C3C' : '#2C3E50'}}>⏳ {roundTimeLeft}s</h3>}
         </div>
      </div>

      {/* TARGET AREA */}
      <div style={{width: '250px', height: '250px', borderRadius: '50%', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', ...getCircleStyle()}}>
        {gameState === 'IDLE' && <button className="action-btn" onClick={initGame} style={{fontSize:'1.5rem', padding:'20px'}}>START GAME</button>}
        {gameState === 'PLAYING' && <h1 style={{color:'white', fontSize:'3rem', textShadow:'0 2px 5px rgba(0,0,0,0.5)'}}>{targetColor}</h1>}
      </div>

      {/* ROUND TIMER BAR */}
      {gameState === 'PLAYING' && roundTimeLeft !== null && (
          <div style={{width:'300px', height:'10px', background:'#eee', margin:'0 auto 20px auto', borderRadius:'5px', overflow:'hidden'}}>
              <div style={{
                  height:'100%', 
                  background: roundTimeLeft < 3 ? '#E74C3C' : '#3498DB',
                  width: `${(roundTimeLeft / LEVEL_CONFIG[level].roundLimit) * 100}%`,
                  transition: 'width 1s linear'
              }}></div>
          </div>
      )}

      <h1>{message}</h1>
      
      {/* 🛑 SMART EXIT BUTTON */}
      {gameState === 'IDLE' ? (
          <button onClick={onBack} style={{marginTop:'40px', background:'#6c757d', color:'white', border:'none', padding:'10px 20px', borderRadius:'5px', cursor:'pointer', fontSize:'14px'}}>
            Cancel & Back
          </button>
      ) : (
          <button onClick={() => handleFinishGame(false, "Session Cancelled")} style={{marginTop:'40px', background:'#ff6b6b', color:'white', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer'}}>
            End Session Early
          </button>
      )}

    </div>
  );
};

export default ColorMatchGame;