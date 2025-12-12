import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import API_BASE_URL from '../config';

// AUDIO
const SUCCESS_SOUND = new Audio('/success.mp3');
const FAIL_SOUND = new Audio('/fail.mp3');
const LEVEL_UP_SOUND = new Audio('/levelup.mp3');

const ColorMatchGame = ({ learner, onBack }) => {
  // --- STATE ---
  const [gameState, setGameState] = useState('IDLE'); // IDLE, PLAYING, FEEDBACK, LEVEL_COMPLETE, FINISHED, FAILED
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);       // Total Session Score
  const [levelScore, setLevelScore] = useState(0); // Score just for this level
  const [round, setRound] = useState(1);       // Current round (1/5)
  
  const [targetColor, setTargetColor] = useState(null);
  const [message, setMessage] = useState("Press Start to Begin");
  
  // Timers & Stats
  const [roundTimeLeft, setRoundTimeLeft] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [roundStartTime, setRoundStartTime] = useState(0); // To calculate reaction speed
  const [finalStats, setFinalStats] = useState(null);

  // IoT
  const socketRef = useRef(null);
  const roundTimerRef = useRef(null);

  // --- CONFIGURATION ---
  const COLORS = ['RED', 'BLUE', 'GREEN'];
  
  // LOGIC: Level 1 is the "Exception" (Easier, no timer bonus)
  const LEVEL_CONFIG = {
    1: { name: 'Association', rounds: 5, passScore: 50, timeLimit: null, minForce: 10, desc: "Take your time. Match 5 colors." },
    2: { name: 'Pacing',      rounds: 5, passScore: 60, timeLimit: 10,   minForce: 10, desc: "You have 10 seconds! Be quick for high scores." },
    3: { name: 'Speed',       rounds: 5, passScore: 60, timeLimit: 5,    minForce: 10, desc: "Fast! 5 seconds only." },
    4: { name: 'Strength',    rounds: 5, passScore: 60, timeLimit: 5,    minForce: 80, desc: "Press HARD within 5 seconds!" }
  };

  // --- 1. SETUP IOT ---
  useEffect(() => {
    socketRef.current = io(API_BASE_URL);
    socketRef.current.on('fsr_update', (data) => handleInput(data));
    return () => {
      socketRef.current.disconnect();
      clearInterval(roundTimerRef.current);
    };
  }, [gameState, targetColor, level]);

  // --- 2. GAME FLOW ---

  const startGame = () => {
    setScore(0);
    setLevelScore(0);
    setLevel(1);
    setRound(1);
    setSessionStartTime(Date.now());
    setGameState('PLAYING');
    nextRound(1, 1);
  };

  const nextRound = (currentLevel, currentRound) => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(nextColor);
    setRoundStartTime(Date.now()); // Mark start time for speed calculation
    
    const config = LEVEL_CONFIG[currentLevel];
    setMessage(currentLevel === 4 ? `Press ${nextColor} HARD!` : `Press ${nextColor}`);

    if (config.timeLimit) {
      startRoundTimer(config.timeLimit);
    } else {
        setRoundTimeLeft(null); // Clear timer visual for Level 1
    }
  };

  const startRoundTimer = (seconds) => {
    clearInterval(roundTimerRef.current);
    setRoundTimeLeft(seconds);
    
    roundTimerRef.current = setInterval(() => {
      setRoundTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(roundTimerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = () => {
    FAIL_SOUND.play();
    setMessage("Time's Up! ⏳ (0 Points)");
    finishRound(0); // 0 Points for timeout
  };

  // --- 3. INPUT LOGIC ---
  const handleInput = (data) => {
    if (gameState !== 'PLAYING' || !targetColor) return;

    // Normalize Data (Handle 'fsr' or 'pad')
    const inputPad = (data.pad || data.fsr || "").toUpperCase();
    const inputForce = data.force || data.pressure || 0;
    const config = LEVEL_CONFIG[level];

    // Logic: Correct Pad?
    if (inputPad === targetColor) {
      // Logic: Enough Force?
      if (inputForce >= config.minForce) {
        handleSuccess();
      } else {
        setMessage(`Push Harder! (Force: ${inputForce}%)`);
      }
    } else {
      // Wrong Pad - Optional: Just feedback, don't fail round immediately
      setMessage(`Wrong! That was ${inputPad}. Find ${targetColor}`);
    }
  };

  const handleSuccess = () => {
    clearInterval(roundTimerRef.current);
    SUCCESS_SOUND.play();
    
    // --- SCORING LOGIC ---
    let points = 0;

    if (level === 1) {
        // Level 1 EXCEPTION: Fixed 20 points per correct answer (No speed bonus)
        points = 20; 
    } else {
        // Level 2+: Speed Scoring
        // Base: 10 points. Bonus: Up to 10 extra based on speed.
        const reactionTimeSec = (Date.now() - roundStartTime) / 1000;
        points = 10;
        
        if (LEVEL_CONFIG[level].timeLimit) {
             const bonus = Math.max(0, 10 - Math.floor(reactionTimeSec * 2));
             points += bonus;
        }
    }

    setMessage(`Great! +${points} Pts`);
    finishRound(points);
  };

  const finishRound = (pointsEarned) => {
    setGameState('FEEDBACK');
    setScore(prev => prev + pointsEarned);
    setLevelScore(prev => prev + pointsEarned);

    // Wait 1.5s then decide: Next Round OR Level Complete?
    setTimeout(() => {
      const config = LEVEL_CONFIG[level];
      
      if (round >= config.rounds) {
         // LEVEL FINISHED -> CHECK PASS/FAIL
         checkLevelPass(levelScore + pointsEarned); // Pass updated score
      } else {
         // NEXT ROUND
         setRound(prev => prev + 1);
         setGameState('PLAYING');
         nextRound(level, round + 1);
      }
    }, 1500);
  };

  const checkLevelPass = (finalLevelScore) => {
      const config = LEVEL_CONFIG[level];
      
      if (finalLevelScore >= config.passScore) {
          // PASSED
          setGameState('LEVEL_COMPLETE');
          LEVEL_UP_SOUND.play().catch(() => {});
      } else {
          // FAILED -> END SESSION
          setGameState('FAILED');
      }
  };

  const proceedToNextLevel = () => {
    if (level >= 4) {
        handleFinishGame(true); // Win
    } else {
        setLevel(prev => prev + 1);
        setLevelScore(0); // Reset score tracker for new level
        setRound(1);
        setGameState('PLAYING');
        nextRound(level + 1, 1);
    }
  };

  // --- 4. END GAME & SAVE ---
  const handleFinishGame = (completedAll = false) => {
    const totalDurationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    const sessionData = {
        learner_id: learner.id,
        activity_id: 1, 
        performance_score: score,
        duration: totalDurationSeconds
    };

    axios.post(`${API_BASE_URL}/log-session`, sessionData)
      .then(() => console.log("Session Saved"))
      .catch(err => console.error("Save Failed", err));

    setFinalStats({
        score: score,
        time: totalDurationSeconds,
        level: level,
        completed: completedAll
    });
    setGameState('FINISHED');
  };

  // --- 5. RENDER UI ---
  const getCircleStyle = () => {
    if (gameState === 'FEEDBACK') return { background: 'gold', transform: 'scale(1.1)' };
    const map = { 'RED': '#FF5252', 'BLUE': '#448AFF', 'GREEN': '#69F0AE' };
    return { 
      background: targetColor ? map[targetColor] : '#eee',
      boxShadow: `0 0 40px ${targetColor ? map[targetColor] : '#ddd'}`
    };
  };

  // --- SCREENS ---

  // A. RESULTS SCREEN (FINISHED)
  if (gameState === 'FINISHED' && finalStats) {
      return (
        <div className="main-content" style={{textAlign:'center', paddingTop:'50px'}}>
            <h1 style={{fontSize:'3rem', color: finalStats.completed ? '#27ae60' : '#e67e22'}}>
                {finalStats.completed ? "Mission Accomplished! 🏆" : "Session Ended"}
            </h1>
            <div style={{background:'white', padding:'40px', borderRadius:'20px', display:'inline-block', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}>
                <h2>Total Score: <span style={{color:'#F9BF15'}}>{finalStats.score}</span></h2>
                <h3>Total Time: {finalStats.time}s</h3>
                <h3>Reached Level: {finalStats.level}</h3>
                <button className="action-btn" onClick={onBack} style={{marginTop:'30px', fontSize:'1.2rem', padding:'15px 40px'}}>
                    Back to Dashboard
                </button>
            </div>
        </div>
      );
  }

  // B. FAILED SCREEN
  if (gameState === 'FAILED') {
      return (
        <div className="main-content" style={{textAlign:'center', paddingTop:'50px'}}>
             <div style={{background:'white', padding:'50px', borderRadius:'20px', display:'inline-block', border:'4px solid #E74C3C'}}>
                <h1 style={{color:'#E74C3C'}}>Session Failed 🛑</h1>
                <h3>You scored {levelScore} points on Level {level}.</h3>
                <p>You needed {LEVEL_CONFIG[level].passScore} points to proceed.</p>
                <p style={{color:'#666', fontStyle:'italic'}}>Keep practicing to get faster!</p>
                
                <button className="action-btn" onClick={() => handleFinishGame(false)} style={{marginTop:'20px', background:'#E74C3C'}}>
                    Finish & Save Progress
                </button>
             </div>
        </div>
      );
  }

  // C. LEVEL COMPLETE MODAL
  if (gameState === 'LEVEL_COMPLETE') {
      return (
        <div className="main-content" style={{textAlign:'center', paddingTop:'80px'}}>
             <div style={{background:'white', padding:'50px', borderRadius:'20px', display:'inline-block', border:'4px solid #4CAF50'}}>
                <h1 style={{color:'#4CAF50'}}>⭐ Level {level} Complete!</h1>
                <h3>Score: {levelScore} / 100</h3>
                <p>Great job! You passed the requirement.</p>
                
                {level < 4 ? (
                    <div style={{margin:'30px 0', padding:'20px', background:'#f9f9f9', borderRadius:'10px'}}>
                        <h3>Next: Level {level + 1} ({LEVEL_CONFIG[level+1].name})</h3>
                        <p style={{color:'#666'}}>{LEVEL_CONFIG[level+1].desc}</p>
                        <button className="action-btn" onClick={proceedToNextLevel} style={{fontSize:'1.5rem', padding:'15px 40px'}}>
                            Proceed to Level {level + 1} ➡
                        </button>
                    </div>
                ) : (
                    <button className="action-btn" onClick={() => handleFinishGame(true)} style={{fontSize:'1.5rem', padding:'15px 40px', background:'#F9BF15', color:'black'}}>
                        🏆 Finish Game
                    </button>
                )}
             </div>
        </div>
      );
  }

  // D. GAME SCREEN (With Test Controls on Left/Bottom)
  return (
    <div className="main-content" style={{textAlign: 'center', position: 'relative'}}>
      
      {/* 1. TEST CONTROLS (Restored) */}
      <div style={{
          position: 'absolute', top: '100px', left: '20px', 
          background: 'rgba(255,255,255,0.9)', padding: '15px', 
          borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 100, textAlign: 'left', width: '150px'
      }}>
          <h4 style={{margin:'0 0 10px 0', fontSize:'12px', color:'#999'}}>TEST CONTROLS</h4>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
             <button onClick={() => handleInput({pad: 'RED', force: 100})} style={{background:'#ffebee', color:'#d32f2f', border:'1px solid #d32f2f', padding:'5px', borderRadius:'5px', cursor:'pointer'}}>🔴 Sim Red</button>
             <button onClick={() => handleInput({pad: 'BLUE', force: 100})} style={{background:'#e3f2fd', color:'#1976d2', border:'1px solid #1976d2', padding:'5px', borderRadius:'5px', cursor:'pointer'}}>🔵 Sim Blue</button>
             <button onClick={() => handleInput({pad: 'GREEN', force: 100})} style={{background:'#e8f5e9', color:'#388e3c', border:'1px solid #388e3c', padding:'5px', borderRadius:'5px', cursor:'pointer'}}>🟢 Sim Green</button>
          </div>
      </div>


      {/* 2. HEADER */}
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', marginLeft: '180px'}}>
         <div>
            <h1 className="page-title">Color Match</h1>
            <p style={{color: '#666', margin:0}}>Level {level}: {LEVEL_CONFIG[level]?.name}</p>
            <p style={{fontSize:'12px', color:'#999'}}>Round {round} / 5</p>
         </div>
         <div style={{textAlign: 'right'}}>
           <h2 style={{margin:0}}>Score: {score}</h2>
           {roundTimeLeft !== null && <h3 style={{color: roundTimeLeft < 3 ? '#E74C3C' : '#2C3E50'}}>⏳ {roundTimeLeft}s</h3>}
         </div>
      </div>

      {/* 3. TARGET CIRCLE */}
      <div style={{
        width: '220px', height: '220px', borderRadius: '50%',
        margin: '20px auto', transition: 'all 0.3s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...getCircleStyle()
      }}>
        {gameState === 'IDLE' && (
            <button className="action-btn" onClick={startGame} style={{fontSize:'1.5rem', padding:'20px'}}>START</button>
        )}
        {gameState === 'PLAYING' && (
            <h1 style={{color:'white', fontSize:'3rem', textShadow:'0 2px 5px rgba(0,0,0,0.5)'}}>{targetColor}</h1>
        )}
      </div>

      <h1 style={{minHeight:'40px', color:'#333'}}>{message}</h1>

      {/* Manual Exit */}
      <button onClick={() => handleFinishGame(false)} style={{marginTop:'30px', background:'#ff6b6b', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontSize:'12px'}}>
        End Session Early
      </button>

    </div>
  );
};

export default ColorMatchGame;